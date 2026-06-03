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
  await expect(page.getByRole('heading', { name: 'New Entry', exact: true })).toBeVisible();
}

async function openSettingsPage(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByText('System Preferences', { exact: true })).toBeVisible();
}

async function addExpense(page: Page, note: string, amount: string, category = ''): Promise<void> {
  await openQuickAdd(page);
  await page.getByRole('button', { name: /Add transaction/ }).click();
  await expect(page.getByRole('heading', { name: 'Add expense', exact: true })).toBeVisible();
  await page.getByLabel('Note').fill(note);
  await page.getByLabel('Amount').fill(amount);
  await page.getByLabel('Account').selectOption({ index: 1 });
  if (category) await page.getByLabel('Category').fill(category);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
}

test('grouped navigation exposes every finance workspace section', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await expect(page.locator('[data-fin-nav]')).toHaveCount(10);
  await expect(page.locator('#fin-content-area .fin-section-nav')).toHaveCount(0);

  for (const [button, heading] of [
    ['Overview', 'Overview'],
    ['Transactions', 'Transactions'],
    ['Invoices', 'Invoices'],
    ['Cashflow Plan', 'Cashflow Plan'],
    ['Monthly Review', 'Monthly Review'],
    ['Cash & Reserves', 'Cash & Reserves'],
    ['Fixed Costs & Debt', 'Fixed Costs & Debt'],
    ['Reports', 'Reports'],
    ['Import & Backup', 'Import & Backup'],
    ['Settings', 'Settings'],
  ] as const) {
    await page.getByRole('button', { name: button, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('overview prioritizes runway, cash safety, attention, and 30-day confidence', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  const content = page.locator('#fin-content-area');
  await expect(content.getByText('Runway', { exact: true }).first()).toBeVisible();
  await expect(content.getByText('Monthly burn', { exact: true }).first()).toBeVisible();
  await expect(content.getByText('Total Cash', { exact: true })).toBeVisible();
  await expect(content.getByText('Available', { exact: true }).first()).toBeVisible();
  await expect(content.getByText('Protected', { exact: true }).first()).toBeVisible();
  await expect(content.getByText('Attention Queue', { exact: true })).toBeVisible();
  await expect(content.getByText('30-Day Outlook', { exact: true })).toBeVisible();
  await expect(content.getByText('Forecast Confidence', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('floating quick add exposes focused creation entry points', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await openQuickAdd(page);
  for (const label of [
    /Add transaction/,
    /Add invoice \/ expected income/,
    /Add recurring cost/,
    /Add debt/,
    /Add reserve bucket/,
    /Import local CSV/,
  ]) {
    await expect(page.getByRole('button', { name: label })).toBeVisible();
  }
  await page.getByRole('button', { name: /Add transaction/ }).click();
  await page.getByLabel('Type').selectOption('transfer');
  await expect(page.getByRole('heading', { name: 'Add transfer', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('transactions page is the primary ledger workspace', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Transactions', exact: true }).click();

  await expect(page.getByText('A full page ledger workspace', { exact: false })).toBeVisible();
  await expect(page.getByLabel('Search ledger')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clean View', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Work View', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Audit View', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open ledger', exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Work View', exact: true }).click();
  await expect(page.getByText('Needs category', { exact: true })).toBeVisible();
  await expect(page.getByText('Unmatched payments', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Categorize', exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Audit View', exact: true }).click();
  await expect(page.getByText('ID / source', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reverse', exact: true }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('ledger filters and inline categorization work without a full-ledger modal', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await addExpense(page, 'Ledger page cleanup item', '24.50');
  await expect.poll(() => page.evaluate(() => (
    window.localStorage.getItem('finance-master.ledger.v1') || ''
  ).includes('Ledger page cleanup item'))).toBe(true);

  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await page.getByLabel('Search ledger').fill('Ledger page cleanup item');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.locator('#fin-content-area').getByText('Ledger page cleanup item', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Work View', exact: true }).click();
  const row = page.locator('tr').filter({ hasText: 'Ledger page cleanup item' });
  await row.getByRole('button', { name: 'Categorize', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Categorize transaction', exact: true })).toBeVisible();
  await page.locator('#modal-body').getByLabel('Category', { exact: true }).fill('software');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('#fin-content-area').getByText('software', { exact: true }).first()).toBeVisible();
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
  await expect(page.locator('#fin-content-area').getByText('Total records', { exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area').getByText('0', { exact: true }).first()).toBeVisible();

  await openQuickAdd(page);
  await page.getByRole('button', { name: /Add transaction/ }).click();
  await expect(page.getByLabel('Account')).toContainText('Operating cash (created on save)');
  await page.getByLabel('Note').fill('First empty-ledger expense');
  await page.getByLabel('Amount').fill('12.34');
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await expect(page.locator('#fin-content-area').getByText('First empty-ledger expense', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (
    window.localStorage.getItem('finance-master.ledger.v1') || ''
  ).includes('First empty-ledger expense'))).toBe(true);
  await page.reload();
  await page.getByRole('button', { name: 'Transactions', exact: true }).click();
  await expect(page.locator('#fin-content-area').getByText('First empty-ledger expense', { exact: true })).toBeVisible();
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

test('invoices expose open, settled, and all income views', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Invoices', exact: true }).click();
  await expect(page.getByText('Income & Invoices', { exact: true })).toBeVisible();
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
  await page.getByRole('button', { name: /Import local CSV/ }).click();
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
  await page.getByRole('button', { name: 'Import valid rows', exact: true }).click();
  await expect(page.getByText('Imported 2 rows', { exact: false })).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Import & Backup', exact: true }).click();
  await expect(page.getByText('Latest CSV batch', { exact: true })).toBeVisible();
  await expect(page.getByText('release-bank.csv', { exact: false })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
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
  await expect(page.getByText('Backup version', { exact: true })).toBeVisible();
  await expect(page.getByText('Schema', { exact: true })).toBeVisible();
  await expect(page.getByText('Ledger events', { exact: true })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
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
  await expect(page.getByRole('button', { name: 'Reset local data', exact: true })).toBeVisible();

  for (const mode of ['aurora', 'midnight', 'bright']) {
    await openSettingsPage(page);
    await page.getByLabel('Appearance').selectOption(mode);
    await page.getByRole('button', { name: 'Apply preferences', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-appearance', mode);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-appearance', mode);
  }
  expect(errors).toEqual([]);
});

test('review queue actions categorize, match, update pipeline, and add debt plans', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');

  await addExpense(page, 'Review uncategorized', '12');
  await addExpense(page, 'Matchable rent payment', '300', 'obligation');

  await page.getByRole('button', { name: 'Monthly Review', exact: true }).click();
  await expect(page.getByText('Review Queue', { exact: true })).toBeVisible();

  const categorizeRow = page.locator('.modal-list-row').filter({ hasText: 'Review uncategorized' });
  await categorizeRow.getByRole('button', { name: 'Categorize', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Categorize transaction', exact: true })).toBeVisible();
  await page.getByLabel('Category').fill('');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a transaction category');
  await page.getByLabel('Category').fill('software');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-list-row').filter({ hasText: 'Review uncategorized' }).filter({ hasText: 'software' }).first()).toBeVisible();

  const paymentRow = page.locator('.modal-list-row').filter({ hasText: 'Matchable rent payment' });
  await paymentRow.getByRole('button', { name: 'Match', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Match payment to obligation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a payment and an obligation');
  await page.locator('#modal-match-obligation-id').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-list-row').filter({ hasText: 'Matchable rent payment' }).getByText('Paid', { exact: true }).first()).toBeVisible();

  const pipelineRow = page.locator('.modal-list-row').filter({ hasText: 'Risky income assumption' }).first();
  await pipelineRow.getByRole('button', { name: 'Update', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review pipeline item', exact: true })).toBeVisible();
  await page.getByLabel('Status').selectOption('expected');
  await page.getByLabel('Probability').fill('0.75');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-list-row').filter({ hasText: 'Risky income assumption' })).toHaveCount(0);

  const debtRow = page.locator('.modal-list-row').filter({ hasText: 'Debt needs a due date or payment plan' }).first();
  await debtRow.getByRole('button', { name: 'Add plan', exact: true }).click();
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
    await page.getByRole('button', { name: /Add transaction/ }).click();
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
  expect(errors).toEqual([]);
});

test('savings goal progress and weekly reconciliation complete the operating ritual', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Monthly Review', exact: true }).click();
  await expect(page.getByText('Monthly review due', { exact: true })).toBeVisible();

  await openQuickAdd(page);
  await page.getByRole('button', { name: /Add transaction/ }).click();
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();
  await openQuickAdd(page);
  await page.getByRole('button', { name: /Add reserve bucket/ }).click();
  await expect(page.getByRole('heading', { name: /reserve bucket/i })).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: /Start review|Open review/ }).first().click();
  for (const checkbox of await page.locator('.review-account-check').all()) {
    await checkbox.check();
  }
  for (const id of [
    'modal-review-unresolvedItems',
    'modal-review-matchPayments',
    'modal-review-confirmObligations',
    'modal-review-reviewSignals',
    'modal-review-closeMonth',
  ]) {
    await page.locator(`#${id}`).check();
  }
  await page.getByLabel('Review notes').fill('Balances reconciled for release week.');
  await page.getByRole('button', { name: 'Mark review complete', exact: true }).click();
  await expect(page.getByText('Monthly review current', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
