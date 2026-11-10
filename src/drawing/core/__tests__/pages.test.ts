/**
 * The paper a drawing is laid out on and the size of its saved figure: the
 * sizes offered, how a sheet lies and is placed over the drawing, and both read
 * back from a file inside the limits.
 */

import { expect, test } from 'vitest';

import {
  A4,
  PAGE_LIMITS,
  PAGE_SIZES,
  PAPER_SIZES,
  POINTS_PER_CM,
  SLIDE_SIZES,
  US_LETTER,
  centimetres,
  clampSide,
  orientationOf,
  pageOver,
  parseFigureSize,
  parsePage,
  pickedPage,
  placedPage,
  sameFigureSize,
  samePaper,
  sizeInMillimetres,
  turnedTo,
} from '../pages.ts';

test('a figure read back keeps the sides it sets, inside the limits', () => {
  expect(parseFigureSize({ width: 240 })).toStrictEqual({ width: 240 });
  expect(parseFigureSize({ height: 120 })).toStrictEqual({ height: 120 });
  expect(parseFigureSize({ width: 595.28, height: 841.89 })).toStrictEqual({
    width: 595.28,
    height: 841.89,
  });
  expect(parseFigureSize({ width: 1, height: 1e9 })).toStrictEqual({
    width: PAGE_LIMITS.min,
    height: PAGE_LIMITS.max,
  });
  expect(parseFigureSize({ width: '240', height: Number.NaN })).toBeUndefined();
  expect(parseFigureSize({})).toBeUndefined();
  expect(parseFigureSize(null)).toBeUndefined();
  expect(parseFigureSize([240])).toBeUndefined();
});

test('a sheet read back needs both sides, and keeps its place', () => {
  expect(parsePage({ width: 300, height: 200, x: -40, y: 12.5 })).toStrictEqual(
    { width: 300, height: 200, x: -40, y: 12.5 },
  );
  expect(parsePage({ width: 300, height: 200, x: '4' })).toStrictEqual({
    width: 300,
    height: 200,
  });
  expect(parsePage({ width: 1, height: 1e9 })).toStrictEqual({
    width: PAGE_LIMITS.min,
    height: PAGE_LIMITS.max,
  });
  expect(parsePage({ width: 300 })).toBeUndefined();
  expect(parsePage({ width: 300, height: Infinity })).toBeUndefined();
  expect(parsePage(null)).toBeUndefined();
});

test('a side is kept between a centimetre and three metres', () => {
  expect(POINTS_PER_CM).toBeCloseTo(28.3465, 4);
  expect(clampSide(10)).toBe(PAGE_LIMITS.min);
  expect(clampSide(500)).toBe(500);
  expect(clampSide(1e6)).toBe(PAGE_LIMITS.max);
  expect(PAGE_LIMITS.max).toBeCloseTo(8503.937, 3);
});

test('two figures are the same size to a hundredth of a point', () => {
  expect(sameFigureSize(undefined, undefined)).toBe(true);
  expect(sameFigureSize({ width: 240 }, { width: 240.004 })).toBe(true);
  expect(sameFigureSize({ width: 240 }, { width: 240.02 })).toBe(false);
  expect(sameFigureSize({ width: 240 }, { width: 240, height: 300 })).toBe(
    false,
  );
  expect(sameFigureSize({ width: 240 }, undefined)).toBe(false);
});

test('the papers are offered upright, and the slides lying wide', () => {
  expect(PAPER_SIZES.map((paper) => paper.id)).toStrictEqual([
    'a3',
    'a4',
    'a5',
    'letter',
    'legal',
  ]);
  expect(PAPER_SIZES[1]?.size).toStrictEqual({ width: 595.28, height: 841.89 });
  expect(centimetres(595.28)).toBe('21.0 cm');
  expect(centimetres(841.89)).toBe('29.7 cm');
  expect(sizeInMillimetres(595.28, 841.89)).toBe('210.0 × 297.0 mm');
  expect(sizeInMillimetres(480, 240)).toBe('169.3 × 84.7 mm');
});

test('the slides are offered as pages, after the papers', () => {
  expect(PAGE_SIZES.map((size) => size.name)).toStrictEqual([
    'A3',
    'A4',
    'A5',
    'US Letter',
    'US Legal',
    'Slide 16:9',
    'Slide 4:3',
  ]);
  expect(SLIDE_SIZES[0]?.size).toStrictEqual({ width: 960, height: 540 });
  expect(SLIDE_SIZES[1]?.size).toStrictEqual({ width: 720, height: 540 });
});

test('a slide picked lies wide; a paper picked lies the way the page does', () => {
  const wide = { width: 841.89, height: 595.28 };
  const slide = { width: 960, height: 540 };

  expect(pickedPage(slide, A4)).toStrictEqual(slide);
  expect(pickedPage(slide, wide)).toStrictEqual(slide);
  expect(pickedPage(US_LETTER, A4)).toStrictEqual(US_LETTER);
  expect(pickedPage(US_LETTER, slide)).toStrictEqual({
    width: 792,
    height: 612,
  });
});

test('a sheet can be turned, a square one counting as upright', () => {
  expect(orientationOf(A4)).toBe('portrait');
  expect(orientationOf({ width: 300, height: 300 })).toBe('portrait');
  expect(turnedTo(A4, 'portrait')).toBe(A4);
  expect(turnedTo(A4, 'landscape')).toStrictEqual({
    width: 841.89,
    height: 595.28,
  });
});

test('a paper is the same whichever way it lies', () => {
  const placed = { ...A4, x: 12, y: 40 };

  expect(samePaper(A4, { width: 841.89, height: 595.28 })).toBe(true);
  expect(samePaper(A4, placed)).toBe(true);
  expect(samePaper(A4, US_LETTER)).toBe(false);
});

test('a drawing that fits a sheet is centred on it', () => {
  const fitted = { x: 10, y: 20, width: 100, height: 40 };

  expect(pageOver({ width: 200, height: 100 }, fitted)).toStrictEqual({
    width: 200,
    height: 100,
    x: -40,
    y: -10,
  });
});

test('a drawing longer than a sheet starts at its edge, side by side', () => {
  const fitted = { x: 10, y: 20, width: 300, height: 40 };

  expect(pageOver({ width: 200, height: 100 }, fitted)).toStrictEqual({
    width: 200,
    height: 100,
    x: 10,
    y: -10,
  });
});

test('laid over a drawing anew, a sheet forgets where it was', () => {
  const fitted = { x: 10, y: 20, width: 100, height: 40 };
  const placed = { width: 200, height: 100, x: 500, y: 500 };

  expect(pageOver(placed, fitted)).toStrictEqual({
    width: 200,
    height: 100,
    x: -40,
    y: -10,
  });
  expect(placedPage(placed, fitted)).toStrictEqual(placed);
});
