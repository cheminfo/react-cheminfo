import { expect, test } from 'vitest';

import type { ChartStickSeries } from '../stickChartModel.ts';
import {
  nearestPosition,
  seriesDomain,
  spanOf,
  stickPath,
  valueAt,
} from '../stickChartModel.ts';

const FRAME = {
  plot: { top: 0, bottom: 100, left: 0, right: 100 },
  x: { offset: 10, factor: 20 },
  y: { offset: 50, factor: -10 },
};

const SERIES: ChartStickSeries = {
  id: 'pc1',
  label: 'PC1',
  values: [2, Number.NaN, -1],
  color: 'var(--accent)',
};

test('the nearest measurement is found at both ends and in between', () => {
  const positions = [1, 2, 4];

  expect(nearestPosition(positions, 0)).toBe(0);
  expect(nearestPosition(positions, 2.9)).toBe(1);
  expect(nearestPosition(positions, 3.1)).toBe(2);
  expect(nearestPosition(positions, 4)).toBe(2);
  expect(nearestPosition(positions, 9)).toBe(2);
});

test('a value halfway between two measurements picks the lower one', () => {
  expect(nearestPosition([1, 2, 4], 3)).toBe(1);
  expect(nearestPosition([1, 2, 4], 1.5)).toBe(0);
});

test('no measurement is found without positions or without a value', () => {
  expect(nearestPosition([], 1)).toBe(-1);
  expect(nearestPosition([1, 2], Number.NaN)).toBe(-1);
});

test('every finite value becomes one stick standing on zero', () => {
  expect(stickPath(SERIES, [0, 1, 2], FRAME)).toBe('M10 50V30M50 50V60');
});

test('a series with starts draws each stick between its start and its end', () => {
  const spans = { ...SERIES, from: [1, 0, Number.NaN] };

  expect(stickPath(spans, [0, 1, 2], FRAME)).toBe('M10 40V30');
});

test('the foot of a stick stays inside the plot when zero is off it', () => {
  const above = { ...FRAME, y: { offset: 140, factor: -10 } };

  expect(stickPath(SERIES, [0], above)).toBe('M10 100V120');
});

test('the axis span covers the peaks, and opens around a single one', () => {
  expect(spanOf([3, 1, 2])).toStrictEqual([1, 3]);
  expect(spanOf([5, 5])).toStrictEqual([4, 6]);
  expect(spanOf([])).toStrictEqual([0, 1]);
});

test('the vertical domain always holds zero', () => {
  const [low, high] = seriesDomain([{ ...SERIES, values: [2, 4] }], 2);

  expect(low).toBe(0);
  expect(high).toBeCloseTo(4.1, 10);
});

test('a pixel reads back as the value it stands for', () => {
  expect(valueAt({ offset: 10, factor: 2 }, 30)).toBe(10);
  expect(valueAt({ offset: 10, factor: 0 }, 30)).toBeNaN();
});
