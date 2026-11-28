import { readFileSync } from 'node:fs';

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openFigurePanel, save } from './figurePanel.ts';
import { openStory } from './story.ts';

// The embedded viewer, whose points are coloured by species.
const IRIS = 'projection-pcaviewer--iris';

/** Every value a paint attribute or declaration is given, as written. */
const PAINT =
  /(?:\s(?:fill|stroke|stop-color|color)=["']|[\s;{"](?:fill|stroke|stop-color|color):\s*)(?<value>[^"';}]*)/gu;

/** A paint that names no colour, which no choice changes. */
const NO_COLOR = /^(?:none|transparent|currentColor|inherit|url\(.*\))$/u;

/** A colour as the export writes it: six hex digits, or `rgb()` / `rgba()`. */
const WRITTEN_COLOR =
  /^#(?<hex>[\da-f]{6})$|^rgba?\((?<red>\d+), (?<green>\d+), (?<blue>\d+)/u;

/**
 * Pick the colours, save the SVG, and read the value of every paint in it.
 * @param page - The page showing the open panel.
 * @param colors - The segment to pick.
 * @returns The values, in document order.
 */
async function savedPaints(page: Page, colors: string): Promise<string[]> {
  await page.getByRole('radio', { name: colors, exact: true }).click();
  const download = await save(page);
  const markup = readFileSync(await download.path(), 'utf8');
  const paints: string[] = [];
  for (const match of markup.matchAll(PAINT)) {
    paints.push((match.groups?.value ?? '').trim());
  }
  return paints;
}

/**
 * The paints that are neither a colour-free value nor a grey of the levels
 * allowed.
 * @param paints - The values, as written.
 * @param levels - The grey levels allowed, or `null` for any.
 * @returns The paints that break the rule.
 */
function notGrey(
  paints: readonly string[],
  levels: readonly number[] | null,
): string[] {
  const wrong: string[] = [];
  for (const paint of paints) {
    if (NO_COLOR.test(paint)) continue;
    const groups = WRITTEN_COLOR.exec(paint)?.groups;
    const hex = groups?.hex;
    const red = hex ? hex.slice(0, 2) : groups?.red;
    const green = hex ? hex.slice(2, 4) : groups?.green;
    const blue = hex ? hex.slice(4, 6) : groups?.blue;
    const level = hex ? Number.parseInt(red ?? '', 16) : Number(red);
    const grey = red !== undefined && red === green && green === blue;
    if (!grey || (levels !== null && !levels.includes(level))) {
      wrong.push(paint);
    }
  }
  return wrong;
}

test('a figure saved in grey or in black and white keeps every paint, without its hue', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);
  await openFigurePanel(page);

  const colored = await savedPaints(page, 'Colour');
  expect(notGrey(colored, null).length).toBeGreaterThan(2);

  const grey = await savedPaints(page, 'Grey');
  expect(grey).toHaveLength(colored.length);
  expect(notGrey(grey, null)).toStrictEqual([]);

  // The paints that had a hue become ink or paper; the greys stay greys.
  const blackWhite = await savedPaints(page, 'Black and white');
  expect(blackWhite).toHaveLength(colored.length);
  expect(notGrey(blackWhite, null)).toStrictEqual([]);
  const inked: string[] = [];
  for (let index = 0; index < colored.length; index++) {
    if (hasHue(colored[index] ?? '')) inked.push(blackWhite[index] ?? '');
  }
  expect(inked.length).toBeGreaterThan(2);
  expect(notGrey(inked, [0, 255])).toStrictEqual([]);
});

/**
 * Whether a paint is a colour rather than one of the frame's greys, which are
 * a slate a few levels bluer than neutral.
 * @param paint - The value, as written.
 * @returns Whether its channels lie more than 40 levels apart.
 */
function hasHue(paint: string): boolean {
  const groups = WRITTEN_COLOR.exec(paint)?.groups;
  if (groups === undefined) return false;
  const hex = groups.hex;
  const channels = hex
    ? [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)]
    : [groups.red, groups.green, groups.blue];
  let low = 255;
  let high = 0;
  for (const channel of channels) {
    const level = hex
      ? Number.parseInt(channel ?? '', 16)
      : Number(channel ?? '');
    low = Math.min(low, level);
    high = Math.max(high, level);
  }
  return high - low > 40;
}
