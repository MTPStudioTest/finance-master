import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const logs = [];
  
  page.on('console', msg => logs.push(`CONSOLE ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => logs.push(`PAGEERROR: ${err.message}`));

  // Load fresh
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle', timeout: 8000 });
  
  const load1 = await page.evaluate(() => window.Store.getFinanceLedger().length);
  logs.push(`Load 1 (fresh): ${load1} events`);

  // Delete sample data (simulates user's state)
  await page.evaluate(() => window.Store.deleteSampleData());
  await page.waitForTimeout(200);
  
  logs.push(`After delete: ${await page.evaluate(() => window.Store.getFinanceLedger().length)} events`);

  // Reload — this is where it used to stay empty forever
  await page.reload({ waitUntil: 'networkidle', timeout: 8000 });
  await page.waitForTimeout(500);
  
  const load2 = await page.evaluate(() => {
    const rm = window.Store.getFinancialReadModel(true);
    return {
      events: window.Store.getFinanceLedger().length,
      pipeline: (rm.pipelineDeals || []).length,
      accounts: (rm.fiatAccounts || []).length,
    };
  });
  logs.push(`Load 2 (after delete + reload): ${JSON.stringify(load2)}`);

  console.log(logs.join('\n'));
  await browser.close();
})();
