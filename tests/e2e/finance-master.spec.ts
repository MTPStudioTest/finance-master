import { expect, test, type Page } from '@playwright/test';

function monitorConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function openSettings(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Open settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Finance Master settings' })).toBeVisible();
}

test('grouped navigation exposes every finance workspace section', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await expect(page.locator('[data-fin-nav]')).toHaveCount(6);
  await expect(page.locator('#fin-content-area .fin-section-nav')).toHaveCount(0);
  for (const [button, heading] of [
    ['Dashboard', 'Finance Observatory'],
    ['Ledger', 'Ledger'],
    ['Planning', 'Planning'],
    ['Review', 'Review'],
    ['Data', 'Data'],
    ['Settings', 'Settings'],
  ] as const) {
    await page.getByRole('banner').getByRole('button', { name: button, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true }).or(page.getByText(heading, { exact: true }).first())).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('daily capture supports keyboard focus, focus trap, Escape, and focus restoration', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  const add = page.getByRole('button', { name: '+ Add', exact: true });
  await add.click();
  await page.locator(".quick-add-card[data-action-args=\"'transaction'\"]").click();
  await expect(page.getByLabel('Note')).toBeFocused();
  await page.getByLabel('Note').fill('Test capture');
  await page.getByLabel('Amount').fill('-24.50');
  await page.getByLabel('Account').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await page.getByRole('button', { name: 'Ledger', exact: true }).click();
  await page.getByRole('button', { name: 'Open ledger', exact: true }).click();
  await expect(page.getByLabel('Transactions').getByText('Test capture', { exact: true })).toBeVisible();
  await page.locator('[data-action="closeModal"]').click();

  const review = page.getByRole('banner').getByRole('button', { name: 'Review', exact: true });
  await review.click();
  const reviewLauncher = page.getByRole('button', { name: /Start review|Open review/ }).first();
  await reviewLauncher.click();
  await page.getByRole('button', { name: 'Mark review complete', exact: true }).press('Tab');
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(reviewLauncher).toBeFocused();
  expect(errors).toEqual([]);
});

test('CSV file import previews accepted, duplicate, and rejected rows and remains reversible', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.getByRole('button', { name: '+ Add', exact: true }).click();
  await page.locator(".quick-add-card[data-action-args=\"'csvImport'\"]").click();
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
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Data', exact: true }).click();
  await expect(page.getByText('Latest CSV batch', { exact: true })).toBeVisible();
  await expect(page.getByText('release-bank.csv', { exact: false })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  expect(errors).toEqual([]);
});

