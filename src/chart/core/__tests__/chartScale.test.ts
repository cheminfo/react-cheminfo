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
  expect(chartScale(0, 10, 0, Number.NaN)).toStrictEqual({
    offset: 0,
    factor: 0,
  });
});
