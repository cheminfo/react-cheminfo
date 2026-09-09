import { readFileSync } from 'node:fs';

import type { Download, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The embedded viewer, whose bar carries the glyph that saves the figure.
const IRIS = 'projection-pcaviewer--iris';

// The same viewer opened on the grid, which is sixteen charts rather than one.
const PAIRS = 'projection-pcaviewer--every-pair';

// The glyph in the bar, which says which file it is about to write.
const SAVE_PNG = 'Save this figure — PNG';
const SAVE_SVG = 'Save this figure — SVG';

// The first eight bytes of every PNG, and where its header writes the size.
const PNG_SIGNATURE = '89504e470d0a1a0a';
const PNG_WIDTH_AT = 16;
const PNG_HEIGHT_AT = 20;

/**
 * Open the panel behind the save glyph.
 * @param page - The page showing the figure.
 * @param glyph - What the glyph is currently called.
 */
async function openSavePanel(page: Page, glyph: string): Promise<void> {
  await page.getByRole('button', { name: glyph, exact: true }).click();
  await expect(
    page.getByRole('group', { name: 'Save figure', exact: true }),
  ).toHaveCount(1);
}

/**
 * Press save, and hand back the file the browser was given.
 * @param page - The page showing the figure.
 * @returns The download.
 */
async function save(page: Page): Promise<Download> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Save', exact: true }).click(),
  ]);
  return download;
}

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

  await openSavePanel(page, SAVE_PNG);
  // The panel says what pressing save is about to produce, and the file has to
  // be exactly that: a resolution nobody can predict is a resolution nobody
  // can choose.
  const written = await page
    .getByText(/^Saved \d+ × \d+ pixels\.$/u)
    .textContent();
  const [, width, height] =
    /(?<width>\d+) × (?<height>\d+)/u.exec(written ?? '') ?? [];

  const download = await save(page);
  expect(download.suggestedFilename()).toBe('projection-map.png');

  const path = await download.path();
  expect(pngSize(readFileSync(path))).toStrictEqual({
    width: Number(width),
    height: Number(height),
  });
});

test('a figure saved at four times is twice the figure saved at two', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openSavePanel(page, SAVE_PNG);
  const twice = pngSize(await saved(page));

  await page.getByRole('radio', { name: '4×' }).click();
  const fourTimes = pngSize(await saved(page));

  expect(fourTimes.width).toBe(twice.width * 2);
  expect(fourTimes.height).toBe(twice.height * 2);
});

test('the SVG that leaves the page carries colours rather than token names', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openSavePanel(page, SAVE_PNG);
  await page.getByRole('radio', { name: 'SVG' }).click();
  await expect(page.getByRole('button', { name: SAVE_SVG })).toHaveCount(1);

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

test('a grid of sixteen charts is saved as one figure, not as its first cell', async ({
  page,
}) => {
  await openStory(page, PAIRS);
  await expect(page.locator('.chart-frame')).toHaveCount(16);

  await openSavePanel(page, SAVE_PNG);
  await page.getByRole('radio', { name: 'SVG' }).click();

  const download = await save(page);
  expect(download.suggestedFilename()).toBe('projection-pairs.svg');

  const file = readFileSync(await download.path(), 'utf8');
  expect(file.match(/<g transform="translate\(/gu)).toHaveLength(16);
});

test('the glyphs of the controls floating over a figure are left behind', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openSavePanel(page, SAVE_PNG);
  await page.getByRole('radio', { name: 'SVG' }).click();

  const file = await savedText(page);
  // One drawing, which is the chart; a cog or a caret saved into the middle of
  // the scatter would be a second.
  expect(file.match(/<g transform="translate\(/gu)).toHaveLength(1);
});
