import { expect, test } from '@playwright/test';

import { qrCodeSvg } from '../src/share/core/qrCode.ts';

import { openStory } from './story.ts';

// The first eight bytes of every PNG, and where its header writes the width.
const PNG_SIGNATURE = '89504e470d0a1a0a';
const PNG_WIDTH_AT = 16;

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
  await panel.getByRole('button', { name: 'Copy as PNG', exact: true }).click();

  // The code is painted after the click, so the clipboard holds it a moment later.
  const readTypes = () =>
    page.evaluate(async () => {
      const [item] = await navigator.clipboard.read();
      return item?.types ?? [];
    });
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
