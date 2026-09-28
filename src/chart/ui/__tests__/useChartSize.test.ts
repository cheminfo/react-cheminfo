import { expect, test } from 'vitest';

import type { ChartSize } from '../../core/chartGeometry.ts';
import { nextChartSize } from '../useChartSize.ts';

const held: ChartSize = { width: 640, height: 320 };

test('a measurement that changed nothing keeps the size already held', () => {
  expect(nextChartSize(held, 640, 320)).toBe(held);
});

test('a resize is taken, either way round', () => {
  expect(nextChartSize(held, 800, 320)).toStrictEqual({
    width: 800,
    height: 320,
  });
  expect(nextChartSize(held, 640, 200)).toStrictEqual({
    width: 640,
    height: 200,
  });
});

test('a fractional width is kept as measured', () => {
  expect(nextChartSize(held, 639.5, 320)).toStrictEqual({
    width: 639.5,
    height: 320,
  });
});

test('a chart folded away measures nothing rather than something impossible', () => {
  expect(nextChartSize(held, 0, 0)).toStrictEqual({ width: 0, height: 0 });
  expect(nextChartSize(held, -20, 320)).toStrictEqual({
    width: 0,
    height: 320,
  });
  expect(nextChartSize(held, Number.NaN, Number.NaN)).toStrictEqual({
    width: 0,
    height: 0,
  });
});

test('an element that is still not laid out keeps the nothing already held', () => {
  const nothing: ChartSize = { width: 0, height: 0 };

  expect(nextChartSize(nothing, 0, 0)).toBe(nothing);
  expect(nextChartSize(nothing, Number.NaN, -1)).toBe(nothing);
});
