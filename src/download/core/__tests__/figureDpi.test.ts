import { expect, test } from 'vitest';

import {
  dpiScale,
  figureCentimetres,
  figureDpi,
  figureResolutionLabel,
  formatFigureCentimetres,
} from '../figureDpi.ts';

test('a pixel of the page is a ninety-sixth of an inch', () => {
  expect(dpiScale(96)).toBe(1);
  expect(dpiScale(300)).toBe(3.125);
  expect(figureDpi(dpiScale(150))).toBe(150);
  expect(figureDpi(2)).toBe(192);
});

test('a resolution reads as a multiple or in dots per inch', () => {
  expect(figureResolutionLabel(2, 'multiple')).toBe('2×');
  expect(figureResolutionLabel(dpiScale(600), 'dpi')).toBe('600 dpi');
});

test('a figure prints at its size on the page', () => {
  // A journal column, 8.5 cm, is 321.26 pixels of the page.
  const printed = figureCentimetres({ width: 321.2598, height: 96 });

  expect(printed.width).toBeCloseTo(8.5, 4);
  expect(printed.height).toBeCloseTo(2.54, 10);
});

test('the printed size is written in the language of the page', () => {
  const size = { width: 321.2598, height: 96 };

  expect(formatFigureCentimetres(size, 'en')).toStrictEqual({
    width: '8.5',
    height: '2.5',
  });
  expect(formatFigureCentimetres(size, 'fr')).toStrictEqual({
    width: '8,5',
    height: '2,5',
  });
});
