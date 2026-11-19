import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

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
