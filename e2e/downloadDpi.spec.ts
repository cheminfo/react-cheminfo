import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { pngDpi } from '../src/download/core/pngDpi.ts';

import { openStory } from './story.ts';

// A ring the page writes itself, drawn to print 2 × 1 inches.
const WRITTEN = 'download-printed-figure--written';

// The same ring read off the page.
const ON_THE_PAGE = 'download-printed-figure--on-the-page';

// The projection viewer, whose figure has no printed size of its own.
const IRIS = 'projection-pcaviewer--iris';

/**
 * Open the panel, press save, and read back the file the browser wrote.
 * @param page - The page showing the figure.
 * @returns The file's name and bytes.
 */
async function saved(page: Page): Promise<{ name: string; file: Buffer }> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Save', exact: true }).click(),
  ]);
  return {
    name: download.suggestedFilename(),
    file: readFileSync(await download.path()),
  };
}

/**
 * The size a PNG says it is, read out of its own header.
 * @param file - The saved file.
 * @returns Its size in pixels.
 */
function pngSize(file: Buffer): { width: number; height: number } {
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
}

test('a figure with a printed size is saved at the dots per inch picked, and says so', async ({
  page,
}) => {
  await openStory(page, WRITTEN);
  await page.getByRole('button', { name: 'Save this figure — PNG' }).click();
  await expect(
    page.getByText('Saved 600 × 300 pixels, which print 5.1 × 2.5 cm.'),
  ).toBeVisible();

  await page.getByRole('radio', { name: '600 dpi' }).click();
  await expect(
    page.getByText('Saved 1200 × 600 pixels, which print 5.1 × 2.5 cm.'),
  ).toBeVisible();
  const { name, file } = await saved(page);

  expect(name).toBe('benzene.png');
  expect(pngSize(file)).toStrictEqual({ width: 1200, height: 600 });
  expect(pngDpi(file)).toBe(600);
});

test('a written SVG is saved as written, and is offered no resolution', async ({
  page,
}) => {
  await openStory(page, WRITTEN);
  await page.getByRole('button', { name: 'Save this figure — PNG' }).click();
  await page.getByRole('radio', { name: 'SVG' }).click();

  await expect(page.getByRole('radio', { name: '300 dpi' })).toHaveCount(0);
  await expect(
    page.getByText('Prints 5.1 × 2.5 cm, and stays sharp at any size.'),
  ).toBeVisible();
  const { name, file } = await saved(page);

  expect(name).toBe('benzene.svg');
  const text = file.toString('utf8');
  expect(text).toContain('width="144pt" height="72pt"');
  expect(text).toContain('data-smiles="c1ccccc1"');
});

test('a figure read off the page is offered dots per inch too', async ({
  page,
}) => {
  await openStory(page, ON_THE_PAGE);
  await page.getByRole('button', { name: 'Save this figure — PNG' }).click();
  await page.getByRole('radio', { name: '150 dpi' }).click();
  const { file } = await saved(page);

  expect(pngSize(file)).toStrictEqual({ width: 300, height: 150 });
  expect(pngDpi(file)).toBe(150);
});

test('a PNG saved at a multiple states the dots per inch it has at screen size', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);
  await page.getByRole('button', { name: 'Save this figure — PNG' }).click();
  const { file } = await saved(page);

  expect(pngDpi(file)).toBe(192);
});

test('the four dots per inch fit inside the panel', async ({ page }) => {
  await openStory(page, WRITTEN);
  await page.getByRole('button', { name: 'Save this figure — PNG' }).click();
  // The popover opens from four fifths of its size, and a box measured on the
  // way is a box the panel does not end up with.
  await expect
    .poll(() =>
      page
        .locator('.bp6-popover')
        .first()
        .evaluate((element) => globalThis.getComputedStyle(element).transform),
    )
    .toMatch(/^(?:none|matrix\(1, 0, 0, 1, 0, 0\))$/u);
  const panel = await page
    .getByRole('group', { name: 'Save figure' })
    .boundingBox();
  const last = await page
    .getByRole('radio', { name: '1200 dpi' })
    .boundingBox();

  expect(panel).not.toBeNull();
  expect(last).not.toBeNull();
  expect((last?.x ?? 0) + (last?.width ?? 0)).toBeLessThanOrEqual(
    (panel?.x ?? 0) + (panel?.width ?? 0),
  );
});
