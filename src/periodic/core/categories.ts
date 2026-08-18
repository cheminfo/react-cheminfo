/**
 * What each family is called, and the colour it takes.
 *
 * Ten hues that stay distinguishable under deuteranopia and protanopia, and
 * that keep the metals warm and the non-metals cool the way a wall chart does.
 * Each is paired at load with the ink that stays readable on it, so a cell
 * never has to compute a contrast while it renders.
 */

import { readableInk } from '../../color/core/contrast.ts';
import type { Swatch } from '../../color/core/scale.ts';

import type { ElementCategory } from './elements.ts';

/** Families in the order a legend lists them, which is the order of the table. */
export const CATEGORY_ORDER: readonly ElementCategory[] = [
  'alkali-metal',
  'alkaline-earth-metal',
  'transition-metal',
  'post-transition-metal',
  'metalloid',
  'nonmetal',
  'halogen',
  'noble-gas',
  'lanthanoid',
  'actinoid',
];

/** What each family is called in a legend. */
export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  'alkali-metal': 'Alkali metal',
  'alkaline-earth-metal': 'Alkaline earth',
  'transition-metal': 'Transition metal',
  'post-transition-metal': 'Post-transition',
  metalloid: 'Metalloid',
  nonmetal: 'Non-metal',
  halogen: 'Halogen',
  'noble-gas': 'Noble gas',
  lanthanoid: 'Lanthanoid',
  actinoid: 'Actinoid',
};

const CATEGORY_BACKGROUNDS: Record<ElementCategory, string> = {
  'alkali-metal': '#f4a58a',
  'alkaline-earth-metal': '#f6c98a',
  'transition-metal': '#e8b7d4',
  'post-transition-metal': '#c8c3ea',
  metalloid: '#c9d67c',
  nonmetal: '#7fd4a8',
  halogen: '#8fd9d2',
  'noble-gas': '#9ec9f0',
  lanthanoid: '#f2d06b',
  actinoid: '#e5a3a3',
};

/** The colour of each family, with the ink that stays readable on it. */
export const CATEGORY_SWATCHES: Record<ElementCategory, Swatch> =
  Object.fromEntries(
    CATEGORY_ORDER.map((category) => [
      category,
      {
        background: CATEGORY_BACKGROUNDS[category],
        foreground: readableInk(CATEGORY_BACKGROUNDS[category]),
      },
    ]),
  ) as Record<ElementCategory, Swatch>;

const UNKNOWN_BACKGROUND = '#e4e8ee';

/** Shown for a cell whose family is unknown. */
export const UNKNOWN_SWATCH: Swatch = {
  background: UNKNOWN_BACKGROUND,
  foreground: readableInk(UNKNOWN_BACKGROUND),
};

/**
 * The swatch of one family.
 * @param category - Family to look up.
 * @returns Its colour and the ink to write on it.
 */
export function categorySwatch(category: ElementCategory): Swatch {
  return CATEGORY_SWATCHES[category] ?? UNKNOWN_SWATCH;
}
