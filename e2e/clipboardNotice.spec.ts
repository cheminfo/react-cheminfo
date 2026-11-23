import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

/**
 * The QR code of the share dialog, whose two copy buttons copy a picture: a PNG,
 * and an SVG only some browsers take as one.
 * @param page - The page.
 * @returns The panel holding both buttons.
 */
async function openQrCode(page: Page): Promise<Locator> {
  await openStory(page, 'share-sharedialog--default');
  await page.getByRole('button', { name: 'QR code', exact: true }).click();
  return page.getByRole('group', { name: 'QR code', exact: true });
}

test('a copy that worked says so in green, and goes by itself', async ({
  page,
}) => {
  const panel = await openQrCode(page);
  await panel.getByRole('button', { name: 'Copy as PNG', exact: true }).click();

  const notice = page.locator('.clipboard-notice');

  await expect(notice).toHaveText('Copied to the clipboard.');
  await expect(notice).toHaveAttribute('role', 'status');
  await expect(notice).toHaveCSS('background-color', 'rgb(35, 133, 81)');
  await expect(notice).toHaveCount(0, { timeout: 5000 });
});

test('an SVG this browser copies only as text says so in orange, until it is clicked', async ({
  page,
}) => {
  await page.clock.install();
  // Firefox and Safari take no SVG picture; Chromium is told it does not either.
  await page.addInitScript(() => {
    const item = ClipboardItem as unknown as {
      supports: (type: string) => boolean;
    };
    const supports = item.supports.bind(item);
    item.supports = (type) => type !== 'image/svg+xml' && supports(type);
  });
  const panel = await openQrCode(page);
  await panel.getByRole('button', { name: 'Copy as SVG', exact: true }).click();

  const notice = page.locator('.clipboard-notice');

  await expect(notice).toHaveText(
    'Copied as SVG text: this browser cannot copy an SVG picture. Chrome and Edge can.',
  );
  await expect(notice).toHaveAttribute('role', 'alert');
  await expect(notice).toHaveCSS('background-color', 'rgb(180, 83, 9)');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
    /^<svg /,
  );

  await page.clock.fastForward(10_000);

  await expect(notice).toBeVisible();

  await notice.click();

  await expect(notice).toHaveCount(0);
});

test('a copy the browser refused says so in red, until it is closed', async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.clipboard.write = () =>
      Promise.reject(new DOMException('Refused', 'NotAllowedError'));
  });
  const panel = await openQrCode(page);
  await panel.getByRole('button', { name: 'Copy as PNG', exact: true }).click();

  const notice = page.locator('.clipboard-notice');

  await expect(notice).toHaveText(
    'The browser refused the clipboard, so nothing was copied. Click in the page and copy again.',
  );
  await expect(notice).toHaveCSS('background-color', 'rgb(205, 66, 70)');

  await notice.getByRole('button', { name: 'Close' }).click();

  await expect(notice).toHaveCount(0);
});
