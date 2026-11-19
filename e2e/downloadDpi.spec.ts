import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { pngDpi } from '../src/download/core/pngDpi.ts';

import { openFigurePanel, pickPng } from './figurePanel.ts';
import { openStory } from './story.ts';

// A ring the page writes itself, drawn to print 2 × 1 inches.
const WRITTEN = 'download-printed-figure--written';

// The same ring read off the page.
const ON_THE_PAGE = 'download-printed-figure--on-the-page';

// The projection viewer, whose figure has no printed size of its own.
const IRIS = 'projection-pcaviewer--iris';

/**
 * Press save, and read back the file the browser wrote.
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
  await openFigurePanel(page);
  await expect(
    page.getByText('A PNG of 600 × 300 pixels, which prints 5.1 × 2.5 cm.', {
      exact: true,
    }),
  ).toBeVisible();

  await page.getByRole('radio', { name: '600 dpi', exact: true }).click();
  await expect(
    page.getByText('A PNG of 1200 × 600 pixels, which prints 5.1 × 2.5 cm.', {
      exact: true,
    }),
  ).toBeVisible();
  await pickPng(page);
  const { name, file } = await saved(page);

  expect(name).toBe('benzene.png');
  expect(pngSize(file)).toStrictEqual({ width: 1200, height: 600 });
  expect(pngDpi(file)).toBe(600);
});

test('a written SVG is saved as written, whatever the dots per inch', async ({
  page,
}) => {
  await openStory(page, WRITTEN);
  await openFigurePanel(page);
  await expect(
    page.getByText('Prints 5.1 × 2.5 cm, and stays sharp at any size.', {
      exact: true,
    }),
  ).toBeVisible();

  // The dots per inch are the PNG's; the SVG keeps the size it states.
  await page.getByRole('radio', { name: '1200 dpi', exact: true }).click();
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
  await openFigurePanel(page);
  await page.getByRole('radio', { name: '150 dpi', exact: true }).click();
  await pickPng(page);
  const { file } = await saved(page);

  expect(pngSize(file)).toStrictEqual({ width: 300, height: 150 });
  expect(pngDpi(file)).toBe(150);
});

test('a figure with no printed size of its own opens on 300 dpi, which its PNG states', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);
  await openFigurePanel(page);
  await expect(
    page.getByRole('radio', { name: '300 dpi', exact: true }),
  ).toBeChecked();
  await pickPng(page);
  const { file } = await saved(page);

  expect(pngDpi(file)).toBe(300);
});

test('the four dots per inch fit inside the panel', async ({ page }) => {
  await openStory(page, WRITTEN);
  await openFigurePanel(page);
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
    .getByRole('group', { name: 'Figure', exact: true })
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
