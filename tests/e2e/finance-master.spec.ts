import { expect, test, type Page } from '@playwright/test';

function monitorConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function gotoApp(page: Page, path = '/'): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#dashboard-financial')).toBeVisible();
  await expect(page.locator('#fin-content-area')).toBeVisible();
}

async function reloadApp(page: Page): Promise<void> {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#dashboard-financial')).toBeVisible();
  await expect(page.locator('#fin-content-area')).toBeVisible();
}

async function openQuickAdd(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'New entry', exact: true }).click();
  await expect(page.locator('#quick-action-menu')).toHaveClass(/active/);
}

async function chooseQuickAction(page: Page, label: string | RegExp): Promise<void> {
  await page.locator('#quick-action-menu').getByRole('button', { name: label }).click();
}

async function openSettingsPage(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByText('App Preferences', { exact: true })).toBeVisible();
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
  await gotoApp(page);
  await expect(page.locator('[data-fin-nav]')).toHaveCount(8);
  await expect(page.locator('#fin-content-area .fin-section-nav')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cashflow', exact: true })).toHaveCount(0);

  for (const [button, heading] of [
    ['Money Status', 'Money Status'],
    ['Decision Lab', 'Decision Lab'],
    ['Cash Timeline', 'Cash Timeline'],
    ['Money Plan', 'Money Plan'],
    ['Risk Radar', 'Risk Radar'],
    ['Reality Check', 'Reality Check'],
    ['Records', 'Records'],
    ['Settings', 'Settings'],
  ] as const) {
    await page.getByRole('button', { name: button, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('roadmap section aliases keep persisted navigation compatible', async ({ page }) => {
  const errors = monitorConsole(page);
  for (const [stored, heading, nav] of [
    ['transactions', 'Records', 'Records'],
    ['cash-movement', 'Records', 'Records'],
    ['income', 'Cash Timeline', 'Cash Timeline'],
    ['invoices', 'Cash Timeline', 'Cash Timeline'],
    ['cashflow', 'Cash Timeline', 'Cash Timeline'],
    ['decisions', 'Decision Lab', 'Decision Lab'],
    ['decision', 'Decision Lab', 'Decision Lab'],
    ['planning', 'Cash Timeline', 'Cash Timeline'],
    ['obligations', 'Money Plan', 'Money Plan'],
    ['reserves', 'Money Plan', 'Money Plan'],
    ['treasury', 'Money Plan', 'Money Plan'],
    ['monthly-review', 'Reality Check', 'Reality Check'],
    ['month-close', 'Reality Check', 'Reality Check'],
    ['reports', 'Risk Radar', 'Risk Radar'],
    ['insights', 'Risk Radar', 'Risk Radar'],
    ['settings', 'Settings', 'Settings'],
    ['import', 'Settings', 'Settings'],
    ['backup', 'Settings', 'Settings'],
    ['system', 'Settings', 'Settings'],
  ] as const) {
    await gotoApp(page);
    await page.evaluate((value) => window.localStorage.setItem('finance-master.layout.active-section', value), stored);
    await reloadApp(page);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.locator('#primary-finance-navigation').getByRole('button', { name: nav || heading, exact: true })).toHaveClass(/active/);
  }
  expect(errors).toEqual([]);
});

test('core boards use the shared row and button primitives', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);

  for (const [section, expectedRows] of [
    ['dashboard', 1],
    ['flow', 1],
    ['plan', 1],
    ['review', 1],
    ['settings', 1],
  ] as const) {
    await page.evaluate((value) => window.FinancialMode?.setSection?.(value), section);
    await expect(page.locator('#fin-content-area .fin-action-btn')).toHaveCount(0);
    await expect(page.locator('#fin-content-area .fin-board-list-row:not(.fin-list-row)')).toHaveCount(0);
    await expect.poll(() => page.locator('#fin-content-area .fin-list-row').count()).toBeGreaterThanOrEqual(expectedRows);
  }

  expect(errors).toEqual([]);
});

test('consolidated boards keep clear product boundaries', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);

  await page.getByRole('button', { name: 'Decision Lab', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Decision Lab', exact: true })).toBeVisible();
  await expect(page.getByText('Decision cockpit', { exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area .fin-board-frame').first()).toBeVisible();
  await expect(page.getByText('Focus Queue', { exact: true })).toBeVisible();
  await expect(page.getByText('Why This Board Exists', { exact: true })).toBeVisible();
  await expect(page.getByText('Decision Cards', { exact: true })).toBeVisible();
  await expect(page.getByText('Pressure Timeline', { exact: true })).toBeVisible();
  await expect(page.getByText('Scenario Shortcuts', { exact: true })).toBeVisible();
  await expect(page.getByText('Opportunity Signals', { exact: true })).toBeVisible();
  await expect(page.getByText('Today’s Finance Focus', { exact: true })).toHaveCount(0);
  await expect(page.locator('#fin-content-area').getByText('Cash Timeline', { exact: true })).toHaveCount(0);
  await expect(page.locator('#fin-content-area').getByText('Money Plan', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Cash Timeline', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cash Timeline', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cash Timeline', exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area .fin-board-frame').first()).toBeVisible();
  await expect(page.getByText('30-day expected landing', { exact: true })).toBeVisible();
  await expect(page.getByText('Scenario Pressure', { exact: true })).toBeVisible();
  await expect(page.getByText('Runway Projection', { exact: true })).toBeVisible();
  await expect(page.getByText('Income Timing', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit Money Plan inputs', exact: true })).toBeVisible();
  await expect(page.getByText('Transaction Log', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Stress Test', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Savings and Buffer Goals', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Money Plan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Money Plan', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Money Plan', exact: true })).toBeVisible();
  await expect(page.getByText('Payment plan rule', { exact: true })).toBeVisible();
  await expect(page.getByText('Cash Structure', { exact: true })).toBeVisible();
  await expect(page.getByText('Protected Money', { exact: true })).toBeVisible();
  await expect(page.getByText('Protected cash can come from account allocations and reserve buckets. This money has a job; it is not spare.', { exact: true })).toBeVisible();
  await expect(page.getByText('Protected account allocations', { exact: true })).toBeVisible();
  await expect(page.getByText('Reserve bucket balances', { exact: true })).toBeVisible();
  await expect(page.getByText('Debt plans confirmed', { exact: true })).toBeVisible();
  await expect(page.locator('.fin-treasury-pulse-grid').getByText(/of/)).toBeVisible();
  const protectedMoney = page.locator('.fin-treasury-vault');
  await expect(protectedMoney.getByRole('button', { name: 'Add reserve bucket', exact: true })).toHaveClass(/fin-button--primary/);
  await expect(protectedMoney.getByRole('button', { name: 'Allocate cash', exact: true })).toHaveClass(/fin-button--secondary/);
  await expect(page.getByText('Recurring Burn', { exact: true })).toBeVisible();
  await expect(page.getByText('Debt & Payment Plans', { exact: true })).toBeVisible();
  await expect(page.getByText('Savings & Future Goals', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Account Details/ })).toBeVisible();
  await expect(page.locator('#fin-content-area').getByText('Cash Timeline', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Transaction Log', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Flexible cost simulator', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Fixed Costs & Debt', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Savings and Buffer Goals', { exact: true })).toHaveCount(0);
  await expect(page.locator('.fin-debt-control-panel')).toBeVisible();
  await expect(page.locator('[data-debt-group="no_plan"]')).toBeVisible();
  await expect(page.locator('[data-fin-collapsible="treasury-debt-details"]')).toHaveCount(0);
  for (const [key, label] of [
    ['actualCash', 'Actual Cash'],
    ['protectedCash', 'Protected Cash'],
    ['availableCash', 'Available Cash'],
    ['monthlyBurnRate', 'Monthly Burn Rate'],
    ['runway', 'Runway'],
    ['debtPressure', 'Debt Pressure'],
  ] as const) {
    const explainer = page.locator(`[data-fin-explainer="${key}"]`).first();
    await expect(explainer).toBeVisible();
    await explainer.getByRole('button', { name: new RegExp(`Explain ${label}`, 'i') }).click();
    const dialog = page.getByRole('dialog', { name: label });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Formula', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }

  await page.getByRole('button', { name: 'Reality Check', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Reality Check', exact: true })).toBeVisible();
  await expect(page.getByText('Review Queue', { exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area .fin-board-frame').first()).toBeVisible();
  await expect(page.getByText('Obligation Review', { exact: true })).toBeVisible();
  await expect(page.getByText('Payment Matching', { exact: true })).toBeVisible();
  await expect(page.getByText('Review Signals', { exact: true })).toBeVisible();
  await expect(page.getByText(/This week.s focus/)).toBeVisible();
  await expect(page.getByText('Income review', { exact: true })).toBeVisible();
  await expect(page.getByText('Debt starts', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Records', exact: true })).toBeVisible();
  await expect(page.getByText('Checkpoint summary', { exact: true })).toBeVisible();
  await expect(page.getByText('Transaction Log', { exact: true })).toHaveCount(0);
  await expect(page.locator('#fin-content-area').getByText('Cash Timeline', { exact: true })).toHaveCount(0);
  await expect(page.locator('#fin-content-area').getByText('Money Plan', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Records', exact: true })).toBeVisible();
  await expect(page.getByText('Transaction Log', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inbox', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Review Needed', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area').getByRole('button', { name: 'Import CSV', exact: true })).toHaveCount(0);
  await expect(page.locator('#fin-content-area').getByLabel('Records import history')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Export backup', exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area').getByRole('button', { name: 'Restore backup', exact: true })).toHaveCount(1);
  await expect(page.getByText('App Preferences', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Risk Radar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Risk Radar', exact: true })).toBeVisible();
  await expect(page.getByText('Risk Radar status', { exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area .fin-board-frame').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Risk Radar', exact: true })).toBeVisible();
  await expect(page.getByText('Pattern Memory', { exact: true })).toBeVisible();
  await expect(page.getByText('Income Dependency', { exact: true })).toBeVisible();
  await expect(page.getByText('Expense Gravity', { exact: true })).toBeVisible();
  await expect(page.getByText('Debt Intelligence', { exact: true })).toBeVisible();
  await expect(page.getByText('Reserve Discipline', { exact: true })).toBeVisible();
  await expect(page.getByText('Scenario Lab 2.0', { exact: true })).toBeVisible();
  await expect(page.getByText('Recommended Moves', { exact: true })).toBeVisible();
  await expect(page.getByText('Money Picture', { exact: true })).toHaveCount(0);
  await expect(page.locator('#fin-content-area').getByText('Cash Timeline', { exact: true })).toHaveCount(0);
  await expect(page.locator('#fin-content-area').getByText('Money Plan', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Transaction Log', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('decisions board presents ranked guidance without mutating finance data', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await page.getByRole('button', { name: 'Decision Lab', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Decision Lab', exact: true })).toBeVisible();

  const focusItems = page.locator('[data-decision-focus]');
  await expect(focusItems.first()).toBeVisible();
  await expect.poll(() => focusItems.count()).toBeLessThanOrEqual(3);
  const firstCard = page.locator('[data-decision-card]').first();
  await expect(firstCard).toBeVisible();
  await expect(firstCard.getByText('Meaning', { exact: true })).toBeVisible();
  await expect(firstCard.locator('.fin-decision-evidence span').first()).toBeVisible();
  await expect(firstCard.getByRole('button')).toBeVisible();
  await expect(page.locator('[data-decision-opportunity]').first()).toBeVisible();
  await expect(page.locator('[data-decision-timeline="7d"]')).toBeVisible();
  await expect(page.locator('[data-decision-timeline="30d"]')).toBeVisible();
  await expect(page.locator('[data-decision-timeline="90d"]')).toBeVisible();
  const decisionTimelineSources = await page.locator('[data-decision-timeline="30d"] [data-timeline-source]').evaluateAll((nodes) => (
    nodes.map((node) => node.getAttribute('data-timeline-source')).filter(Boolean)
  ));
  await page.getByRole('button', { name: 'Cash Timeline', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cash Timeline', exact: true })).toBeVisible();
  const flowTimelineSources = await page.locator('[data-flow-timeline-item]').evaluateAll((nodes) => (
    nodes.map((node) => node.getAttribute('data-flow-timeline-item')).filter(Boolean)
  ));
  expect(decisionTimelineSources.length).toBeGreaterThan(0);
  expect(decisionTimelineSources.every((source) => flowTimelineSources.includes(source))).toBe(true);
  await page.getByRole('button', { name: 'Decision Lab', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Decision Lab', exact: true })).toBeVisible();

  const storedBefore = await page.evaluate(() => JSON.stringify({
    ledger: window.Store.getFinanceLedger(),
    entities: {
      fiatAccounts: window.Store.getFinancialReadModel().fiatAccounts,
      recurringExpenses: window.Store.getFinancialReadModel().recurringExpenses,
      debtAccounts: window.Store.getFinancialReadModel().debtAccounts,
      reserveBuckets: window.Store.getFinancialReadModel().reserveBuckets,
      pipelineDeals: window.Store.getFinancialReadModel().pipelineDeals,
      transactions: window.Store.getFinancialReadModel().transactions,
    },
  }));
  await page.locator('[data-decision-shortcut]').first().click();
  await expect(page.getByRole('heading', { name: /Cash Timeline|Money Plan|Risk Radar/, exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate((before) => JSON.stringify({
    ledger: window.Store.getFinanceLedger(),
    entities: {
      fiatAccounts: window.Store.getFinancialReadModel().fiatAccounts,
      recurringExpenses: window.Store.getFinancialReadModel().recurringExpenses,
      debtAccounts: window.Store.getFinancialReadModel().debtAccounts,
      reserveBuckets: window.Store.getFinancialReadModel().reserveBuckets,
      pipelineDeals: window.Store.getFinancialReadModel().pipelineDeals,
      transactions: window.Store.getFinancialReadModel().transactions,
    },
  }) === before, storedBefore)).toBe(true);
  expect(errors).toEqual([]);
});

test('decision lab and records drawer stay readable at desktop and tablet widths', async ({ page }) => {
  const errors = monitorConsole(page);
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 1024, height: 900 },
    { width: 768, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await gotoApp(page);
    await page.evaluate(() => window.FinancialMode?.setSection?.('decisions'));
    await expect(page.getByRole('heading', { name: 'Decision Lab', exact: true })).toBeVisible();
    const decisionLayout = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('[data-decision-card]')] as HTMLElement[];
      const timelineColumns = [...document.querySelectorAll('[data-decision-timeline]')] as HTMLElement[];
      const narrowText = [...document.querySelectorAll('.fin-decision-card-main > strong, .fin-decision-card-main p, .fin-decision-meaning strong')] as HTMLElement[];
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        minCardWidth: Math.min(...cards.map((card) => card.getBoundingClientRect().width)),
        minTimelineWidth: Math.min(...timelineColumns.map((column) => column.getBoundingClientRect().width)),
        unreadableTextBlocks: narrowText
          .filter((node) => node.textContent && node.textContent.trim().length > 18)
          .filter((node) => node.getBoundingClientRect().width < 180)
          .length,
      };
    });
    expect(decisionLayout.scrollWidth).toBeLessThanOrEqual(decisionLayout.viewportWidth);
    expect(decisionLayout.minCardWidth).toBeGreaterThanOrEqual(260);
    expect(decisionLayout.minTimelineWidth).toBeGreaterThanOrEqual(260);
    expect(decisionLayout.unreadableTextBlocks).toBe(0);

    await page.evaluate(() => window.FinancialMode?.setSection?.('logbook'));
    await expect(page.getByRole('heading', { name: 'Records', exact: true })).toBeVisible();
    const firstRecord = page.locator('.fin-ledger-workspace-card .fin-transaction-row[role="button"]').first();
    await expect(firstRecord).toBeVisible();
    await firstRecord.click();
    await expect(page.getByLabel('Record detail drawer')).toBeVisible();
    const drawerLayout = await page.evaluate(() => {
      const drawer = document.querySelector('[aria-label="Record detail drawer"]') as HTMLElement | null;
      const rect = drawer?.getBoundingClientRect();
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        drawerWidth: rect?.width || 0,
        drawerRight: rect?.right || 0,
      };
    });
    expect(drawerLayout.scrollWidth).toBeLessThanOrEqual(drawerLayout.viewportWidth);
    expect(drawerLayout.drawerWidth).toBeGreaterThanOrEqual(260);
    expect(drawerLayout.drawerRight).toBeLessThanOrEqual(drawerLayout.viewportWidth);
  }
  expect(errors).toEqual([]);
});

test('all boards avoid horizontal overflow and tiny major cards at desktop and tablet widths', async ({ page }) => {
  const errors = monitorConsole(page);
  const sections = [
    ['dashboard', 'Money Status'],
    ['decisions', 'Decision Lab'],
    ['flow', 'Cash Timeline'],
    ['plan', 'Money Plan'],
    ['radar', 'Risk Radar'],
    ['review', 'Reality Check'],
    ['logbook', 'Records'],
    ['settings', 'Settings'],
  ] as const;
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 1024, height: 900 },
    { width: 768, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await gotoApp(page);
    for (const [section, heading] of sections) {
      await page.evaluate((value) => window.FinancialMode?.setSection?.(value), section);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      const layout = await page.evaluate(() => {
        const frames = [...document.querySelectorAll('#fin-content-area .fin-board-frame, #fin-content-area .fin-settings-card')] as HTMLElement[];
        const visibleFrames = frames.filter((frame) => {
          const rect = frame.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        const crampedLongText = ([...document.querySelectorAll('#fin-content-area .fin-board-frame p, #fin-content-area .fin-board-frame .fin-helper-text')] as HTMLElement[])
          .filter((node) => node.textContent && node.textContent.trim().length > 26)
          .filter((node) => {
            const rect = node.getBoundingClientRect();
            return rect.width > 0 && rect.width < 160;
          })
          .length;
        return {
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          minFrameWidth: Math.min(...visibleFrames.map((frame) => frame.getBoundingClientRect().width)),
          crampedLongText,
        };
      });
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
      expect(layout.minFrameWidth).toBeGreaterThanOrEqual(260);
      expect(layout.crampedLongText).toBe(0);
    }
  }
  expect(errors).toEqual([]);
});

test('insights diagnosis and scenario lab 2.0 previews and saves without mutating finance data', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await page.getByRole('button', { name: 'Risk Radar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Risk Radar', exact: true })).toBeVisible();
  await expect(page.getByText('Risk Radar status', { exact: true })).toBeVisible();
  await expect(page.getByText('Main risk', { exact: true })).toBeVisible();
  await expect(page.getByText('Main lever', { exact: true })).toBeVisible();
  await expect(page.getByText('Main opportunity', { exact: true })).toBeVisible();
  await expect(page.locator('.fin-insights-risk-row')).toHaveCount(7);
  await expect(page.getByText('Not enough history yet', { exact: true })).toBeVisible();
  await expect(page.getByText('Scenario Lab 2.0', { exact: true })).toBeVisible();
  await expect(page.locator('[data-scenario-lab="v2"]')).toBeVisible();

  const storedBefore = await page.evaluate(() => JSON.stringify({
    ledger: window.Store.getFinanceLedger(),
    recurringExpenses: window.Store.getFinancialReadModel().recurringExpenses,
    debtAccounts: window.Store.getFinancialReadModel().debtAccounts,
    reserveBuckets: window.Store.getFinancialReadModel().reserveBuckets,
    pipelineDeals: window.Store.getFinancialReadModel().pipelineDeals,
  }));
  await page.locator('[data-scenario-choice]').nth(1).click();
  await expect(page.getByText('Preview impact', { exact: true })).toBeVisible();
  await expect(page.getByText('Monthly burn', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Save preview', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.Store.getSavedScenarios().scenarios.length)).toBeGreaterThan(0);
  const savedId = await page.evaluate(() => window.Store.getSavedScenarios().scenarios[0]?.id || '');
  expect(savedId).toBeTruthy();
  await reloadApp(page);
  await page.getByRole('button', { name: 'Risk Radar', exact: true }).click();
  await expect(page.locator(`[data-saved-scenario="${savedId}"]`)).toBeVisible();
  await expect.poll(() => page.evaluate((id) => {
    const backup = window.Store.exportBackup();
    window.Store.deleteScenario(id);
    window.Store.restoreBackup(backup);
    return window.Store.getSavedScenarios().scenarios.some((scenario: any) => scenario.id === id);
  }, savedId)).toBe(true);
  await expect(page.locator(`[data-saved-scenario="${savedId}"]`)).toBeVisible();
  await expect.poll(() => page.evaluate((before) => JSON.stringify({
    ledger: window.Store.getFinanceLedger(),
    recurringExpenses: window.Store.getFinancialReadModel().recurringExpenses,
    debtAccounts: window.Store.getFinancialReadModel().debtAccounts,
    reserveBuckets: window.Store.getFinancialReadModel().reserveBuckets,
    pipelineDeals: window.Store.getFinancialReadModel().pipelineDeals,
  }) === before, storedBefore)).toBe(true);
  await page.locator(`[data-saved-scenario="${savedId}"]`).getByRole('button', { name: 'Delete', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.Store.getSavedScenarios().scenarios.length)).toBe(0);
  await expect(page.getByText('Recommended Moves', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('treasury cash accounts and reserve buckets can be edited and persist', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await page.getByRole('button', { name: 'Money Plan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Money Plan', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Money Plan', exact: true })).toBeVisible();
  await expect(page.getByText('Available cash after protection', { exact: true })).toBeVisible();
  await expect(page.getByText('Payment plan rule', { exact: true })).toBeVisible();
  await expect(page.getByText('Cash Structure', { exact: true })).toBeVisible();
  await expect(page.getByText('Protected Money', { exact: true })).toBeVisible();
  await expect(page.getByText('Protected account allocations', { exact: true })).toBeVisible();
  await expect(page.getByText('Reserve bucket balances', { exact: true })).toBeVisible();
  await expect(page.getByText('Recurring Burn', { exact: true })).toBeVisible();
  await expect(page.getByText('Debt & Payment Plans', { exact: true })).toBeVisible();
  await expect(page.getByText('Savings & Future Goals', { exact: true })).toBeVisible();
  await expect(page.locator('[data-fin-collapsible="treasury-burn-flexible"] .fin-collapsible-body')).not.toBeVisible();
  await page.locator('[data-fin-collapsible="treasury-burn-flexible"]').getByRole('button', { name: /Flexible Costs/ }).click();
  await expect(page.locator('[data-fin-collapsible="treasury-burn-flexible"] .fin-collapsible-body')).toBeVisible();
  await expect(page.getByText('Flexible cost simulator', { exact: true })).toHaveCount(0);

  await page.locator('[data-fin-collapsible="treasury-accounts"]').getByRole('button', { name: /Account Details/ }).click();
  await page.getByRole('button', { name: 'Add cash account', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add cash account', exact: true })).toBeVisible();
  const accountModal = page.locator('#modal-body');
  await accountModal.locator('#modal-fiat-name').fill('Temporary treasury cash');
  await accountModal.locator('#modal-fiat-balance').fill('123');
  await accountModal.locator('#modal-fiat-scope').selectOption('business');
  await accountModal.locator('#modal-fiat-bucket').selectOption('available');
  await accountModal.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinancialReadModel().fiatAccounts
      .some((entry: any) => String(entry.name) === 'Temporary treasury cash')
  ))).toBe(true);
  await page.evaluate(() => window.FinancialMode?.render?.());
  const accountToggle = page.locator('[data-fin-collapsible="treasury-accounts"]').getByRole('button', { name: /Account Details/ });
  if (await accountToggle.getAttribute('aria-expanded') !== 'true') {
    await accountToggle.click();
  }
  await expect(page.locator('[data-fin-collapsible="treasury-accounts"]').getByText('Temporary treasury cash', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Edit Temporary treasury cash', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Edit cash account', exact: true })).toBeVisible();
  await accountModal.locator('#modal-fiat-balance').fill('456');
  await accountModal.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinancialReadModel().fiatAccounts
      .find((entry: any) => String(entry.name) === 'Temporary treasury cash')?.balance
  ))).toBe(456);

  await page.getByRole('button', { name: 'Edit Temporary treasury cash', exact: true }).click();
  await page.getByRole('button', { name: 'Deactivate', exact: true }).click();
  await page.getByLabel('Type DEACTIVATE ITEM to continue').fill('DEACTIVATE ITEM');
  await page.getByRole('button', { name: 'Deactivate item', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinancialReadModel().fiatAccounts
      .some((entry: any) => String(entry.name) === 'Temporary treasury cash')
  ))).toBe(false);

  await page.getByRole('button', { name: 'Add reserve bucket', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add reserve bucket', exact: true })).toBeVisible();
  const reserveModal = page.locator('#modal-body');
  await reserveModal.locator('#modal-reserve-name').fill('Client tax reserve');
  await reserveModal.locator('#modal-reserve-target').fill('2000');
  await reserveModal.locator('#modal-reserve-current').fill('350');
  await reserveModal.locator('#modal-reserve-purpose').selectOption('tax_reserve');
  await reserveModal.locator('#modal-reserve-scope').selectOption('business');
  await reserveModal.locator('#modal-reserve-priority').selectOption('critical');
  await expect(reserveModal.locator('#modal-reserve-name')).toHaveValue('Client tax reserve');
  await expect(reserveModal.locator('#modal-reserve-target')).toHaveValue('2000');
  await expect(reserveModal.locator('#modal-reserve-current')).toHaveValue('350');
  await expect(reserveModal.locator('#modal-reserve-purpose')).toHaveValue('tax_reserve');
  await expect(reserveModal.locator('#modal-reserve-scope')).toHaveValue('business');
  await expect(reserveModal.locator('#modal-reserve-priority')).toHaveValue('critical');
  await reserveModal.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expect(page.locator('.fin-treasury-reserve-card').filter({ hasText: 'Client tax reserve' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinancialReadModel().reserveBuckets
      .some((entry: any) => Number(entry.currentAmount) === 350 && Number(entry.targetAmount) === 2000 && String(entry.purpose) === 'tax_reserve')
  ))).toBe(true);

  await reloadApp(page);
  await expect(page.getByRole('heading', { name: 'Money Plan', exact: true })).toBeVisible();
  await expect(page.locator('.fin-treasury-reserve-card').filter({ hasText: 'Client tax reserve' })).toBeVisible();
  await expect(page.getByText('Temporary treasury cash', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('debt payment plan control panel shows all statuses and persists lifecycle actions', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await page.evaluate(() => {
    const currency = window.Store.getFinanceSettings().baseCurrency;
    const now = '2026-06-04T10:00:00.000Z';
    const debts = [
      ['e2e-active-debt', 'E2E Active Debt', 2400, { minimumPayment: 600, frequency: 'quarterly', dueDate: '2026-08-15', planStatus: 'active' }],
      ['e2e-hold-debt', 'E2E Hold Debt', 1200, { minimumPayment: 100, frequency: 'monthly', dueDate: '2026-06-20', planStatus: 'on_hold' }],
      ['e2e-future-debt', 'E2E Future Debt', 900, { minimumPayment: 90, frequency: 'monthly', dueDate: '2026-07-20', startDate: '2026-07-01', planStatus: 'active' }],
      ['e2e-irregular-debt', 'E2E Irregular Debt', 1500, { minimumPayment: 500, frequency: 'monthly', dueDate: '2026-06-20', planStatus: 'irregular', customMonthlyPressure: 125 }],
      ['e2e-completed-debt', 'E2E Completed Debt', 700, { minimumPayment: 70, frequency: 'monthly', dueDate: '2026-06-20', planStatus: 'completed' }],
    ];
    const events: any[] = debts.flatMap(([id, name, amount, plan], index) => [
      {
        type: 'debt.added',
        amount,
        currency,
        timestamp: new Date(Date.parse(now) + index * 10000).toISOString(),
        related_entity_id: id,
        metadata: { name, scope: 'business' },
      },
      {
        type: 'debt.plan_updated',
        amount: plan.minimumPayment,
        currency,
        timestamp: new Date(Date.parse(now) + index * 10000 + 1000).toISOString(),
        related_entity_id: id,
        metadata: { name, scope: 'business', paymentPlanNote: 'E2E plan', ...plan },
      },
    ]);
    events.push({
      type: 'debt.added',
      amount: 500,
      currency,
      timestamp: new Date(Date.parse(now) + 99000).toISOString(),
      related_entity_id: 'e2e-no-plan-debt',
      metadata: { name: 'E2E No Plan Debt', scope: 'business' },
    });
    window.Store.appendFinanceEvents(events, { source: 'e2e.debtControlPanel' });
  });

  await page.getByRole('button', { name: 'Money Plan', exact: true }).click();
  await expect(page.locator('[data-debt-group="active_pressure"]')).toBeVisible();
  await expect(page.locator('[data-debt-group="starts_later"]')).toBeVisible();
  await expect(page.locator('[data-debt-group="on_hold"]')).toBeVisible();
  await expect(page.locator('[data-debt-group="irregular"]')).toBeVisible();
  await expect(page.locator('[data-debt-group="no_plan"]')).toBeVisible();
  await expect(page.locator('[data-debt-group="completed_archived"]')).toBeVisible();
  await expect(page.locator('.fin-treasury-debt-card').filter({ hasText: /E2E .* Debt/ })).toHaveCount(6);

  const activeCard = page.locator('.fin-treasury-debt-card').filter({ hasText: 'E2E Active Debt' });
  await activeCard.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect.poll(() => page.evaluate(() => {
    const debt = window.Store.getFinancialReadModel().debtAccounts.find((entry: any) => entry.id === 'e2e-active-debt');
    return { status: debt?.planStatus, pressure: debt?.monthlyPressure };
  })).toEqual({ status: 'on_hold', pressure: 0 });

  await reloadApp(page);
  await page.getByRole('button', { name: 'Money Plan', exact: true }).click();
  await expect(page.locator('[data-debt-group="on_hold"]').filter({ hasText: 'E2E Active Debt' })).toBeVisible();
  await page.locator('.fin-treasury-debt-card').filter({ hasText: 'E2E Active Debt' }).getByRole('button', { name: 'Reactivate', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinancialReadModel().debtAccounts.find((entry: any) => entry.id === 'e2e-active-debt')?.planStatus
  ))).toBe('active');

  await page.locator('.fin-treasury-debt-card').filter({ hasText: 'E2E Active Debt' }).getByRole('button', { name: 'Complete', exact: true }).click();
  await page.getByLabel('Type MARK DEBT COMPLETE to continue').fill('MARK DEBT COMPLETE');
  await page.getByRole('button', { name: 'Mark complete', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinancialReadModel().debtAccounts.find((entry: any) => entry.id === 'e2e-active-debt')?.planStatus
  ))).toBe('completed');

  await page.locator('.fin-treasury-debt-card').filter({ hasText: 'E2E Future Debt' }).getByRole('button', { name: 'Archive', exact: true }).click();
  await page.getByLabel('Type ARCHIVE DEBT PLAN to continue').fill('ARCHIVE DEBT PLAN');
  await page.getByRole('button', { name: 'Archive debt plan', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinancialReadModel().debtAccounts.find((entry: any) => entry.id === 'e2e-future-debt')?.planStatus
  ))).toBe('archived');

  await page.locator('.fin-treasury-debt-card').filter({ hasText: 'E2E No Plan Debt' }).getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByLabel('Type DELETE DEBT ENTRY to continue').fill('DELETE DEBT ENTRY');
  await page.getByRole('button', { name: 'Delete debt entry', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinancialReadModel().debtAccounts.some((entry: any) => entry.id === 'e2e-no-plan-debt')
  ))).toBe(false);

  await reloadApp(page);
  await page.getByRole('button', { name: 'Money Plan', exact: true }).click();
  await expect(page.locator('[data-debt-group="completed_archived"]').filter({ hasText: 'E2E Active Debt' })).toBeVisible();
  await expect(page.locator('[data-debt-group="completed_archived"]').filter({ hasText: 'E2E Future Debt' })).toBeVisible();
  await expect(page.locator('.fin-treasury-debt-card').filter({ hasText: 'E2E No Plan Debt' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('treasury project profiles filter wallets and reserve buckets without separate books', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await page.getByRole('button', { name: 'Money Plan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Money Plan', exact: true })).toBeVisible();
  await expect(page.getByText('Money Plan Profiles', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /All Money Plan/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Unassigned/ })).toBeVisible();

  await page.getByRole('button', { name: 'Add project', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add project plan', exact: true })).toBeVisible();
  await page.locator('#modal-project-name').fill('Studio Launch Plan');
  await page.locator('#modal-project-purpose').fill('Client launch');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Studio Launch Plan/ })).toBeVisible();
  const projectId = await page.evaluate(() => (
    window.Store.getFinancialReadModel().projectProfiles
      .find((entry: any) => String(entry.name).startsWith('Studio Launch Plan'))?.id
  ));
  expect(projectId).toBeTruthy();

  await page.getByRole('button', { name: /Studio Launch Plan/ }).click();
  await expect(page.getByText(/Studio Launch Plan.*project view totals/)).toBeVisible();
  await page.locator('[data-fin-collapsible="treasury-accounts"]').getByRole('button', { name: /Account Details/ }).click();
  await page.getByRole('button', { name: 'Add cash account', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add cash account', exact: true })).toBeVisible();
  const accountModal = page.locator('#modal-body');
  await accountModal.locator('#modal-fiat-name').fill('Studio Launch Wallet');
  await accountModal.locator('#modal-fiat-balance').fill('777');
  await expect(accountModal.locator('#modal-fiat-name')).toHaveValue('Studio Launch Wallet');
  await expect(accountModal.locator('#modal-fiat-balance')).toHaveValue('777');
  await accountModal.locator('#modal-fiat-scope').selectOption('business');
  await accountModal.locator('#modal-fiat-project').selectOption(String(projectId));
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expect(page.getByText('Studio Launch Wallet', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Add reserve bucket', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add reserve bucket', exact: true })).toBeVisible();
  const reserveModal = page.locator('#modal-body');
  await reserveModal.getByLabel('Name', { exact: true }).fill('Studio Launch Reserve');
  await reserveModal.getByLabel('Target amount', { exact: true }).fill('1000');
  await reserveModal.getByLabel('Current amount', { exact: true }).fill('250');
  await reserveModal.getByLabel('Scope', { exact: true }).selectOption('business');
  await reserveModal.getByLabel('Purpose', { exact: true }).selectOption('custom');
  await reserveModal.locator('#modal-reserve-project').selectOption(String(projectId));
  await expect(reserveModal.locator('#modal-reserve-project')).toHaveValue(String(projectId));
  await reserveModal.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expect(page.locator('.fin-treasury-reserve-card').filter({ hasText: 'Studio Launch Reserve' })).toBeVisible();
  await expect.poll(() => page.evaluate((id) => {
    const model = window.Store.getFinancialReadModel();
    return {
      hasProjectAccount: model.fiatAccounts.some((entry: any) => String(entry.name) === 'Studio Launch Wallet' && String(entry.projectId) === String(id)),
      hasProjectReserve: model.reserveBuckets.some((entry: any) => String(entry.name) === 'Studio Launch Reserve' && String(entry.projectId) === String(id)),
    };
  }, projectId)).toEqual({ hasProjectAccount: true, hasProjectReserve: true });

  await page.getByRole('button', { name: /Unassigned/ }).click();
  await expect(page.getByText('Unassigned project view totals', { exact: true })).toBeVisible();
  await expect(page.getByText('Studio Launch Wallet', { exact: true })).toHaveCount(0);
  await expect(page.locator('.fin-treasury-reserve-card').filter({ hasText: 'Studio Launch Reserve' })).toHaveCount(0);

  await page.getByRole('button', { name: /All Money Plan/ }).click();
  await expect(page.getByText('All Money Plan canonical totals', { exact: true })).toBeVisible();
  await expect(page.locator('.fin-treasury-reserve-card').filter({ hasText: 'Studio Launch Reserve' })).toBeVisible();
  await expect(page.getByText('Studio Launch Wallet', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Studio Launch Plan/ }).click();
  await page.getByRole('button', { name: /Edit Studio Launch Plan/ }).click();
  await expect(page.getByRole('heading', { name: 'Edit project plan', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await page.getByLabel('Type ARCHIVE PROJECT PLAN to continue').fill('ARCHIVE PROJECT PLAN');
  await page.getByRole('button', { name: 'Archive project', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expect(page.locator('.fin-treasury-profile-strip').getByRole('button', { name: /Studio Launch Plan/ })).toHaveCount(0);
  await expect.poll(() => page.evaluate((id) => {
    const model = window.Store.getFinancialReadModel();
    return {
      status: model.projectProfiles.find((entry: any) => String(entry.id) === String(id))?.status,
      hasAccount: model.fiatAccounts.some((entry: any) => String(entry.name) === 'Studio Launch Wallet' && String(entry.projectId) === String(id)),
      hasReserve: model.reserveBuckets.some((entry: any) => String(entry.name) === 'Studio Launch Reserve' && String(entry.projectId) === String(id)),
    };
  }, projectId)).toEqual({ status: 'archived', hasAccount: true, hasReserve: true });
  expect(errors).toEqual([]);
});

test('overview prioritizes the money picture cockpit', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  const content = page.locator('#fin-content-area');
  await expect(content.getByText('Safe-to-Spend', { exact: true }).first()).toBeVisible();
  await expect(content.getByText('Current cash', { exact: true })).toBeVisible();
  await expect(content.getByText('Runway', { exact: true }).first()).toBeVisible();
  await expect(content.getByText('Today’s Finance Focus', { exact: true })).toBeVisible();
  await expect(content.getByText('Next Money In', { exact: true })).toBeVisible();
  await expect(content.getByText('Next Obligations', { exact: true })).toBeVisible();
  await expect(content.getByText('Financial Weather', { exact: true })).toBeVisible();
  await expect(content.getByText('Tiny Trend Strip', { exact: true })).toBeVisible();
  await expect(content.locator('.obligation-row .fin-list-row-title').first()).toBeVisible();
  await expect(content.locator('.obligation-row .fin-list-row-meta').first()).toBeVisible();
  await expect(content.locator('.obligation-row .fin-list-row-amount').first()).toBeVisible();
  await expect(content.locator('.fin-financial-weather .fin-weather-icon-shell')).toBeVisible();
  await expect(content.locator('.fin-financial-weather .fin-weather-recommendation')).toBeVisible();
  await expect(content.locator('.fin-financial-weather .fin-weather-signal-icon').first()).toBeVisible();
  await expect(content.getByText('How this is calculated', { exact: true })).toHaveCount(0);
  await expect(content.getByText('How calculated', { exact: true })).toHaveCount(0);
  await content.getByRole('button', { name: 'Explain Safe-to-Spend' }).click();
  await expect(content.getByRole('dialog', { name: 'Safe-to-Spend' })).toBeVisible();
  await expect(content.getByLabel('Safe-to-Spend formula')).toBeVisible();
  await content.getByRole('button', { name: 'Close information' }).click();
  await expect(content.getByText('Actual cash', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Protected cash', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Confirmed obligations', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Today’s Financial Decision', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Next Actions', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Attention Queue', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Transaction Log', { exact: true })).toHaveCount(0);
  await expect(content.getByText('Cash Timeline', { exact: true })).toHaveCount(0);
  const openFlowButton = content.getByRole('button', { name: 'Open Cash Timeline', exact: true }).first();
  await expect(openFlowButton).toBeVisible();

  const order = await content.evaluate((root) => {
    const labels = ['Safe-to-Spend', 'Financial Weather', 'Today’s Finance Focus', 'Next Money In', 'Tiny Trend Strip'];
    return labels.map((label) => root.textContent?.indexOf(label) ?? -1);
  });
  expect(order.every((value) => value >= 0)).toBe(true);
  expect(order).toEqual([...order].sort((a, b) => a - b));
  await expect(content.locator('.fin-financial-weather .fin-weather-signal')).toHaveCount(2);
  await expect(content.locator('.fin-today-decision .fin-button--primary').first()).toBeVisible();

  for (const label of ['Safe-to-Spend', 'Current cash', 'Runway', 'Today’s Finance Focus', 'Next Money In', 'Next Obligations', 'Financial Weather'] as const) {
    await expect(content.getByRole('button', { name: `Explain ${label}` }).first()).toBeVisible();
  }

  await openFlowButton.click();
  await expect(page.getByRole('heading', { name: 'Cash Timeline', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('floating quick add opens a lightweight action menu with focused creation entry points', async ({ page }) => {
  const errors = monitorConsole(page);
  const quickActionLabels = [
    /Add transaction/,
    /Add expected income/,
    /Add cash account/,
    /Add recurring cost/,
    /Add debt item/,
    /Add reserve bucket/,
    /Import CSV/,
  ];
  await gotoApp(page);
  await openQuickAdd(page);
  await expect(page.getByRole('heading', { name: 'New Entry', exact: true })).toHaveCount(0);
  for (const label of quickActionLabels) {
    await expect(page.locator('#quick-action-menu').getByRole('button', { name: label })).toBeVisible();
  }
  await expect(page.locator('#quick-action-menu').getByRole('button', { name: /Open Cash Timeline|Open Records|Open Reality Check|Open Money Plan|Restore backup/ })).toHaveCount(0);
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
    [/Add cash account/, 'Add cash account'],
    [/Add reserve bucket/, 'Add reserve bucket'],
  ] as const) {
    await openQuickAdd(page);
    await chooseQuickAction(page, label);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  }

  for (const section of ['Decision Lab', 'Cash Timeline', 'Records', 'Money Plan', 'Risk Radar', 'Reality Check', 'Settings'] as const) {
    await page.getByRole('button', { name: section, exact: true }).click();
    await openQuickAdd(page);
    for (const label of quickActionLabels) {
      await expect(page.locator('#quick-action-menu').getByRole('button', { name: label })).toBeVisible();
    }
    await expect(page.locator('#quick-action-menu').getByRole('button', { name: /Open Cash Timeline|Open Records|Open Reality Check|Open Money Plan|Restore backup/ })).toHaveCount(0);
    await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);
});

test('transactions page is the primary ledger workspace', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await addExpense(page, 'Ledger workspace review seed', '8.25');
  await page.getByRole('button', { name: 'Records', exact: true }).click();

  const workspace = page.locator('.fin-ledger-workspace-card');
  await expect(page.getByText('Transaction Log', { exact: true })).toBeVisible();
  await expect(page.getByText('Raw records live here for review, matching, categorization, import inspection, and detail checks.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Records utilities')).toBeVisible();
  await expect(workspace.getByRole('button', { name: 'Import CSV', exact: true })).toHaveCount(1);
  await expect(workspace.getByRole('button', { name: 'Add transaction', exact: true })).toHaveCount(1);
  await expect(page.getByLabel('Records utilities').getByRole('button', { name: /Import CSV|Add transaction/ })).toHaveCount(0);
  await expect(page.getByText('Import / Add Entry', { exact: true })).toBeVisible();
  await expect(page.getByText('Category Cleanup', { exact: true })).toBeVisible();
  await expect(page.getByText('Recurring Detection', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Search records')).toBeVisible();
  await expect(workspace.locator('.fin-status-grid')).toHaveCount(0);
  await expect(workspace.getByLabel('Record status').getByText('Records', { exact: true })).toBeVisible();
  await expect(workspace.getByText('Net movement', { exact: true })).toBeVisible();
  await expect(workspace.getByText('Open items', { exact: true })).toBeVisible();
  await expect(workspace.getByText('Matched payments', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inbox', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Expected', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Matched', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Review Needed', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Audit', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open ledger', exact: true })).toHaveCount(0);
  await expect(workspace.getByText('Income', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Scenario Pressure', { exact: true })).toHaveCount(0);
  await expect(page.locator('#fin-content-area').getByText('Cash Timeline', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Income Timing', { exact: true })).toHaveCount(0);

  await expect(page.getByLabel('Record detail drawer')).toBeVisible();
  const seedRow = workspace.locator('.fin-transaction-row').filter({ hasText: 'Ledger workspace review seed' });
  await expect(seedRow).toContainText('This record needs your eyes before it can support the forecast.');
  await seedRow.click();
  await expect(page.getByLabel('Record detail drawer').getByText('Ledger workspace review seed', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Record detail drawer').getByText('Record ID', { exact: true })).toBeVisible();
  await expect(seedRow.getByText('Category', { exact: true })).not.toBeVisible();
  await expect(seedRow.getByText('Record ID', { exact: true })).not.toBeVisible();
  await expect(seedRow.getByRole('button', { name: 'Edit transaction review', exact: true })).toBeVisible();
  await seedRow.getByRole('button', { name: 'Edit transaction review', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review transaction', exact: true })).toBeVisible();
  await page.locator('#modal-body').getByText('Technical details', { exact: true }).click();
  const modalDetails = page.locator('#modal-body .modal-technical-details');
  await expect(modalDetails.getByText('Category', { exact: true })).toBeVisible();
  await expect(modalDetails.getByText('Added manually', { exact: true })).toBeVisible();
  await expect(modalDetails.getByText('Record ID', { exact: true })).toBeVisible();
  await expect(page.locator('#modal-body').getByText('Card settings', { exact: true })).toBeVisible();
  await expect(page.locator('#modal-body').getByRole('button', { name: 'Reverse transaction', exact: true })).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();

  await page.getByRole('button', { name: 'More filters', exact: true }).click();
  await expect(page.getByLabel('Filter records by type')).toBeVisible();
  await page.getByLabel('Filter records by category').fill('software');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByLabel('Active record filters').getByText('Category: software', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();

  await page.getByRole('button', { name: 'Review Needed', exact: true }).click();
  await expect(page.locator('.fin-review-summary-line')).toContainText('need category');
  await expect(page.locator('.fin-review-summary-line')).toContainText('filtered records');
  await expect(page.getByRole('button', { name: 'Edit transaction review', exact: true }).first()).toBeVisible();
  await expect(page.locator('.fin-transaction-row--review').first().getByText('Card settings', { exact: true })).toHaveCount(0);
  await expect(page.locator('.fin-transaction-row--review').first().getByRole('button', { name: 'Reverse transaction', exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('ledger filters and inline categorization work without a full-ledger modal', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await addExpense(page, 'Software reference subscription', '8.50', 'software');
  await addExpense(page, 'Software cleanup item', '24.50');
  await expect.poll(() => page.evaluate(() => (
    window.localStorage.getItem('finance-master.ledger.v1') || ''
  ).includes('Software cleanup item'))).toBe(true);

  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await page.getByLabel('Search records').fill('Software cleanup item');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.locator('.fin-tab-panel .fin-transaction-row').filter({ hasText: 'Software cleanup item' })).toBeVisible();

  await page.getByRole('button', { name: 'Review Needed', exact: true }).click();
  const row = page.locator('.fin-transaction-row--review').filter({ hasText: 'Software cleanup item' });
  await row.getByRole('button', { name: 'Edit transaction review', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review transaction', exact: true })).toBeVisible();
  await expect(page.getByText('Suggested categories', { exact: true })).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'software', exact: true }).click();
  await expect(page.locator('#modal-body').getByLabel('Category', { exact: true })).toHaveValue('software');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await page.getByRole('button', { name: 'Inbox', exact: true }).click();
  await page.getByLabel('Search records').fill('Software cleanup item');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  const updatedRow = page.locator('.fin-tab-panel .fin-transaction-row').filter({ hasText: 'Software cleanup item' });
  await updatedRow.getByRole('button', { name: 'Edit transaction review', exact: true }).click();
  await page.locator('#modal-body').getByText('Technical details', { exact: true }).click();
  await expect(page.locator('#modal-body').getByText('software', { exact: true }).first()).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(errors).toEqual([]);
});

test('ledger review suggests obligation matches without applying them automatically', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await addExpense(page, 'Living payment', '1120', 'obligation');
  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await page.getByRole('button', { name: 'Review Needed', exact: true }).click();

  const row = page.locator('.fin-transaction-row--review').filter({ hasText: 'Living payment' });
  await expect(row).toContainText('Suggested match');
  await expect(row).toContainText('Living');
  await row.getByRole('button', { name: 'Edit payment match', exact: true }).click();
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

test('ledger rows suggest expected income matches without applying them automatically', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);

  await openQuickAdd(page);
  await chooseQuickAction(page, /Add expected income/);
  await expect(page.getByRole('heading', { name: 'Add income', exact: true })).toBeVisible();
  await page.locator('#modal-income-title').fill('Acme launch income');
  await page.locator('#modal-income-amount').fill('777');
  await page.locator('#modal-income-probability').fill('0.9');
  await page.locator('#modal-income-account').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);

  await openQuickAdd(page);
  await chooseQuickAction(page, /Add transaction/);
  await page.getByLabel('Type').selectOption('income');
  await expect(page.getByRole('heading', { name: 'Add income', exact: true })).toBeVisible();
  await page.getByLabel('Note').fill('Acme launch income');
  await page.getByLabel('Amount').fill('777');
  await page.getByLabel('Account', { exact: true }).selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);

  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await page.getByLabel('Search records').fill('Acme launch income');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  const incomeRow = page.locator('.fin-transaction-row').filter({ hasText: 'Acme launch income' }).first();
  await expect(incomeRow.getByText('Suggested income match', { exact: true })).toBeVisible();
  await expect(incomeRow.getByText('Acme launch income', { exact: true }).first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinancialReadModel().transactions
      .find((entry: any) => String(entry.description) === 'Acme launch income' && String(entry.type) === 'income.received')?.linkedIncomeId || ''
  ))).toBe('');
  const incomeId = await page.evaluate(() => (
    window.Store.getFinancialReadModel().pipelineDeals
      .find((entry: any) => String(entry.title) === 'Acme launch income')?.id || ''
  ));
  expect(incomeId).toBeTruthy();
  await incomeRow.getByRole('button', { name: 'Edit transaction review', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review transaction', exact: true })).toBeVisible();
  await page.locator('#modal-review-linked-income').selectOption(incomeId);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect.poll(() => page.evaluate(() => {
    const model = window.Store.getFinancialReadModel();
    const transaction = model.transactions
      .find((entry: any) => String(entry.description) === 'Acme launch income' && String(entry.type) === 'income.received');
    const income = model.pipelineDeals.find((entry: any) => String(entry.title) === 'Acme launch income');
    return `${transaction?.linkedIncomeId || ''}|${income?.status || ''}`;
  })).toBe(`${incomeId}|paid`);
  expect(errors).toEqual([]);
});

test('empty ledger can create and persist the first manual transaction', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await page.evaluate(() => {
    window.Store.deleteSampleData();
    window.FinancialMode?.render?.();
  });
  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await expect(page.getByLabel('Record status').getByText('Records', { exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area').getByText('0', { exact: true }).first()).toBeVisible();

  await openQuickAdd(page);
  await chooseQuickAction(page, /Add transaction/);
  const modal = page.locator('#modal-body');
  await expect(modal.getByLabel('Account', { exact: true })).toContainText('Operating cash (created on save)');
  await modal.getByLabel('Note').fill('First empty-ledger expense');
  await modal.getByLabel('Amount').fill('12.34');
  await modal.getByRole('button', { name: 'Create', exact: true }).click();

  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await expect(page.locator('.fin-tab-panel .fin-transaction-row').filter({ hasText: 'First empty-ledger expense' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (
    window.localStorage.getItem('finance-master.ledger.v1') || ''
  ).includes('First empty-ledger expense'))).toBe(true);
  await reloadApp(page);
  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await expect(page.locator('.fin-tab-panel .fin-transaction-row').filter({ hasText: 'First empty-ledger expense' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('stale deleted demo flag cannot keep the deployed app empty after reload', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
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
  await reloadApp(page);
  await page.getByRole('button', { name: 'Cash Timeline', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.Store.getFinanceLedger().length)).toBeGreaterThan(0);
  await expect(page.locator('#fin-content-area').getByText('Audit log is clean.', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('repair query parameter cannot delete local finance data', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await addExpense(page, 'Repair query must preserve this expense', '19.00', 'software');
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinanceLedger().some((event) => JSON.stringify(event).includes('Repair query must preserve this expense'))
  ))).toBe(true);

  await gotoApp(page, '/?repair=demo');
  await expect.poll(() => page.evaluate(() => (
    window.Store.getFinanceLedger().some((event) => JSON.stringify(event).includes('Repair query must preserve this expense'))
  ))).toBe(true);
  expect(errors).toEqual([]);
});

test('income exposes open, settled, and all income views', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await page.getByRole('button', { name: 'Cash Timeline', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cash Timeline', exact: true })).toBeVisible();
  await expect(page.getByText('Income Timing', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open Income', exact: true }).click();
  await expect(page.getByText('Scenario Pressure', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cash Timeline', exact: true })).toBeVisible();
  const beforeTransactions = await page.evaluate(() => window.Store.getFinancialReadModel().transactions.length);
  await openQuickAdd(page);
  await chooseQuickAction(page, /Add expected income/);
  await expect(page.getByRole('heading', { name: 'Add income', exact: true })).toBeVisible();
  const incomeModal = page.locator('#modal-body');
  await page.evaluate(() => {
    const values: Record<string, string> = {
      'modal-income-title': 'Retainer forecast only',
      'modal-income-amount': '600',
      'modal-income-vat-rate': '19',
      'modal-income-probability': '0.9',
      'modal-income-date': '2026-06-10',
      'modal-income-status': 'expected',
      'modal-income-type': 'retainer',
    };
    for (const [id, value] of Object.entries(values)) {
      const field = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      if (!field) continue;
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await incomeModal.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  const retainerRow = page.locator('tr').filter({ hasText: 'Retainer forecast only' }).first();
  await expect(retainerRow).toBeVisible();
  await expect(retainerRow.getByText('retainer', { exact: false }).first()).toBeVisible();
  await expect(retainerRow.getByText('VAT €114.00 (19%) on top', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.Store.getFinancialReadModel().transactions.length)).toBe(beforeTransactions);
  const retainerId = await page.evaluate(() => {
    const income = window.Store.getFinancialReadModel().pipelineDeals.find((entry: any) => String(entry.title) === 'Retainer forecast only');
    return String(income?.id || '');
  });
  expect(retainerId).not.toBe('');
  await retainerRow.getByRole('button', { name: 'Edit Retainer forecast only', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Edit income', exact: true })).toBeVisible();
  await expect(incomeModal.locator('#modal-income-title')).toHaveValue('Retainer forecast only');
  await expect(page.locator('#modal-income-duration-value')).toHaveValue('');
  await incomeModal.locator('#modal-income-status').selectOption('confirmed');
  await incomeModal.locator('#modal-income-probability').fill('0.95');
  await incomeModal.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expect.poll(() => page.evaluate((incomeId) => {
    const income = window.Store.getFinancialReadModel().pipelineDeals.find((entry: any) => String(entry.id) === String(incomeId));
    return `${income?.title || ''}|${income?.status || ''}|${income?.probability || ''}|${income?.incomeType || ''}|${income?.value || ''}|${income?.netAmount || ''}|${income?.vatAmount || ''}|${income?.vatRate || ''}`;
  }, retainerId)).toBe('Retainer forecast only|confirmed|0.95|retainer|714|600|114|19');
  await expect(page.getByRole('button', { name: 'Open Income', exact: true })).toHaveClass(/active/);
  expect(errors).toEqual([]);
});

test('CSV import previews accepted, duplicate, and rejected rows and remains reversible', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await page.getByRole('button', { name: 'Records', exact: true }).click();
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

  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await expect(page.getByLabel('Records import history')).toBeVisible();
  await expect(page.getByLabel('Records import history').getByText('Latest CSV batch', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Records import history').getByText('release-bank.csv')).toBeVisible();
  await expect(page.getByLabel('Records import history').getByText('Saved CSV profiles', { exact: true })).toBeVisible();
  await page.getByLabel('Search records').fill('Release deposit');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  const releaseRow = page.locator('.fin-transaction-row').filter({ hasText: 'Release deposit' });
  await expect(releaseRow.getByText('CSV batch', { exact: true })).not.toBeVisible();
  await releaseRow.getByRole('button', { name: 'Edit transaction review', exact: true }).click();
  await page.locator('#modal-body').getByText('Technical details', { exact: true }).click();
  await expect(page.locator('#modal-body').getByText('Imported from CSV', { exact: true })).toBeVisible();
  await expect(page.locator('#modal-body').getByText('CSV batch', { exact: true })).toBeVisible();
  await expect(page.locator('#modal-body').getByText('2 imported · 1 duplicate (duplicates skipped) · 1 rejected', { exact: true })).toBeVisible();
  await expect(page.locator('#modal-body').getByText('Batch totals', { exact: true })).toBeVisible();
  await expect(page.locator('#modal-body').getByText('€500.00 in · €45.00 out', { exact: true })).toBeVisible();
  await expect(page.locator('#modal-body').getByText('Batch range', { exact: true })).toBeVisible();
  await expect(page.locator('#modal-body').getByText('2026-06-01 to 2026-06-02', { exact: true })).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  const releaseBatchId = await page.evaluate(() => (
    window.Store.getImportState().batches.find((batch: any) => String(batch.sourceFile) === 'release-bank.csv')?.id || ''
  ));
  expect(releaseBatchId).toBeTruthy();
  await page.getByRole('button', { name: 'More filters', exact: true }).click();
  await page.getByLabel('Filter records by import batch').selectOption(releaseBatchId);
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByLabel('Active record filters').getByText(`Import batch: ${releaseBatchId}`, { exact: true })).toBeVisible();
  await expect(page.locator('.fin-tab-panel .fin-transaction-row')).toHaveCount(2);

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

  await page.getByRole('button', { name: 'Records', exact: true }).click();
  const importHistory = page.getByLabel('Records import history');
  await expect(importHistory.getByText('Latest CSV batch', { exact: true })).toBeVisible();
  await expect(importHistory.getByText('duplicate-bank.csv', { exact: false })).toBeVisible();
  await expect(importHistory.getByText('1 imported · 1 duplicate (duplicates imported) · 0 rejected', { exact: false })).toBeVisible();
  await importHistory.getByRole('button', { name: 'Undo', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Undo CSV import', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Undo import', exact: true })).toBeDisabled();
  await page.getByLabel('Type UNDO CSV IMPORT to continue').fill('UNDO CSV IMPORT');
  await page.getByRole('button', { name: 'Undo import', exact: true }).click();
  await expect(importHistory.getByText('Saved CSV profiles', { exact: true })).toBeVisible();
  const profileName = importHistory.getByLabel('CSV profile name').first();
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
  await gotoApp(page);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup', exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();

  await expect(page.locator('#fin-content-area').getByRole('button', { name: 'Restore backup', exact: true })).toHaveCount(1);
  await page.locator('#fin-content-area').getByRole('button', { name: 'Restore backup', exact: true }).click();
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

  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.locator('#fin-content-area').getByRole('button', { name: 'Restore backup', exact: true })).toHaveCount(1);
  await page.locator('#fin-content-area').getByRole('button', { name: 'Restore backup', exact: true }).click();
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
  await gotoApp(page);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByText('Local Data Health', { exact: true })).toBeVisible();
  await expect(page.getByText('Local finance data is readable and backup-ready.', { exact: true })).toBeVisible();
  await expect(page.getByText('Storage', { exact: true })).toBeVisible();
  await expect(page.getByText('Last backup', { exact: true })).toBeVisible();
  await expect(page.getByText('Schema', { exact: true })).toBeVisible();
  await expect(page.locator('#fin-content-area').getByRole('button', { name: 'Restore backup', exact: true })).toHaveCount(1);
  await expect(page.locator('.fin-card').filter({ hasText: 'Local Data Health' }).getByRole('button', { name: 'Restore backup', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reset local data', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset local data', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Reset local finance data', exact: true })).toBeVisible();
  const resetModal = page.locator('#modal-body');
  await expect(resetModal.getByRole('button', { name: 'Reset local data', exact: true })).toBeDisabled();
  await page.getByLabel('Type DELETE LOCAL FINANCE DATA to continue').fill('DELETE LOCAL FINANCE DATA'.slice(0, -1));
  await expect(resetModal.getByRole('button', { name: 'Reset local data', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();

  for (const mode of ['dark-editorial', 'dark-restrained', 'bright-editorial', 'bright-minimal', 'color-field', 'monochrome-focus']) {
    await openSettingsPage(page);
    const settingsContent = page.locator('#fin-content-area');
    await expect(settingsContent.getByRole('button', { name: 'Add recurring cost', exact: true })).toHaveCount(0);
    await expect(settingsContent.getByRole('button', { name: 'Add debt', exact: true })).toHaveCount(0);
    await expect(settingsContent.getByRole('button', { name: 'Add reserve bucket', exact: true })).toHaveCount(0);
    await expect(settingsContent.getByRole('button', { name: 'Add expected income', exact: true })).toHaveCount(0);
    await expect(settingsContent.getByRole('button', { name: 'Import CSV', exact: true })).toHaveCount(0);
    await expect(settingsContent.getByLabel('Records import history')).toHaveCount(0);
    await expect(settingsContent.getByRole('button', { name: /Start review|Open review|Start close|Open Records|Save checkpoint/ })).toHaveCount(0);
    await page.getByLabel('Visual mode').selectOption(mode);
    await page.getByRole('button', { name: 'Apply preferences', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-appearance', mode);
    await reloadApp(page);
    await expect(page.locator('html')).toHaveAttribute('data-appearance', mode);
  }
  expect(errors).toEqual([]);
});

test('dark visual modes keep ledger and monthly review surfaces readable', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await openSettingsPage(page);
  await page.getByLabel('Visual mode').selectOption('dark-restrained');
  await page.getByRole('button', { name: 'Apply preferences', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark-restrained');

  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await expect(page.getByText('Transaction Log', { exact: true })).toBeVisible();
  await expectDarkLocalSurfaces(page, '.fin-ledger-status-strip > div');
  await expect(page.getByRole('button', { name: 'Edit transaction review', exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Reality Check', exact: true }).click();
  await expect(page.getByText(/Checkpoint (recommended|saved)/).first()).toBeVisible();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await expectDarkLocalSurfaces(page, '.fin-monthly-review-panel');
  await expectDarkLocalSurfaces(page, '.fin-review-check-row');

  await page.getByRole('button', { name: 'Money Plan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Money Plan', exact: true })).toBeVisible();
  await expectDarkLocalSurfaces(page, '.fin-treasury-pulse');
  await expectDarkLocalSurfaces(page, '.fin-treasury-pulse-grid > div');

  await page.getByRole('button', { name: 'Risk Radar', exact: true }).click();
  await expect(page.getByText('Risk Radar status', { exact: true })).toBeVisible();
  await expectDarkLocalSurfaces(page, '.fin-insights-hero');
  await expectDarkLocalSurfaces(page, '.fin-insights-risk-row');
  expect(errors).toEqual([]);
});

test('review queue actions categorize, match, update pipeline, and add debt plans', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);

  await addExpense(page, 'Review uncategorized', '12');
  await addExpense(page, 'Matchable rent payment', '300', 'obligation');

  await page.getByRole('button', { name: 'Reality Check', exact: true }).click();
  await expect(page.getByText('Review Queue', { exact: true })).toBeVisible();
  const reviewQueue = page.locator('.fin-review-list-card');

  const categorizeRow = reviewQueue.locator('.fin-review-row').filter({ hasText: 'Review uncategorized' });
  await categorizeRow.getByRole('button', { name: 'Edit transaction review', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Review transaction', exact: true })).toBeVisible();
  await page.getByLabel('Category').fill('');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a transaction category');
  await page.getByLabel('Category').fill('software');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(reviewQueue.locator('.fin-review-row').filter({ hasText: 'Review uncategorized' })).toHaveCount(0);

  const paymentRow = reviewQueue.locator('.fin-review-row').filter({ hasText: 'Matchable rent payment' });
  await paymentRow.getByRole('button', { name: 'Edit payment match', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Match payment to obligation', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose a payment and an obligation');
  await page.locator('#modal-match-obligation-id').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(reviewQueue.locator('.fin-review-row').filter({ hasText: 'Matchable rent payment' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Records', exact: true }).click();
  await page.getByLabel('Search records').fill('Matchable rent payment');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  const matchedRow = page.locator('.fin-transaction-row').filter({ hasText: 'Matchable rent payment' });
  await expect(matchedRow.locator('.fin-transaction-link-line').getByText('Linked to', { exact: true })).toBeVisible();
  await expect(matchedRow.getByRole('button', { name: 'Match / link', exact: true })).toHaveCount(0);
  await expect(matchedRow.getByText('Payment matched to monthly obligation.', { exact: true })).not.toBeVisible();
  await expect(matchedRow.getByText('Record ID', { exact: true })).not.toBeVisible();
  await expect(matchedRow.getByText('Technical details', { exact: true })).toHaveCount(0);
  await matchedRow.getByRole('button', { name: 'Edit transaction review', exact: true }).click();
  await page.locator('#modal-body').getByText('Technical details', { exact: true }).click();
  await expect(page.locator('#modal-body').getByText('Linked obligation', { exact: true })).toBeVisible();
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'More filters', exact: true }).click();
  await page.getByLabel('Filter records by link state').selectOption('linked');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByLabel('Active record filters').getByText('Linked records', { exact: true })).toBeVisible();
  await expect(page.locator('.fin-tab-panel .fin-transaction-row').filter({ hasText: 'Matchable rent payment' })).toBeVisible();
  await page.getByLabel('Filter records by link state').selectOption('unlinked');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByLabel('Active record filters').getByText('Unlinked records', { exact: true })).toBeVisible();
  await expect(page.locator('.fin-tab-panel .fin-transaction-row').filter({ hasText: 'Matchable rent payment' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Reality Check', exact: true }).click();

  const pipelineRow = reviewQueue.locator('.fin-review-row').filter({ hasText: 'Income confidence needs review' }).first();
  await pipelineRow.getByRole('button', { name: 'Edit income review', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review pipeline item', exact: true })).toBeVisible();
  await page.getByLabel('Status').selectOption('expected');
  await page.getByLabel('Probability').fill('0.75');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(reviewQueue.locator('.fin-review-row').filter({ hasText: 'Income confidence needs review' })).toHaveCount(0);

  const debtRow = reviewQueue.locator('.fin-review-row').filter({ hasText: 'Debt needs a due date or payment plan' }).first();
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
    await gotoApp(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.evaluate(() => window.FinancialMode?.setSection?.('dashboard'));
    await openQuickAdd(page);
    await chooseQuickAction(page, /Add transaction/);
    await expect(page.getByLabel('Note')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.keyboard.press('Escape');
    const menuToggle = page.locator('[data-action="FinancialMode.toggleMobileNav"]');
    if (await menuToggle.isVisible()) await menuToggle.click();
    await page.getByRole('button', { name: 'Risk Radar', exact: true }).click();
    await expect(page.getByText('Risk Radar status', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('mobile navigation opens from a hamburger menu and closes after selection', async ({ page }) => {
  const errors = monitorConsole(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoApp(page);

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

  await page.getByRole('button', { name: 'Cash Timeline', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cash Timeline', exact: true })).toBeVisible();
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().left < 0)).toBe(true);

  await menuToggle.click();
  await page.getByRole('button', { name: 'Money Plan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Money Plan', exact: true })).toBeVisible();
  await expect(page.getByText('Available cash after protection', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Money Plan', exact: true })).toBeVisible();
  await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('savings goal progress and weekly reconciliation complete the operating ritual', async ({ page }) => {
  const errors = monitorConsole(page);
  await gotoApp(page);
  await page.getByRole('button', { name: 'Reality Check', exact: true }).click();
  await expect(page.getByText('Checkpoint recommended', { exact: true })).toBeVisible();

  await openQuickAdd(page);
  await chooseQuickAction(page, /Add transaction/);
  await page.locator('#modal-body').getByRole('button', { name: 'Cancel', exact: true }).click();
  await openQuickAdd(page);
  await expect(page.locator('#quick-action-menu').getByRole('button', { name: /Save checkpoint/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Reality Check', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(page.getByText('Cash accounts', { exact: true })).toBeVisible();
  await expect(page.getByText('Review steps', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Weekly focus choices')).toBeVisible();
  await expect(page.locator('[data-fin-action="select-weekly-focus"]').first()).toBeVisible();
  await page.locator('[data-fin-action="select-weekly-focus"]').first().click();
  await expect(page.getByLabel('Checkpoint summary')).toBeVisible();
  await expect(page.getByText('Net movement', { exact: true })).toBeVisible();
  await expect(page.getByText('Income received', { exact: true })).toBeVisible();
  await expect(page.getByText('Expenses paid', { exact: true })).toBeVisible();
  await expect(page.getByText('Runway now', { exact: true })).toBeVisible();
  await expect(page.getByText('Reserve / burn check', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Saved checkpoints')).toBeVisible();
  await expect(page.getByText('Save a checkpoint to start the local review history.', { exact: true })).toBeVisible();
  await expect(page.locator('.modal-overlay.active')).toHaveCount(0);
  await page.getByRole('button', { name: 'Save checkpoint', exact: true }).click();
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
  await page.getByRole('button', { name: 'Save checkpoint', exact: true }).click();
  await expect(page.getByText('Checkpoint saved', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Saved checkpoints').getByText('Balances reconciled for release week.')).toHaveCount(0);
  await expect(page.getByLabel('Saved checkpoints').getByText(/\d{4}-\d{2}/).first()).toBeVisible();
  await expect(page.getByLabel('Saved checkpoints').getByText(/open ·/).first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.Store.getReviewState().chosenFocus?.title || '')).not.toBe('');
  await reloadApp(page);
  await expect(page.getByRole('heading', { name: 'Reality Check', exact: true })).toBeVisible();
  await expect(page.getByLabel('Saved checkpoints').getByText(/\d{4}-\d{2}/).first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.Store.getReviewState().history.length)).toBe(1);
  await expect.poll(() => page.evaluate(() => window.Store.getReviewState().history[0]?.chosenFocus?.title || '')).not.toBe('');
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
  await page.locator('#monthly-review-notes').fill('Same month close update.');
  await page.getByRole('button', { name: 'Save checkpoint', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.Store.getReviewState().history.length)).toBe(1);
  await expect.poll(() => page.evaluate(() => window.Store.getReviewState().history[0]?.notes || '')).toBe('Same month close update.');
  expect(errors).toEqual([]);
});
