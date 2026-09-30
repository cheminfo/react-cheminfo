import { expect, test } from 'vitest';

import {
  FIGURE_COLUMN_WIDTH,
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

test('the slide shapes keep the width and change the height', () => {
  expect(figureLayoutSize('standard', SCREEN)).toStrictEqual({
    width: 766,
    height: 575,
  });
  expect(figureLayoutSize('wide', SCREEN)).toStrictEqual({
    width: 766,
    height: 431,
  });
});

test('a journal column is 8.5 cm wide and keeps the proportions on screen', () => {
  expect(FIGURE_COLUMN_WIDTH).toBe(Math.round((8.5 / 2.54) * 96));
  expect(figureLayoutSize('column', SCREEN)).toStrictEqual({
    width: 321,
    height: 134,
  });
});

test('a custom size is taken as typed, in whole pixels', () => {
  expect(
    figureLayoutSize('custom', SCREEN, { width: 1200.4, height: 799.6 }),
  ).toStrictEqual({ width: 1200, height: 800 });
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
  expect(figureLayoutRedraws('wide', SCREEN)).toBe(true);
  expect(figureLayoutRedraws('standard', { width: 400, height: 300 })).toBe(
    false,
  );
});
