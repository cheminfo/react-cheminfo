/**
 * Saving the figure a page shows the way a reader does — Ctrl+S — and reading
 * back the file it downloads, for a site's browser suite.
 */

import { readFileSync } from 'node:fs';

import type { Download, Page } from '@playwright/test';

/** How {@link saveFigureWithShortcut} saves. */
export interface SaveFigureOptions {
  /**
   * The keys pressed.
   * @default 'ControlOrMeta+s'
   */
  keys?: string;
  /**
   * How long the download is waited for, in milliseconds: a figure carrying a
   * conformer set or a computed surface takes a while to write.
   * @default 120000
   */
  timeout?: number;
}

/** What a save downloaded. */
export interface SavedFigure {
  /** The download, for its suggested file name. */
  download: Download;
  /** The file's text, read as UTF-8. */
  svg: string;
}

/**
 * Press Ctrl+S and read the figure it saves.
 * @param page - The page showing the figure.
 * @param options - See {@link SaveFigureOptions}.
 * @returns The download, and the SVG it holds.
 */
export async function saveFigureWithShortcut(
  page: Page,
  options: SaveFigureOptions = {},
): Promise<SavedFigure> {
  const { keys = 'ControlOrMeta+s', timeout = 120_000 } = options;
  const downloading = page.waitForEvent('download', { timeout });
  await page.keyboard.press(keys);
  const download = await downloading;
  return { download, svg: readFileSync(await download.path(), 'utf8') };
}
