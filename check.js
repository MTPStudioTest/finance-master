import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  try {
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle', timeout: 5000 });
  } catch(e) {
    console.log('Error loading page:', e);
  }
  
  await browser.close();
})();
