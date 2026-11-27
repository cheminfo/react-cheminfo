import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { pngDpi } from '../src/download/core/pngDpi.ts';

import {
  PNG_HEIGHT_AT,
  PNG_SIGNATURE,
  PNG_WIDTH_AT,
  announcedPng,
  openFigurePanel,
  pickPng,
  save,
} from './figurePanel.ts';
import { openStory } from './story.ts';

// The embedded viewer, whose bar carries the glyph that saves the figure.
const IRIS = 'projection-pcaviewer--iris';

// The same viewer opened on the grid, which is sixteen charts rather than one.
const PAIRS = 'projection-pcaviewer--every-pair';

/**
 * Press save, and read back the file the browser wrote.
 * @param page - The page showing the figure.
 * @returns The bytes of the saved file.
 */
async function saved(page: Page): Promise<Buffer> {
  const download = await save(page);
  const path = await download.path();
  return readFileSync(path);
}

/**
 * The same file, read as the text an SVG document is.
 * @param page - The page showing the figure.
 * @returns The saved document.
 */
async function savedText(page: Page): Promise<string> {
  const file = await saved(page);
  return file.toString('utf8');
}

/**
 * The size a PNG says it is, read out of its own header.
 * @param file - Where the browser saved it.
 * @returns The size in pixels.
 */
function pngSize(file: Buffer): { width: number; height: number } {
  expect(file.subarray(0, 8).toString('hex')).toBe(PNG_SIGNATURE);
  return {
    width: file.readUInt32BE(PNG_WIDTH_AT),
    height: file.readUInt32BE(PNG_HEIGHT_AT),
  };
}

test('the map is saved as a PNG at the resolution the panel wrote out', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openFigurePanel(page);
  await pickPng(page);
  // The panel says what pressing save is about to produce, and the file has to
  // be exactly that: a resolution nobody can predict is a resolution nobody
  // can choose.
  const announced = await announcedPng(page);

  const download = await save(page);
  expect(download.suggestedFilename()).toBe('projection-map.png');

  const path = await download.path();
  expect(pngSize(readFileSync(path))).toStrictEqual(announced);
});

test('a figure saved at 600 dpi is twice the figure saved at 300, and says so', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openFigurePanel(page);
  await pickPng(page);
  const at300 = await saved(page);
  expect(pngDpi(at300)).toBe(300);

  await page.getByRole('radio', { name: '600 dpi', exact: true }).click();
  const at600 = await saved(page);
  expect(pngDpi(at600)).toBe(600);

  // Each side is rounded to whole pixels on its own, so doubling the pixels of
  // the one at 300 dpi may miss the one at 600 by the one pixel rounded away.
  const single = pngSize(at300);
  const double = pngSize(at600);
  expect(Math.abs(double.width - single.width * 2)).toBeLessThanOrEqual(1);
  expect(Math.abs(double.height - single.height * 2)).toBeLessThanOrEqual(1);
});

test('the SVG that leaves the page carries colours rather than token names', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openFigurePanel(page);
  await expect(
    page.getByRole('radio', { name: 'SVG', exact: true }),
  ).toBeChecked();

  const download = await save(page);
  expect(download.suggestedFilename()).toBe('projection-map.svg');

  const file = readFileSync(await download.path(), 'utf8');
  expect(file.startsWith('<?xml version="1.0" encoding="UTF-8"?><svg')).toBe(
    true,
  );
  // The site declares the tokens, and the file has left the site: a `var()`
  // that survived would draw a figure with no axes at all.
  expect(file).not.toContain('var(--');
  expect(file).toContain('#dfe3e8');
});

test('the saved figure carries the key, which the chrome around it does not', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openFigurePanel(page);
  const file = await savedText(page);

  // What the colour means, and every name it stands for. A figure saved
  // without them is three colours nobody can read.
  expect(file).toContain('Colour = species');
  expect(file).toContain('setosa (50)');
  expect(file).toContain('versicolor (50)');
  expect(file).toContain('virginica (50)');
  // The cog and the rest of the bar are chrome, and stay behind.
  expect(file).not.toContain('Save this figure');
});

test('a grid of sixteen charts is saved as one figure, not as its first cell', async ({
  page,
}) => {
  await openStory(page, PAIRS);
  await expect(page.locator('.chart-frame')).toHaveCount(16);

  await openFigurePanel(page);

  const download = await save(page);
  expect(download.suggestedFilename()).toBe('projection-pairs.svg');

  const file = readFileSync(await download.path(), 'utf8');
  expect(file.match(/<g data-figure="drawing"/gu)).toHaveLength(16);
});

