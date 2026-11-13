import { expect, test } from 'vitest';

import {
  FIGURE_COLUMN_WIDTH,
  FIGURE_DOUBLE_COLUMN_WIDTH,
  FIGURE_LAYOUT_MAX,
  FIGURE_LAYOUT_MIN,
  figureLayoutRedraws,
  figureLayoutSide,
  figureLayoutSize,
} from '../figureLayout.ts';

const SCREEN = { width: 766, height: 320 };

test('as shown is the figure on screen, untouched', () => {
  expect(figureLayoutSize('screen', SCREEN)).toStrictEqual({
    width: 766,
    height: 320,
  });
});

test('two journal columns are 17.5 cm wide and keep the proportions on screen', () => {
  expect(FIGURE_DOUBLE_COLUMN_WIDTH).toBe(Math.round((17.5 / 2.54) * 96));
  expect(figureLayoutSize('double', SCREEN)).toStrictEqual({
    width: 661,
    height: 276,
  });
});

test('a journal column is 8.5 cm wide and keeps the proportions on screen', () => {
  expect(FIGURE_COLUMN_WIDTH).toBe(Math.round((8.5 / 2.54) * 96));
  expect(figureLayoutSize('column', SCREEN)).toStrictEqual({
    width: 321,
    height: 134,
  });
});

test('a custom width is taken as typed, in whole pixels, and keeps the proportions', () => {
  expect(figureLayoutSize('custom', SCREEN, 1200.4)).toStrictEqual({
    width: 1200,
    height: 501,
  });
});

test('a custom size never typed falls back to the figure on screen', () => {
  expect(figureLayoutSize('custom', SCREEN)).toStrictEqual({
    width: 766,
    height: 320,
  });
});

test('a side is held to the range a figure can be drawn at', () => {
  expect(figureLayoutSide(12)).toBe(FIGURE_LAYOUT_MIN);
  expect(figureLayoutSide(100_000)).toBe(FIGURE_LAYOUT_MAX);
  expect(figureLayoutSide(Number.NaN)).toBe(FIGURE_LAYOUT_MIN);
  expect(figureLayoutSide(640.5)).toBe(641);
});

test('a column of a figure with no width still gets a height', () => {
  expect(figureLayoutSize('column', { width: 0, height: 300 })).toStrictEqual({
    width: 321,
    height: FIGURE_LAYOUT_MAX,
  });
});

test('only a size that differs from the screen draws the figure again', () => {
  expect(figureLayoutRedraws('screen', SCREEN)).toBe(false);
  expect(figureLayoutRedraws('custom', SCREEN)).toBe(false);
  expect(figureLayoutRedraws('column', SCREEN)).toBe(true);
  expect(figureLayoutRedraws('column', { width: 321, height: 200 })).toBe(
    false,
  );
});
