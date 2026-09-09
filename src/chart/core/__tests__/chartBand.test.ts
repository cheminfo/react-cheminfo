import { expect, test } from 'vitest';

import { chartBand, chartBandCenter, chartBandIndexAt } from '../chartBand.ts';

test('four categories across four hundred pixels take a hundred each', () => {
  expect(chartBand(4, 0, 400)).toStrictEqual({
    offset: 0,
    step: 100,
    bandWidth: 80,
    count: 4,
  });
});

test('the padding is the share of a slot left empty between neighbours', () => {
  expect(chartBand(4, 0, 400, { padding: 0 }).bandWidth).toBe(100);
  expect(chartBand(4, 0, 400, { padding: 0.5 }).bandWidth).toBe(50);
  expect(chartBand(4, 0, 400, { padding: 5 }).bandWidth).toBeCloseTo(10, 10);
  expect(chartBand(4, 0, 400, { padding: -1 }).bandWidth).toBe(100);
});

test('a point, a bar and a tick all sit at the middle of their slot', () => {
  const band = chartBand(4, 0, 400);

  expect(chartBandCenter(band, 0)).toBe(50);
  expect(chartBandCenter(band, 1)).toBe(150);
  expect(chartBandCenter(band, 3)).toBe(350);
});

test('the pointer is held inside the axis it is tracking', () => {
  const band = chartBand(4, 0, 400);

  expect(chartBandIndexAt(band, -20)).toBe(0);
  expect(chartBandIndexAt(band, 149)).toBe(1);
  expect(chartBandIndexAt(band, 250)).toBe(2);
  expect(chartBandIndexAt(band, 999)).toBe(3);
});

test('an empty axis has no slot to divide by and no slot to point at', () => {
  const band = chartBand(0, 0, 400);

  expect(band).toStrictEqual({
    offset: 0,
    step: 0,
    bandWidth: 0,
    count: 0,
  });
  expect(chartBandIndexAt(band, 200)).toBe(-1);
  expect(chartBandIndexAt(chartBand(4, 0, 400), Number.NaN)).toBe(-1);
});

test('a range with no width is an empty axis rather than an infinite one', () => {
  expect(chartBand(4, 200, 200)).toStrictEqual({
    offset: 200,
    step: 0,
    bandWidth: 0,
    count: 4,
  });
  expect(chartBand(4, 0, Number.NaN).step).toBe(0);
});
