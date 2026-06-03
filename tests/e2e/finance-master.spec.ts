import { expect, test, type Page } from '@playwright/test';

function monitorConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function openQuickAdd(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'New entry', exact: true }).click();
  await expect(page.locator('#quick-action-menu')).toHaveClass(/active/);
  await expect(page.locator('#quick-action-menu').getByRole('button', { name: /Add transaction/ })).toBeVisible();
}

async function chooseQuickAction(page: Page, label: string | RegExp): Promise<void> {
  await page.locator('#quick-action-menu').getByRole('button', { name: label }).click();
}

async function openSettingsPage(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByText('System Preferences', { exact: true })).toBeVisible();
}

async function addExpense(page: Page, note: string, amount: string, category = ''): Promise<void> {
  await openQuickAdd(page);
  await chooseQuickAction(page, /Add transaction/);
  await expect(page.getByRole('heading', { name: 'Add expense', exact: true })).toBeVisible();
  const modal = page.locator('#modal-body');
  await modal.getByLabel('Note').fill(note);
  await modal.getByLabel('Amount').fill(amount);
  await modal.getByLabel('Account', { exact: true }).selectOption({ index: 1 });
  if (category) await modal.getByLabel('Category', { exact: true }).fill(category);
  await modal.getByRole('button', { name: 'Create', exact: true }).click();
}

async function expectDarkLocalSurfaces(page: Page, selector: string): Promise<void> {
  const samples = await page.locator(selector).evaluateAll((nodes) => nodes.slice(0, 6).map((node) => {
    const parseColor = (value: string): { r: number; g: number; b: number; a: number } => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return { r: 0, g: 0, b: 0, a: 0 };
      const parts = match[1].split(',').map((part) => Number(part.trim()));
      return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0, a: parts[3] ?? 1 };
    };
    const styles = window.getComputedStyle(node);
    const background = parseColor(styles.backgroundColor);
    const text = parseColor(styles.color);
    const backgroundLuma = (background.r * 0.2126) + (background.g * 0.7152) + (background.b * 0.0722);
    const textLuma = (text.r * 0.2126) + (text.g * 0.7152) + (text.b * 0.0722);
    return { backgroundAlpha: background.a, backgroundLuma, textLuma };
  }));
  expect(samples.length).toBeGreaterThan(0);
  for (const sample of samples) {
    expect(sample.backgroundAlpha < 0.5 || sample.backgroundLuma < 110).toBe(true);
    expect(sample.textLuma).toBeGreaterThan(120);
  }
}

