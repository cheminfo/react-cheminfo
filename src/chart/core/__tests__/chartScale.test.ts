import { expect, test } from 'vitest';

import { chartPixel, chartScale, chartValue } from '../chartScale.ts';

test('a domain laid across a range is two numbers a multiply-add reads', () => {
  expect(chartScale(0, 10, 0, 100)).toStrictEqual({ offset: 0, factor: 10 });
  expect(chartScale(2, 4, 0, 100)).toStrictEqual({ offset: -100, factor: 50 });
});

test('a y axis given its bottom first grows upward', () => {
  const scale = chartScale(0, 10, 400, 0);

  expect(scale).toStrictEqual({ offset: 400, factor: -40 });
  expect(chartPixel(scale, 0)).toBe(400);
  expect(chartPixel(scale, 5)).toBe(200);
  expect(chartPixel(scale, 10)).toBe(0);
});

test('a pixel reads back as the value it stands for', () => {
  const scale = chartScale(0, 10, 400, 0);

  expect(chartValue(scale, 200)).toBe(5);
  expect(chartValue(scale, 400)).toBe(0);
  expect(chartValue(chartScale(0, 10, 0, 100), 25)).toBe(2.5);
});

test('a constant column is pinned to the middle rather than vanishing', () => {
  const scale = chartScale(5, 5, 0, 100);

  expect(scale).toStrictEqual({ offset: 50, factor: 0 });
  expect(chartPixel(scale, 5)).toBe(50);
  expect(chartPixel(scale, 900)).toBe(50);
  expect(chartValue(scale, 12)).toBe(50);
});

test('a domain that is not finite falls back to the flat scale', () => {
  expect(chartScale(Number.NaN, 10, 0, 100)).toStrictEqual({
    offset: 50,
    factor: 0,
  });
  expect(chartScale(0, Number.POSITIVE_INFINITY, 0, 100)).toStrictEqual({
    offset: 50,
    factor: 0,
  });
});

test('a range that is not a range maps nowhere at all', () => {
  // A plot measured before it was laid out. There is no pixel a value could
  // honestly be put at, and every mark declines to draw what does not map.
  const scale = chartScale(0, 10, 0, Number.NaN);

  expect(scale.factor).toBe(0);
  expect(scale.offset).toBeNaN();
  expect(chartPixel(scale, 5)).toBeNaN();
});

test('a value outside the window still maps, so a clip can do the cutting', () => {
  const scale = chartScale(400, 500, 0, 200);

  expect(chartPixel(scale, 300)).toBe(-200);
  expect(chartPixel(scale, 600)).toBe(400);
});

test('a window of no width puts every value in the middle of the range', () => {
  const scale = chartScale(5, 5, 0, 200);

  expect(chartPixel(scale, 5)).toBe(100);
  expect(chartPixel(scale, 6)).toBe(100);
  expect(chartValue(scale, 0)).toBe(100);
});

test('a range of no width maps and inverts to that one pixel', () => {
  const scale = chartScale(0, 100, 40, 40);

  expect(chartPixel(scale, 75)).toBe(40);
  expect(chartValue(scale, 40)).toBe(40);
});
