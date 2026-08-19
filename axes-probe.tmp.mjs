import { chromium } from '@playwright/test';

const dir = process.argv[2];
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
page.on('pageerror', (e) => process.stdout.write(`pageerror: ${e.message}\n`));
page.on('console', (m) => {
  if (m.type() === 'error') process.stdout.write(`console: ${m.text()}\n`);
});
await page.addInitScript(() => {
  localStorage.setItem(
    'lcao:preferences:v1',
    JSON.stringify({ atomicAxes: false }),
  );
});
await page.goto('http://localhost:10836/elements/Se?orbital=3dyz', {
  waitUntil: 'networkidle',
});
await page.locator('canvas').first().waitFor({ state: 'visible' });
await page.waitForTimeout(12000);
await page.screenshot({ path: `${dir}/probe-off.png` });
await page.getByRole('button', { name: 'Axes' }).click();
await page.waitForTimeout(5000);
await page.screenshot({ path: `${dir}/probe-on.png` });
await browser.close();