test('grouped navigation exposes every finance workspace section', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await expect(page.locator('[data-fin-nav]')).toHaveCount(10);
  await expect(page.locator('#fin-content-area .fin-section-nav')).toHaveCount(0);

  for (const [button, heading] of [
    ['Overview', 'Overview'],
    ['Transactions', 'Transactions'],
    ['Income', 'Income'],
    ['Cashflow', 'Cashflow'],
    ['Monthly Review', 'Monthly Review'],
    ['Reserves', 'Reserves'],
    ['Obligations', 'Obligations'],
    ['Reports', 'Reports'],
    ['Import & Backup', 'Import & Backup'],
    ['Settings', 'Settings'],
  ] as const) {
    await page.getByRole('button', { name: button, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('roadmap section aliases keep persisted navigation compatible', async ({ page }) => {
  const errors = monitorConsole(page);
  for (const [stored, heading] of [
    ['income', 'Income'],
    ['cashflow', 'Cashflow'],
    ['obligations', 'Obligations'],
  ] as const) {
    await page.goto('/');
    await page.evaluate((value) => window.localStorage.setItem('finance-master.layout.active-section', value), stored);
    await page.reload();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.locator('#primary-finance-navigation').getByRole('button', { name: heading, exact: true })).toHaveClass(/active/);
  }
  expect(errors).toEqual([]);
});

test('overview prioritizes the money picture cockpit', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  const content = page.locator('#fin-content-area');
  await expect(content.getByText('Money Picture', { exact: true })).toBeVisible();
  await expect(content.getByText('Cash Structure', { exact: true })).toBeVisible();
  await expect(content.getByText('Burn Pressure', { exact: true })).toBeVisible();
  await expect(content.getByText('Today’s Financial Decision', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Next Actions', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Attention Queue', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Runway', { exact: true }).first()).toBeVisible();
  await expect(content.getByText('Monthly burn', { exact: true }).first()).toBeVisible();
  await expect(content.getByText('Total cash', { exact: true })).toBeVisible();
  await expect(content.getByText('Available', { exact: true })).toBeVisible();
  await expect(content.getByText('Protected', { exact: true })).toBeVisible();
  await expect(content.getByText('30-Day Result', { exact: true })).toBeVisible();
  await expect(content.getByText('Projected month-end', { exact: true })).toBeVisible();
  await expect(content.getByLabel('30-day cash movement trend')).toBeVisible();
  await expect(content.getByRole('button', { name: 'Open Cash Movement', exact: true })).toBeVisible();

  const order = await content.evaluate((root) => {
    const labels = ['Money Picture', 'Cash Structure', 'Burn Pressure', 'Open Cash Movement'];
    return labels.map((label) => root.textContent?.indexOf(label) ?? -1);
  });
  expect(order.every((value) => value >= 0)).toBe(true);
  expect(order).toEqual([...order].sort((a, b) => a - b));

  await expect(content.locator('[data-fin-explainer]')).toHaveCount(0);

  await content.getByRole('button', { name: 'Open Cash Movement', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Transactions', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('floating quick add opens a lightweight action menu with focused creation entry points', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await openQuickAdd(page);
  await expect(page.getByRole('heading', { name: 'New Entry', exact: true })).toHaveCount(0);
  for (const label of [/Add transaction/, /Add expected income/, /Add obligation/, /Add reserve/, /Add payment plan/, /Import CSV/]) {
    await expect(page.locator('#quick-action-menu').getByRole('button', { name: label })).toBeVisible();
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#quick-action-menu')).not.toHaveClass(/active/);

  await openQuickAdd(page);
  await page.mouse.click(10, 10);
  await expect(page.locator('#quick-action-menu')).not.toHaveClass(/active/);

  await openQuickAdd(page);
  await chooseQuickAction(page, /Add transaction/);
  await page.getByLabel('Type').selectOption('transfer');
  await expect(page.getByRole('heading', { name: 'Add transfer', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  for (const [label, heading] of [
    [/Add expected income/, 'Add income'],
    [/Add obligation/, 'Add recurring cost'],
    [/Add reserve/, 'Add reserve bucket'],
    [/Add payment plan/, 'Add debt payment plan'],
    [/Import CSV/, 'Import transactions from CSV'],
  ] as const) {
    await openQuickAdd(page);
    await chooseQuickAction(page, label);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);
});

test('transactions page is the primary ledger workspace', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await addExpense(page, 'Ledger workspace review seed', '8.25');
  await page.getByRole('button', { name: 'Transactions', exact: true }).click();

  const workspace = page.locator('.fin-ledger-workspace-card');
  await expect(page.getByText('Ledger Workspace', { exact: true })).toBeVisible();
  await expect(page.getByText('Review cash movement, classify records, and inspect evidence when needed.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Search ledger')).toBeVisible();
  await expect(workspace.locator('.fin-status-grid')).toHaveCount(0);
  await expect(workspace.getByText('Records', { exact: true })).toBeVisible();
  await expect(workspace.getByText('Net movement', { exact: true })).toBeVisible();
  await expect(workspace.getByText('Need review', { exact: true })).toBeVisible();
  await expect(workspace.getByText('Matched payments', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ledger', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Review', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Audit', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open ledger', exact: true })).toHaveCount(0);

  await expect(page.getByLabel('Transaction inspector')).toBeVisible();
  await workspace.locator('.fin-transaction-row').filter({ hasText: 'Ledger workspace review seed' }).getByRole('button', { name: 'Inspect transaction', exact: true }).click();
  await expect(page.getByLabel('Transaction inspector').getByText('Ledger workspace review seed', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Transaction inspector').getByText('Record ID', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Transaction inspector').getByText('Evidence', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'More filters', exact: true }).click();
  await expect(page.getByLabel('Filter ledger by type')).toBeVisible();
  await page.getByLabel('Filter ledger by category').fill('software');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByLabel('Active ledger filters').getByText('Category: software', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();

  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await expect(page.locator('.fin-review-summary-line')).toContainText('need category');
  await expect(page.locator('.fin-review-summary-line')).toContainText('filtered records');
  await expect(page.getByRole('button', { name: 'Edit transaction review', exact: true }).first()).toBeVisible();
  await expect(page.getByLabel('Transaction inspector').getByRole('button', { name: 'Reverse transaction', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('ledger filters and inline categorization work without a full-ledger modal', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await addExpense(page, 'Software reference subscription', '8.50', 'software');
  await addExpense(page, 'Software cleanup item', '24.50');
  await expect.poll(() => page.evaluate(() => (
    window.localStorage.getItem('finance-master.ledger.v1') || ''
  ).includes('Software cleanup item'))).toBe(true);

  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await page.getByLabel('Search ledger').fill('Software cleanup item');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.locator('.fin-tab-panel .fin-transaction-row').filter({ hasText: 'Software cleanup item' })).toBeVisible();

  await page.getByRole('button', { name: 'Review', exact: true }).click();
  const row = page.locator('.fin-transaction-row--review').filter({ hasText: 'Software cleanup item' });
  await row.getByRole('button', { name: 'Edit transaction review', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Categorize transaction', exact: true })).toBeVisible();
  await expect(page.getByText('Suggested categories', { exact: true })).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'software', exact: true }).click();
  await expect(page.locator('#modal-body').getByLabel('Category', { exact: true })).toHaveValue('software');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('#fin-content-area').getByText('software', { exact: true }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('ledger review suggests obligation matches without applying them automatically', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await addExpense(page, 'Living payment', '1120', 'obligation');
  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await page.getByRole('button', { name: 'Review', exact: true }).click();

  const row = page.locator('.fin-transaction-row--review').filter({ hasText: 'Living payment' });
  await expect(row).toContainText('suggested Living');
  await row.getByRole('button', { name: 'Inspect transaction', exact: true }).click();
  await expect(page.getByLabel('Transaction inspector').getByText('Suggested match', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Transaction inspector').getByText('Living', { exact: true }).first()).toBeVisible();
  await page.getByLabel('Transaction inspector').getByRole('button', { name: 'Edit payment match', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Match payment to obligation', exact: true })).toBeVisible();
  await expect(page.getByText('Suggested matches', { exact: true })).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'Living', exact: true }).first().click();
  await expect(page.locator('#modal-match-obligation-id')).not.toHaveValue('');
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinancialReadModel().transactions
      .find((entry: any) => String(entry.description) === 'Living payment')?.obligationId || ''
  ))).toBe('');
  expect(errors).toEqual([]);
});

test('empty ledger can create and persist the first manual transaction', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.evaluate(() => {
    window.Store.deleteSampleData();
    window.FinancialMode?.render?.();
  });
  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await expect(page.locator('#fin-content-area').getByText('Records', { exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area').getByText('0', { exact: true }).first()).toBeVisible();

  await openQuickAdd(page);
  await chooseQuickAction(page, /Add transaction/);
  const modal = page.locator('#modal-body');
  await expect(modal.getByLabel('Account', { exact: true })).toContainText('Operating cash (created on save)');
  await modal.getByLabel('Note').fill('First empty-ledger expense');
  await modal.getByLabel('Amount').fill('12.34');
  await modal.getByRole('button', { name: 'Create', exact: true }).click();

  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await expect(page.locator('.fin-tab-panel .fin-transaction-row').filter({ hasText: 'First empty-ledger expense' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (
    window.localStorage.getItem('finance-master.ledger.v1') || ''
  ).includes('First empty-ledger expense'))).toBe(true);
  await page.reload();
  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await expect(page.locator('.fin-tab-panel .fin-transaction-row').filter({ hasText: 'First empty-ledger expense' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('stale deleted demo flag cannot keep the deployed app empty after reload', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.evaluate(async () => {
    window.Store.deleteSampleData();
    window.localStorage.setItem('finance-master.demo-seeded.v1', 'deleted');
    window.localStorage.setItem('finance-master.ledger.v1', '[]');
    await new Promise<void>((resolve) => {
      const request = window.indexedDB.deleteDatabase('finance-master');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });
  await page.reload();
  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.Store.getFinanceLedger().length)).toBeGreaterThan(0);
  await expect(page.locator('#fin-content-area').getByText('Audit log is clean.', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('repair query parameter cannot delete local finance data', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await addExpense(page, 'Repair query must preserve this expense', '19.00', 'software');
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinanceLedger().some((event) => JSON.stringify(event).includes('Repair query must preserve this expense'))
  ))).toBe(true);

  await page.goto('/?repair=demo');
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinanceLedger().some((event) => JSON.stringify(event).includes('Repair query must preserve this expense'))
  ))).toBe(true);
  expect(errors).toEqual([]);
});

test('income exposes open, settled, and all income views', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Income', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Income', exact: true })).toBeVisible();
  await expect(page.getByText('Expected and settled income records.', { exact: false })).toBeVisible();
  await expect(page.getByText('Confirmed', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Likely', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Uncertain', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Settled', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Settled', exact: true })).toHaveClass(/active/);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveClass(/active/);
  expect(errors).toEqual([]);
});

test('CSV import previews accepted, duplicate, and rejected rows and remains reversible', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await openQuickAdd(page);
  await chooseQuickAction(page, /Import CSV/);
  await page.locator('#modal-csv-file').setInputFiles({
    name: 'release-bank.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from([
      'date,description,amount,category,scope',
      '2026-06-01,Release deposit,500,client-income,business',
      '2026-06-02,Release tools,-45,software,business',
      '2026-06-02,Release tools,-45,software,business',
      'bad-date,Broken row,-10,software,business',
    ].join('\n')),
  });
  await expect(page.getByText('Detected columns · Comma separated')).toBeVisible();
  await page.getByLabel('Destination account').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(page.getByText('2 accepted', { exact: true })).toBeVisible();
  await expect(page.getByText('1 duplicate', { exact: true })).toBeVisible();
  await expect(page.getByText('1 rejected', { exact: true })).toBeVisible();
  await expect(page.getByText('Duplicate handling', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Skip duplicates')).toBeChecked();
  await page.getByRole('button', { name: 'Import valid rows', exact: true }).click();
  await expect(page.getByText('Imported 2 rows', { exact: false })).toBeVisible();
  await expect(page.getByText('Saved mapping: release-bank.csv', { exact: true })).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();

  await openQuickAdd(page);
  await chooseQuickAction(page, /Import CSV/);
  await page.locator('#modal-csv-file').setInputFiles({
    name: 'followup-bank.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from([
      'date,description,amount,category,scope',
      '2026-06-04,Followup tools,-32,software,business',
    ].join('\n')),
  });
  await expect(page.getByText('Saved mapping: release-bank.csv', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Destination account')).not.toHaveValue('');
  await page.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(page.getByText('1 accepted', { exact: true })).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();

  await openQuickAdd(page);
  await chooseQuickAction(page, /Import CSV/);
  await page.locator('#modal-csv-file').setInputFiles({
    name: 'duplicate-bank.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from([
      'date,description,amount,category,scope',
      '2026-06-01,Release deposit,500,client-income,business',
    ].join('\n')),
  });
  await page.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(page.getByText('0 accepted', { exact: true })).toBeVisible();
  await expect(page.getByText('1 duplicate', { exact: true })).toBeVisible();
  await page.getByLabel('Import duplicates anyway').check();
  await page.getByRole('button', { name: 'Import valid rows', exact: true }).click();
  await expect(page.getByText('Imported 1 row · included 1 duplicate', { exact: false })).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();

  await page.getByRole('button', { name: 'Import & Backup', exact: true }).click();
  await expect(page.getByText('Latest CSV batch', { exact: true })).toBeVisible();
  await expect(page.getByText('duplicate-bank.csv', { exact: false })).toBeVisible();
  await expect(page.getByText('1 imported · 1 duplicate (duplicates imported) · 0 rejected', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Undo CSV import', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Undo import', exact: true })).toBeDisabled();
  await page.getByLabel('Type UNDO CSV IMPORT to continue').fill('UNDO CSV IMPORT');
  await page.getByRole('button', { name: 'Undo import', exact: true }).click();
  await expect(page.getByText('Saved CSV profiles', { exact: true })).toBeVisible();
  const profileName = page.getByLabel('CSV profile name').first();
  await expect(profileName).toHaveValue(/bank\.csv$/);
  const savedProfileName = await profileName.inputValue();
  await profileName.fill('Studio bank CSV');
  await page.getByRole('button', { name: `Rename ${savedProfileName}`, exact: true }).click();
  await expect(page.getByLabel('CSV profile name').first()).toHaveValue('Studio bank CSV');
  await page.getByRole('button', { name: 'Delete Studio bank CSV', exact: true }).click();
  await expect(page.getByLabel('CSV profile name')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('backup restore uses a validated in-app preview and rejects malformed JSON', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Import & Backup', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Import & Backup', exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup', exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();

  await page.getByRole('button', { name: 'Restore backup', exact: true }).first().click();
  await page.locator('#modal-backup-file').setInputFiles(path as string);
  await expect(page.getByRole('heading', { name: 'Restore Finance Master backup' })).toBeVisible();
  const restoreModal = page.locator('#modal-body');
  await expect(restoreModal.getByText('Backup version', { exact: true })).toBeVisible();
  await expect(restoreModal.getByText('Schema', { exact: true })).toBeVisible();
  await expect(restoreModal.getByText('Ledger events', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replace current data', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Replace local finance data', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Replace current data', exact: true })).toBeDisabled();
  await page.getByLabel('Type RESTORE LOCAL FINANCE DATA to continue').fill('RESTORE LOCAL FINANCE DATA');
  await page.getByRole('button', { name: 'Replace current data', exact: true }).click();

  await page.getByRole('button', { name: 'Import & Backup', exact: true }).click();
  await page.getByRole('button', { name: 'Restore backup', exact: true }).first().click();
  await page.locator('#modal-backup-file').setInputFiles({
    name: 'invalid-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{not-json'),
  });
  await expect(page.getByText('This backup cannot be restored', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Replace current data', exact: true })).toBeDisabled();
  expect(errors).toEqual([]);
});

test('local data safety and appearance controls live on pages', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Import & Backup', exact: true }).click();
  await expect(page.getByText('Local Data Health', { exact: true })).toBeVisible();
  await expect(page.getByText('Local finance data is readable and backup-ready.', { exact: true })).toBeVisible();
  await expect(page.getByText('Storage', { exact: true })).toBeVisible();
  await expect(page.getByText('Last backup', { exact: true })).toBeVisible();
  await expect(page.getByText('Schema', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset local data', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset local data', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Reset local finance data', exact: true })).toBeVisible();
  const resetModal = page.locator('#modal-body');
  await expect(resetModal.getByRole('button', { name: 'Reset local data', exact: true })).toBeDisabled();
  await page.getByLabel('Type DELETE LOCAL FINANCE DATA to continue').fill('DELETE LOCAL FINANCE DATA'.slice(0, -1));
  await expect(resetModal.getByRole('button', { name: 'Reset local data', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();

  for (const mode of ['aurora', 'midnight', 'bright']) {
    await openSettingsPage(page);
    const settingsContent = page.locator('#fin-content-area');
    await expect(settingsContent.getByRole('button', { name: 'Add recurring cost', exact: true })).toHaveCount(0);
    await expect(settingsContent.getByRole('button', { name: 'Add debt', exact: true })).toHaveCount(0);
    await expect(settingsContent.getByRole('button', { name: 'Add reserve bucket', exact: true })).toHaveCount(0);
    await expect(settingsContent.getByRole('button', { name: 'Add expected income', exact: true })).toHaveCount(0);
    await expect(settingsContent.getByRole('button', { name: 'Import CSV', exact: true })).toHaveCount(0);
    await expect(settingsContent.getByRole('button', { name: /Start review|Open review/ })).toHaveCount(0);
    await page.getByLabel('Appearance').selectOption(mode);
    await page.getByRole('button', { name: 'Apply preferences', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-appearance', mode);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-appearance', mode);
  }
  expect(errors).toEqual([]);
});

test('midnight mode keeps ledger and monthly review surfaces readable', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await openSettingsPage(page);
  await page.getByLabel('Appearance').selectOption('midnight');
  await page.getByRole('button', { name: 'Apply preferences', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'midnight');

  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await expect(page.getByText('Ledger Workspace', { exact: true })).toBeVisible();
  await expectDarkLocalSurfaces(page, '.fin-ledger-status-strip > div');
  await expect(page.getByRole('button', { name: 'Inspect transaction', exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Monthly Review', exact: true }).click();
  await expect(page.getByText(/Monthly review (due|current)/).first()).toBeVisible();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expectDarkLocalSurfaces(page, '.fin-monthly-review-panel');
  await expectDarkLocalSurfaces(page, '.fin-review-check-row');
  expect(errors).toEqual([]);
});

test('review queue actions categorize, match, update pipeline, and add debt plans', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');

  await addExpense(page, 'Review uncategorized', '12');
  await addExpense(page, 'Matchable rent payment', '300', 'obligation');

  await page.getByRole('button', { name: 'Monthly Review', exact: true }).click();
  await expect(page.getByText('Review Queue', { exact: true })).toBeVisible();

  const categorizeRow = page.locator('.fin-review-row').filter({ hasText: 'Review uncategorized' });
  await categorizeRow.getByRole('button', { name: 'Edit transaction review', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Categorize transaction', exact: true })).toBeVisible();
  await page.getByLabel('Category').fill('');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a transaction category');
  await page.getByLabel('Category').fill('software');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.fin-review-row').filter({ hasText: 'Review uncategorized' }).filter({ hasText: 'software' }).first()).toBeVisible();

  const paymentRow = page.locator('.fin-review-row').filter({ hasText: 'Matchable rent payment' });
  await paymentRow.getByRole('button', { name: 'Edit payment match', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Match payment to obligation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a payment and an obligation');
  await page.locator('#modal-match-obligation-id').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.fin-review-row').filter({ hasText: 'Matchable rent payment' }).getByText('Paid', { exact: true }).first()).toBeVisible();

  const pipelineRow = page.locator('.fin-review-row').filter({ hasText: 'Risky income assumption' }).first();
  await pipelineRow.getByRole('button', { name: 'Edit income review', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review pipeline item', exact: true })).toBeVisible();
  await page.getByLabel('Status').selectOption('expected');
  await page.getByLabel('Probability').fill('0.75');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.fin-review-row').filter({ hasText: 'Risky income assumption' })).toHaveCount(0);

  const debtRow = page.locator('.fin-review-row').filter({ hasText: 'Debt needs a due date or payment plan' }).first();
  await debtRow.getByRole('button', { name: 'Edit payment plan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add debt payment plan', exact: true })).toBeVisible();
  await page.getByLabel('Next due date').fill('2026-07-15');
  await page.getByLabel('Minimum payment').fill('150');
  await page.getByLabel('Payment plan note').fill('Monthly minimum agreed.');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add debt payment plan', exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('mobile and tablet capture surfaces avoid horizontal overflow', async ({ page }) => {
  const errors = monitorConsole(page);
  for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await openQuickAdd(page);
    await chooseQuickAction(page, /Add transaction/);
    await expect(page.getByLabel('Note')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);
});

test('mobile navigation opens from a hamburger menu and closes after selection', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menuToggle = page.locator('[data-action="FinancialMode.toggleMobileNav"]');
  const sidebar = page.locator('.finance-master-sidebar');
  await expect(menuToggle).toBeVisible();
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
  expect(await sidebar.evaluate((element) => element.getBoundingClientRect().left < 0)).toBe(true);

  await menuToggle.click();
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(sidebar).not.toHaveAttribute('aria-hidden', 'true');
  await expect.poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().left >= 0)).toBe(true);

  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Transactions', exact: true })).toBeVisible();
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().left < 0)).toBe(true);

  await menuToggle.click();
  await page.getByRole('button', { name: 'Obligations', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Obligations', exact: true })).toBeVisible();
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('savings goal progress and weekly reconciliation complete the operating ritual', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Monthly Review', exact: true }).click();
  await expect(page.getByText('Monthly review due', { exact: true })).toBeVisible();

  await openQuickAdd(page);
  await chooseQuickAction(page, /Add transaction/);
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();
  await openQuickAdd(page);
  await chooseQuickAction(page, /Add reserve/);
  await expect(page.getByRole('heading', { name: /reserve bucket/i })).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(page.getByText('Cash accounts', { exact: true })).toBeVisible();
  await expect(page.getByText('Review steps', { exact: true })).toBeVisible();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await page.getByRole('button', { name: 'Close month', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Confirm each account');
  for (const checkbox of await page.locator('.monthly-review-account-check').all()) {
    await checkbox.check();
  }
  for (const id of [
    'monthly-review-unresolvedItems',
    'monthly-review-matchPayments',
    'monthly-review-confirmObligations',
    'monthly-review-reviewSignals',
    'monthly-review-closeMonth',
  ]) {
    await page.locator(`#${id}`).check();
  }
  await page.locator('#monthly-review-notes').fill('Balances reconciled for release week.');
  await page.getByRole('button', { name: 'Close month', exact: true }).click();
  await expect(page.getByText('Monthly review current', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
