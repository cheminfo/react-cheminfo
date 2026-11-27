import { expect, test } from '@playwright/test';

import { readClipboardTypes } from '../src/host/testing/chatFrame.ts';
import { qrCodeSvg } from '../src/share/core/qrCode.ts';

import { PNG_SIGNATURE, PNG_WIDTH_AT } from './figurePanel.ts';
import { openStory } from './story.ts';

// How many pixels the copied PNG gives each pixel of the SVG.
const PNG_SCALE = 4;

test('the QR code copies as a PNG of the link the dialog hands out', async ({
  page,
}) => {
  await openStory(page, 'share-sharedialog--default');
  // The dialog prints no address: the link is where "Open in a new tab" leads.
  const link = await page.locator('.share-linkbar a').getAttribute('href');
  const code = qrCodeSvg(link ?? '');

  await page.getByRole('button', { name: 'QR code', exact: true }).click();
  const panel = page.getByRole('group', { name: 'QR code', exact: true });
  await expect(
    panel.getByRole('img', { name: 'QR code of the link' }),
  ).toBeVisible();
  // Both copy buttons sit inside the panel, which is as wide as the code.
  const sides = await panel.evaluate((group) => {
    const box = group.getBoundingClientRect();
    return [...group.querySelectorAll('button')].map((button) => {
      const { left, right } = button.getBoundingClientRect();
      return left >= box.left && right <= box.right;
    });
  });
  expect(sides).toStrictEqual([true, true]);
  await panel.getByRole('button', { name: 'Copy as PNG', exact: true }).click();

  // The code is painted after the click, so the clipboard holds it a moment later.
  const readTypes = () => readClipboardTypes(page);
  await expect.poll(readTypes).toStrictEqual(['image/png']);

  const bytes = await page.evaluate(async () => {
    const [item] = await navigator.clipboard.read();
    if (item === undefined) return [];
    const png = await item.getType('image/png');
    return [...new Uint8Array(await png.arrayBuffer()).subarray(0, 24)];
  });
  const header = Buffer.from(bytes);
  expect(header.subarray(0, 8).toString('hex')).toBe(PNG_SIGNATURE);
  expect(header.readUInt32BE(PNG_WIDTH_AT)).toBe(
    (code?.width ?? 0) * PNG_SCALE,
  );
});
