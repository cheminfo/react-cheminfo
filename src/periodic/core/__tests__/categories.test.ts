import { expect, test } from 'vitest';

import { contrastRatio } from '../../../color/core/contrast.ts';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  UNKNOWN_SWATCH,
  categorySwatch,
} from '../categories.ts';
import { PERIODIC_ELEMENTS } from '../elements.ts';

test('the legend lists every family exactly once', () => {
  expect(CATEGORY_ORDER).toHaveLength(10);
  expect(new Set(CATEGORY_ORDER).size).toBe(10);
});

test('every family a table can draw carries a label and a colour', () => {
  for (const element of PERIODIC_ELEMENTS) {
    expect(CATEGORY_ORDER).toContain(element.category);
    expect(CATEGORY_LABELS[element.category]).not.toBe('');
    expect(categorySwatch(element.category)).not.toStrictEqual(UNKNOWN_SWATCH);
  }
});

test('each family colour is paired with an ink that reads on it', () => {
  for (const category of CATEGORY_ORDER) {
    const swatch = categorySwatch(category);

    expect(swatch.background).toMatch(/^#[0-9a-f]{6}$/);
    // WCAG AA for the symbol, which is the largest thing in the cell.
    expect(
      contrastRatio(swatch.background, swatch.foreground),
    ).toBeGreaterThanOrEqual(4.5);
  }
});

test('the ten colours are distinct', () => {
  const backgrounds = CATEGORY_ORDER.map(
    (category) => categorySwatch(category).background,
  );

  expect(new Set(backgrounds).size).toBe(10);
});

test('an unknown family still gets a readable swatch', () => {
  expect(UNKNOWN_SWATCH.background).toBe('#e4e8ee');
  expect(UNKNOWN_SWATCH.foreground).toBe('#182026');
});