test('the glyphs of the controls floating over a figure are left behind', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openFigurePanel(page);

  const file = await savedText(page);
  // One drawing, which is the chart; a cog or a caret saved into the middle of
  // the scatter would be a second. The key is painted over it and says so.
  expect(file.match(/<g data-figure="drawing"/gu)).toHaveLength(1);
  expect(file.match(/<g data-figure="legend"/gu)).toHaveLength(1);
});

// The same figure, offered at other sizes: one chart told its size, and one
// that measures the box it is mounted in.
const ANY_SIZE = 'download-figuredownload--any-size';
const FILLS_ITS_BOX = 'download-figuredownload--fills-its-box';

/**
 * Pick one of the sizes the panel offers.
 * @param page - The page showing the panel.
 * @param size - What the size is called in the list.
 */
async function pickSize(page: Page, size: string): Promise<void> {
  await page.getByRole('button', { name: /^Size — / }).click();
  await page.getByRole('option', { name: size, exact: true }).click();
}

/**
 * The size written on the outermost `<svg>` of a saved document, then on the
 * chart inside it.
 * @param file - The saved document.
 * @returns Each drawing's `width×height`, outermost first.
 */
function drawingSizes(file: string): string[] {
  const sizes: string[] = [];
  for (const match of file.matchAll(
    /<svg[^>]*? width="(?<width>[\d.]+)" height="(?<height>[\d.]+)"/gu,
  )) {
    sizes.push(`${match.groups?.width}×${match.groups?.height}`);
  }
  return sizes;
}

test('a figure saved one column wide is drawn again at that width, keeping its shape', async ({
  page,
}) => {
  await openStory(page, ANY_SIZE);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openFigurePanel(page);
  await pickSize(page, 'One column (8.5 cm)');
  await expect(
    page.getByText('Prints 8.5 × 4.5 cm, and stays sharp at any size.', {
      exact: true,
    }),
  ).toHaveCount(1);

  // The file and the chart in it are both one column wide: the chart was laid
  // out again at 321 pixels rather than the 720 it has on screen scaled down,
  // which would shrink its labels with it.
  expect(drawingSizes(await savedText(page))).toStrictEqual([
    '321×169',
    '321×169',
  ]);
  // The copy drawn for the file is gone, and the one on screen is untouched.
  await expect(page.locator('div[inert]')).toHaveCount(0);
  await expect(page.locator('.chart-frame')).toHaveCount(1);
});

test('a chart that measures its own box is saved at the width typed', async ({
  page,
}) => {
  await openStory(page, FILLS_ITS_BOX);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openFigurePanel(page);
  await pickSize(page, 'One column (8.5 cm)');
  expect(drawingSizes(await savedText(page)).slice(0, 2)).toStrictEqual([
    '321×169',
    '321×169',
  ]);

  // 12.7 cm is five inches, which is 480 pixels at the 96 a CSS inch holds.
  await pickSize(page, 'Custom');
  const width = page.getByRole('textbox', { name: 'Width', exact: true });
  await width.fill('12.7');
  await width.press('Enter');
  await pickPng(page);
  await page.getByRole('radio', { name: '150 dpi', exact: true }).click();
  await expect(
    page.getByText('A PNG of 750 × 395 pixels, which prints 12.7 × 6.7 cm.', {
      exact: true,
    }),
  ).toHaveCount(1);

  const file = await saved(page);
  expect(pngSize(file)).toStrictEqual({ width: 750, height: 395 });
  expect(pngDpi(file)).toBe(150);
});

test('an SVG is saved at the width picked, whatever the resolution of the PNG', async ({
  page,
}) => {
  await openStory(page, ANY_SIZE);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openFigurePanel(page);
  const at300 = await savedText(page);
  expect(drawingSizes(at300)).toStrictEqual(['720×380', '720×380']);

  // The resolution paints a PNG with more pixels; the SVG it leaves alone.
  await page.getByRole('radio', { name: '1200 dpi', exact: true }).click();
  await expect(
    page.getByText('Prints 19.1 × 10.1 cm, and stays sharp at any size.', {
      exact: true,
    }),
  ).toHaveCount(1);
  expect(await savedText(page)).toBe(at300);
});
