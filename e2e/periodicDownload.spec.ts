import { readFileSync } from 'node:fs';

import type { Download, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { PERIODIC_ELEMENTS } from '../src/periodic/core/elements.ts';

import { openStory } from './story.ts';

// The property map with its strips, its corner and its key, and a bar above
// it carrying the save glyph.
const STORY = 'periodic-periodictable--download';

// The first eight bytes of every PNG, and where its header writes the size.
const PNG_SIGNATURE = '89504e470d0a1a0a';
const PNG_WIDTH_AT = 16;
const PNG_HEIGHT_AT = 20;

async function openSavePanel(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: 'Save this figure — PNG', exact: true })
    .click();
  await expect(
    page.getByRole('group', { name: 'Save figure', exact: true }),
  ).toHaveCount(1);
}

async function save(page: Page): Promise<Download> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Save', exact: true }).click(),
  ]);
  return download;
}

test('the table is saved as an SVG holding every cell, its strips and its key', async ({
  page,
}) => {
  await openStory(page, STORY);
  await openSavePanel(page);
  await page.getByRole('radio', { name: 'SVG' }).click();

  const download = await save(page);
  expect(download.suggestedFilename()).toBe('electronegativity.svg');
  const file = readFileSync(await download.path(), 'utf8');

  expect(file.match(/<g data-figure="html"/gu)).toHaveLength(1);
  for (const { symbol } of PERIODIC_ELEMENTS) {
    expect(file).toContain(`>${symbol}</text>`);
  }
  // The value the map is coloured by, the numbers of the strips and the key.
  expect(file).toContain('>3.44</text>');
  expect(file).toContain('>18</text>');
  expect(file).toContain('>Halogen</text>');
  // The tokens are written out, since the file has left the site.
  expect(file).not.toContain('var(--');
  // The corner and the glyph are controls, and stay behind.
  expect(file).not.toContain('◢');
  expect(file).not.toContain('Save this figure');
});

test('the table is saved as a PNG twice the size it has on screen', async ({
  page,
}) => {
  await openStory(page, STORY);
  const box = await page.locator('#periodic-figure').boundingBox();
  expect(box).not.toBeNull();

  await openSavePanel(page);
  const download = await save(page);
  const file = readFileSync(await download.path());

  expect(file.subarray(0, 8).toString('hex')).toBe(PNG_SIGNATURE);
  expect({
    width: file.readUInt32BE(PNG_WIDTH_AT),
    height: file.readUInt32BE(PNG_HEIGHT_AT),
  }).toStrictEqual({
    width: Math.round(box?.width ?? 0) * 2,
    height: Math.round(box?.height ?? 0) * 2,
  });
});

test('a print keeps the table and its numbers, and drops its two controls', async ({
  page,
}) => {
  await openStory(page, STORY);
  await expect(page.getByTestId('save-table')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'All elements' }),
  ).toBeAttached();

  await page.emulateMedia({ media: 'print' });

  await expect(page.getByTestId('save-table')).toBeHidden();
  await expect(page.getByRole('button', { name: 'All elements' })).toBeHidden();
  await expect(page.getByTestId('element-Fe')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Group 18' })).toBeVisible();
  await expect(page.getByText('Halogen', { exact: true })).toBeVisible();
});

test('the corner shows itself when pointed at, and takes the whole table', async ({
  page,
}) => {
  await openStory(page, STORY);
  const corner = page.getByRole('button', { name: 'All elements' });
  await expect(corner).toHaveCSS('opacity', '0');

  await corner.hover();
  await expect(corner).toHaveCSS('opacity', '1');
  await corner.click();
  await expect(page.getByText('Last header clicked: all')).toBeVisible();

  await page.getByTestId('element-Fe').hover();
  await expect(corner).toHaveCSS('opacity', '0');
});

test('the corner shows itself when the keyboard reaches it', async ({
  page,
}) => {
  await openStory(page, STORY);
  const corner = page.getByRole('button', { name: 'All elements' });
  await page.getByTestId('save-table').focus();

  await page.keyboard.press('Tab');

  await expect(corner).toBeFocused();
  await expect(corner).toHaveCSS('opacity', '1');
});