test('backup restore uses a validated in-app preview and rejects malformed JSON', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await openSettings(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON backup', exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();

  await page.locator('#modal-backup-file').setInputFiles(path as string);
  await expect(page.getByRole('heading', { name: 'Restore Finance Master backup' })).toBeVisible();
  await expect(page.getByText('Ledger events', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replace current data', exact: true }).click();
  await openSettings(page);
  await page.locator('#modal-backup-file').setInputFiles({
    name: 'invalid-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{not-json'),
  });
  await expect(page.getByText('This backup cannot be restored', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Replace current data', exact: true })).toBeDisabled();
  expect(errors).toEqual([]);
});

test('sample deletion reveals onboarding and sample restore returns the dashboard', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await openSettings(page);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete sample data', exact: true }).click();
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
  await expect(page.getByText('Start with a clear baseline', { exact: true })).toBeVisible();
  await openSettings(page);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Restore sample data', exact: true }).click();
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
  await expect(page.getByText('Truly available', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('pipeline settlement requires an account and appearance modes persist through reload', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.locator('[data-action="markAsPaid"]').first().click();
  await page.getByLabel('Settlement account').selectOption('');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a settlement account');
  await page.getByLabel('Settlement account').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  for (const mode of ['aurora', 'midnight', 'bright']) {
    await openSettings(page);
    await page.getByLabel('Appearance').selectOption(mode);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-appearance', mode);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-appearance', mode);
  }
  expect(errors).toEqual([]);
});

test('overdue obligation can be booked as paid and appears in payment review', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.getByRole('banner').getByRole('button', { name: 'Review', exact: true }).click();
  const markPaid = page.getByRole('button', { name: 'Mark paid', exact: true }).first();
  await expect(markPaid).toBeVisible();
  await markPaid.click();
  await expect(page.getByRole('heading', { name: 'Mark obligation paid', exact: true })).toBeVisible();
  await page.getByLabel('Paid from account').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText('Actual Payments', { exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area').getByText('Paid', { exact: true }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('review queue actions categorize, match, update pipeline, and add debt plans', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');

  await page.getByRole('button', { name: '+ Add', exact: true }).click();
  await page.locator(".quick-add-card[data-action-args=\"'transaction'\"]").click();
  await page.getByLabel('Note').fill('Review uncategorized');
  await page.getByLabel('Amount').fill('-12');
  await page.getByLabel('Account').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  await page.getByRole('button', { name: '+ Add', exact: true }).click();
  await page.locator(".quick-add-card[data-action-args=\"'transaction'\"]").click();
  await page.getByLabel('Note').fill('Matchable rent payment');
  await page.getByLabel('Amount').fill('-300');
  await page.getByLabel('Account').selectOption({ index: 1 });
  await page.getByLabel('Category').fill('obligation');
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  await page.getByRole('banner').getByRole('button', { name: 'Review', exact: true }).click();
  await expect(page.getByText('Review Queue', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Categorize', exact: true }).first()).toBeVisible();

  const categorizeRow = page.locator('.modal-list-row').filter({ hasText: 'Review uncategorized' });
  await categorizeRow.getByRole('button', { name: 'Categorize', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Categorize transaction', exact: true })).toBeVisible();
  await page.getByLabel('Category').fill('');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a transaction category');
  await page.getByLabel('Category').fill('software');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-list-row').filter({ hasText: 'Review uncategorized' })).toHaveCount(0);

  const paymentRow = page.locator('.modal-list-row').filter({ hasText: 'Matchable rent payment' });
  await paymentRow.getByRole('button', { name: 'Match', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Match payment to obligation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a payment and an obligation');
  await page.getByLabel('Obligation').selectOption({ index: 1 });
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
  await expect(page.locator('.modal-list-row').filter({ hasText: 'Debt needs a due date or payment plan' })).toHaveCount(0);

  expect(errors).toEqual([]);
});

test('mobile and tablet capture surfaces avoid horizontal overflow', async ({ page }) => {
  const errors = monitorConsole(page);
  for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('button', { name: '+ Add', exact: true }).click();
    await page.locator(".quick-add-card[data-action-args=\"'transaction'\"]").click();
    await expect(page.getByLabel('Note')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);
});

test('savings goal progress and weekly reconciliation complete the operating ritual', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.goto('/');
  await page.getByRole('banner').getByRole('button', { name: 'Review', exact: true }).click();
  await expect(page.getByText('Weekly review due', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: '+ Add', exact: true }).click();
  await page.locator(".quick-add-card[data-action-args=\"'goal'\"]").click();
  await page.getByLabel('Goal name').fill('Release buffer');
  await page.getByLabel('Target amount').fill('10000');
  await page.getByLabel('Goal type').selectOption('buffer');
  await page.locator('[id^="modal-goal-account-"]').first().check();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Savings and buffer goals', exact: true })).toBeVisible();
  await expect(page.locator('#modal-body').getByText('Release buffer', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).last().click();
  await page.getByRole('button', { name: 'Planning', exact: true }).click();
  await expect(page.locator('#fin-content-area').getByText('Release buffer', { exact: true })).toBeVisible();

  await page.getByRole('banner').getByRole('button', { name: 'Review', exact: true }).click();
  await page.getByRole('button', { name: /Start review|Open review/ }).first().click();
  for (const checkbox of await page.locator('.review-account-check').all()) {
    await checkbox.check();
  }
  await page.locator('#modal-review-recurring-costs').check();
  await page.locator('#modal-review-pipeline').check();
  await page.locator('#modal-review-signals').check();
  await page.getByLabel('Review notes').fill('Balances reconciled for release week.');
  await page.getByRole('button', { name: 'Mark review complete', exact: true }).click();
  await expect(page.getByText('Weekly review current', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
