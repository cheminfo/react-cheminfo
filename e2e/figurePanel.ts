import type { Download, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** The first eight bytes of every PNG, in hexadecimal. */
export const PNG_SIGNATURE = '89504e470d0a1a0a';

/** Where a PNG's header writes its width. */
export const PNG_WIDTH_AT = 16;

/** Where a PNG's header writes its height. */
export const PNG_HEIGHT_AT = 20;

/** The glyph that opens the figure panel, which opens on an SVG. */
export const SAVE_SVG = 'Save this figure — SVG';

/** The same glyph once a PNG is picked. */
export const SAVE_PNG = 'Save this figure — PNG';

/**
 * Open the panel behind the save glyph.
 * @param page - The page showing the figure.
 */
export async function openFigurePanel(page: Page): Promise<void> {
  await page.getByRole('button', { name: SAVE_SVG, exact: true }).click();
  await expect(
    page.getByRole('group', { name: 'Figure', exact: true }),
  ).toHaveCount(1);
}

/**
 * Pick the PNG as the file to save, and wait for the glyph to say so.
 * @param page - The page showing the open panel.
 */
export async function pickPng(page: Page): Promise<void> {
  await page.getByRole('radio', { name: 'PNG', exact: true }).click();
  await expect(
    page.getByRole('button', { name: SAVE_PNG, exact: true }),
  ).toHaveCount(1);
}

/**
 * The size of the PNG the panel says Copy, Send and Save would write.
 * @param page - The page showing the open panel.
 * @returns The size in pixels.
 */
export async function announcedPng(
  page: Page,
): Promise<{ width: number; height: number }> {
  const hint = await page
    .getByText(/^A PNG of \d+ × \d+ pixels, which prints /u)
    .textContent();
  const [, width, height] =
    /(?<width>\d+) × (?<height>\d+)/u.exec(hint ?? '') ?? [];
  return { width: Number(width), height: Number(height) };
}

/**
 * Press save, and hand back the file the browser was given.
 * @param page - The page showing the figure.
 * @returns The download.
 */
export async function save(page: Page): Promise<Download> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Save', exact: true }).click(),
  ]);
  return download;
}
