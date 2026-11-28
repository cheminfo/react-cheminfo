/**
 * The card a link to a site unfurls into, drawn by Playwright's Chromium into
 * a PNG — what `cheminfo-og-image` runs, and what a site outside the registry
 * calls with its own record.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import type { OgCardOptions } from './ogCard.ts';
import { OG_HEIGHT, OG_WIDTH, ogCardHtml } from './ogCard.ts';

/** What {@link writeOgCard} draws, and where. */
export interface WriteOgCardOptions extends OgCardOptions {
  /**
   * Where the PNG is written, from the working directory.
   * @default 'public/og.png'
   */
  out?: string;
}

/**
 * Draw the card and write it. Chromium comes from `@playwright/test`, which
 * every site installs for its browser suite.
 * @param options - The site, what the card says, and where it goes.
 * @returns The absolute path written.
 */
export async function writeOgCard(
  options: WriteOgCardOptions,
): Promise<string> {
  const { out = 'public/og.png', ...card } = options;
  const html = await ogCardHtml(card);
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: OG_WIDTH, height: OG_HEIGHT },
    });
    await page.setContent(html, { waitUntil: 'load' });
    const target = resolve(out);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, await page.screenshot({ type: 'png' }));
    return target;
  } finally {
    await browser.close();
  }
}
