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

test('the saved figure carries the key, which the chrome around it does not', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openSavePanel(page, SAVE_PNG);
  await page.getByRole('radio', { name: 'SVG' }).click();
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

  await openSavePanel(page, SAVE_PNG);
  await page.getByRole('radio', { name: 'SVG' }).click();

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

  await openSavePanel(page, SAVE_PNG);
  await page.getByRole('radio', { name: 'SVG' }).click();

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

test('a figure saved at 16:9 is drawn again at that shape, not stretched', async ({
  page,
}) => {
  await openStory(page, ANY_SIZE);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openSavePanel(page, SAVE_SVG);
  await pickSize(page, '16:9');
  await expect(
    page.getByText('Opens at 720 × 405 pixels, and stays sharp at any size.', {
      exact: true,
    }),
  ).toHaveCount(1);

  // The file and the chart in it are both the new shape: the chart was laid
  // out at 405 pixels high rather than the 380 it has on screen.
  expect(drawingSizes(await savedText(page))).toStrictEqual([
    '720×405',
    '720×405',
  ]);
  // The copy drawn for the file is gone, and the one on screen is untouched.
  await expect(page.locator('div[inert]')).toHaveCount(0);
  await expect(page.locator('.chart-frame')).toHaveCount(1);
});

test('a chart that measures its own box is saved at the size typed', async ({
  page,
}) => {
  await openStory(page, FILLS_ITS_BOX);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openSavePanel(page, SAVE_SVG);
  await pickSize(page, 'Journal column');
  expect(drawingSizes(await savedText(page)).slice(0, 2)).toStrictEqual([
    '321×169',
    '321×169',
  ]);

  await pickSize(page, 'Custom');
  await page.getByRole('textbox', { name: 'Width' }).fill('1200');
  await page.getByRole('textbox', { name: 'Height' }).fill('800');
  await page.getByRole('textbox', { name: 'Height' }).press('Enter');
  await page.getByRole('radio', { name: 'PNG' }).click();
  await page.getByRole('radio', { name: '1×' }).click();

  expect(pngSize(await saved(page))).toStrictEqual({
    width: 1200,
    height: 800,
  });
});

test('an SVG saved at twice opens twice as large, drawn the same', async ({
  page,
}) => {
  await openStory(page, ANY_SIZE);
  await expect(page.locator('.chart-frame')).toHaveCount(1);

  await openSavePanel(page, SAVE_SVG);
  await page.getByRole('radio', { name: '2×' }).click();
  await expect(
    page.getByText('Opens at 1440 × 760 pixels, and stays sharp at any size.', {
      exact: true,
    }),
  ).toHaveCount(1);

  const file = await savedText(page);
  // The document says it is twice the size, while its coordinates — and the
  // chart inside them — are those of the figure on screen.
  expect(file).toContain('width="1440" height="760" viewBox="0 0 720 380"');
  expect(drawingSizes(file)).toStrictEqual(['1440×760', '720×380']);
});
