#!/usr/bin/env node
/*
 * Draw the card a link to a site of the family unfurls into, from the site's
 * own record — its mark, its two colours and its name — so the card is
 * regenerated rather than hand-edited, and a mark that changes never leaves a
 * card showing the old one.
 *
 * Wire it as an npm script, run when the mark or the tagline changes:
 *   "og-image": "cheminfo-og-image 3d"
 *
 * Usage: og-image.mjs <site-id> [--description <text>] [--out <file>]
 *   site-id        the site, as the family's registry names it
 *   --description  what the card says, instead of the site's tagline
 *   --out          where the PNG is written, `public/og.png` when none is given
 *
 * It draws with Playwright's Chromium, which every site already installs for
 * its browser suite.
 *
 * Exits 2 when it was called wrongly, 0 otherwise.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';

import { usageError } from './cli.mjs';

const TOOL = 'og-image';

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      description: { type: 'string' },
      out: { type: 'string', default: 'public/og.png' },
    },
  });
} catch (error) {
  process.exit(usageError(TOOL, error.message));
}
const [site, ...extra] = parsed.positionals;
if (site === undefined || extra.length > 0) {
  process.exit(usageError(TOOL, 'name exactly one site, e.g. `og-image 3d`'));
}

const { chromium } = await import('@playwright/test');
const { OG_HEIGHT, OG_WIDTH, ogCardHtml } = await import('../lib/vite.js');

const html = await ogCardHtml({
  site,
  description: parsed.values.description,
});
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: OG_WIDTH, height: OG_HEIGHT },
  });
  await page.setContent(html, { waitUntil: 'load' });
  const target = resolve(parsed.values.out);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, await page.screenshot({ type: 'png' }));
  process.stdout.write(`${target} written (${OG_WIDTH}×${OG_HEIGHT})\n`);
} finally {
  await browser.close();
}
