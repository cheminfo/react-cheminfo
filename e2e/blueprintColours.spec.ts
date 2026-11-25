import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { parseHexColor } from '../src/color/core/hex.ts';
import { FAMILY_TOKEN_VALUES } from '../src/tokens/core/familyTokens.ts';

import { openStory } from './story.ts';

/*
 * `chrome.css` maps the greys and the blue Blueprint compiles in to the
 * family's tokens, and whether each rule wins against `blueprint.css` is a
 * question of specificity no string test of the stylesheet can answer: read
 * the colours a browser computes, under two sites' palettes.
 */

const STORY = 'tokens-blueprintcolours--in-the-family';

const MUTED = rgbOf(FAMILY_TOKEN_VALUES['--text-muted']);
const FAINT = rgbOf(FAMILY_TOKEN_VALUES['--text-faint']);
const TEXT = rgbOf(FAMILY_TOKEN_VALUES['--text']);
const BORDER = rgbOf(FAMILY_TOKEN_VALUES['--border']);
const SUNKEN = rgbOf(FAMILY_TOKEN_VALUES['--surface-sunken']);

for (const brand of ['vcl', 'isomers'] as const) {
  test(`Blueprint's controls take the family's colours under ${brand}'s palette`, async ({
    page,
  }) => {
    await openStory(page, STORY, `brand:${brand}`);
    await expect(page.getByText('Nothing here yet')).toBeVisible();
    const accent = rgbOf(
      await page.evaluate(() =>
        globalThis
          .getComputedStyle(document.documentElement)
          .getPropertyValue('--accent')
          .trim(),
      ),
    );

    // Read again until it holds: the book may draw the story a second time
    // once its palette is set, and a control replaced while it is read has no
    // colour at all.
    await expect
      .poll(() => inks(page))
      .toStrictEqual({
        spinnerHead: MUTED,
        spinnerTrack: BORDER,
        spinnerPrimaryHead: accent,
        progressTrack: BORDER,
        progressMeter: MUTED,
        progressPrimaryMeter: accent,
        menuIcon: MUTED,
        menuLabel: MUTED,
        calloutIcon: MUTED,
        selectIcon: MUTED,
        disabledInput: SUNKEN,
        primaryButton: accent,
        tableHeading: TEXT,
        tableCell: TEXT,
        link: accent,
        emptyTitle: MUTED,
        emptyGlyph: FAINT,
      });
  });
}

/** What a control's colour is read from. */
type InkProperty = 'backgroundColor' | 'color' | 'stroke';

/** Each mapped control: where it is, and which of its colours is mapped. */
const CONTROLS: Record<string, [selector: string, property: InkProperty]> = {
  spinnerHead: [
    '.bp6-spinner:not(.bp6-intent-primary) .bp6-spinner-head',
    'stroke',
  ],
  spinnerTrack: [
    '.bp6-spinner:not(.bp6-intent-primary) .bp6-spinner-track',
    'stroke',
  ],
  spinnerPrimaryHead: [
    '.bp6-spinner.bp6-intent-primary .bp6-spinner-head',
    'stroke',
  ],
  progressTrack: [
    '.bp6-progress-bar:not(.bp6-intent-primary)',
    'backgroundColor',
  ],
  progressMeter: [
    '.bp6-progress-bar:not(.bp6-intent-primary) .bp6-progress-meter',
    'backgroundColor',
  ],
  progressPrimaryMeter: [
    '.bp6-progress-bar.bp6-intent-primary .bp6-progress-meter',
    'backgroundColor',
  ],
  menuIcon: ['.bp6-menu-item .bp6-menu-item-icon', 'color'],
  menuLabel: ['.bp6-menu-item .bp6-menu-item-label', 'color'],
  calloutIcon: ['.bp6-callout > .bp6-icon:first-child', 'color'],
  selectIcon: ['.bp6-html-select .bp6-icon', 'color'],
  disabledInput: ['.bp6-input:disabled', 'backgroundColor'],
  primaryButton: ['.bp6-button.bp6-intent-primary', 'backgroundColor'],
  tableHeading: ['table.bp6-html-table th', 'color'],
  tableCell: ['table.bp6-html-table td', 'color'],
  link: ['a[href="#a-link"]', 'color'],
  emptyTitle: ['.bp6-non-ideal-state .bp6-heading', 'color'],
  emptyGlyph: ['.bp6-non-ideal-state-visual', 'color'],
};

/**
 * The colour each mapped control is painted in, as the browser computed it.
 * @param page - The page showing the story.
 * @returns The colours, by control.
 */
async function inks(page: Page): Promise<Record<string, string>> {
  const entries = await Promise.all(
    Object.entries(CONTROLS).map(async ([name, [selector, property]]) => [
      name,
      await page
        .locator(selector)
        .first()
        .evaluate(
          (element, read) => globalThis.getComputedStyle(element)[read],
          property,
        ),
    ]),
  );
  return Object.fromEntries(entries);
}

/**
 * A colour as a browser computes it.
 * @param hex - The colour, `#rrggbb`.
 * @returns It as `rgb(r, g, b)`.
 */
function rgbOf(hex: string): string {
  const { red, green, blue } = parseHexColor(hex);
  return `rgb(${red}, ${green}, ${blue})`;
}
