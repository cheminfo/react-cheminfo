import { expect, test } from 'vitest';

import { chartScale } from '../../../chart/core/chartScale.ts';
import { tracePath } from '../tracePath.ts';

/** Two pixels to the eV, which keeps every column its own. */
const xScale = chartScale(0, 100, 0, 200);

/** The same window drawn backwards, as a binding-energy axis is. */
const reversedScale = chartScale(0, 100, 200, 0);

/** One pixel to ten counts, upside down as SVG counts pixels. */
const yScale = chartScale(0, 100, 100, 0);

test('a trace is one path, the L written once', () => {
  const path = tracePath([0, 25, 50], [0, 100, 50], xScale, yScale);

  expect(path).toBe('M0 100L50 0 100 50');
});

test('a reversed axis draws ascending data from right to left', () => {
  const path = tracePath([0, 50, 100], [0, 50, 100], reversedScale, yScale);

  expect(path).toBe('M200 100L100 50 0 0');
});

test('coordinates are written to a hundredth of a pixel', () => {
  const path = tracePath([1 / 3], [2 / 3], xScale, yScale);

  expect(path).toBe('M0.67 99.33');
});

test('a column of several samples is drawn as its two extremes', () => {
  const crowded = chartScale(0, 100, 0, 10);
  // Four samples land on pixels 0, 0.1, 0.2 and 0.3, which is one column.
  const path = tracePath([0, 1, 2, 3], [10, 90, 20, 80], crowded, yScale);

  expect(path).toBe('M0 90L0 10');
});

test('the extremes are written in the direction the trace travels', () => {
  const crowded = chartScale(0, 100, 0, 10);
  const rising = tracePath([0, 1, 2, 3], [10, 20, 30, 40], crowded, yScale);
  const falling = tracePath([0, 1, 2, 3], [40, 30, 20, 10], crowded, yScale);

  expect(rising).toBe('M0 90L0 60');
  expect(falling).toBe('M0 60L0 90');
});

test('a column of one sample keeps the pixel it was measured at', () => {
  const path = tracePath([1, 2], [10, 20], xScale, yScale);

  expect(path).toBe('M2 90L4 80');
});

test('a sample that maps nowhere breaks the line rather than being skipped', () => {
  const path = tracePath(
    [0, 25, 50, 75],
    [10, Number.NaN, 30, 40],
    xScale,
    yScale,
  );

  expect(path).toBe('M0 90M100 70L150 60');
});

test('an empty trace draws nothing and a single sample draws no line', () => {
  expect(tracePath([], [], xScale, yScale)).toBe('');
  expect(tracePath([50], [50], xScale, yScale)).toBe('M100 50');
});

test('a trace whose columns disagree is drawn as far as both go', () => {
  expect(tracePath([0, 25, 50], [10, 20], xScale, yScale)).toBe('M0 90L50 80');
});
