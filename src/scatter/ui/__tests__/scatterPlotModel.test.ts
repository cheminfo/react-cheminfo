import { expect, test } from 'vitest';

import type { ChartViewport } from '../../../chart/core/chartViewport.ts';
import { scatterWheelViewport } from '../scatterPlotModel.ts';

const FULL: ChartViewport = { x: [0, 100], y: [-40, 40] };

test('the wheel zooms about the value under the pointer', () => {
  expect(scatterWheelViewport(FULL, null, 0.25, 0.5, 0.5)).toStrictEqual({
    x: [12.5, 62.5],
    y: [-20, 20],
  });
});

test('a pointer near the top of the plot anchors on the top of the vertical axis', () => {
  expect(scatterWheelViewport(FULL, null, 0, 0, 0.5)).toStrictEqual({
    x: [0, 50],
    y: [0, 40],
  });
  expect(scatterWheelViewport(FULL, null, 1, 1, 0.5)).toStrictEqual({
    x: [50, 100],
    y: [-40, 0],
  });
});

test('the anchor is read in the frame showing, not in the whole of the data', () => {
  const shown: ChartViewport = { x: [50, 100], y: [0, 40] };

  expect(scatterWheelViewport(FULL, shown, 0.5, 0.5, 0.5)).toStrictEqual({
    x: [62.5, 87.5],
    y: [10, 30],
  });
});

test('zooming back out past the data hands back the unzoomed chart', () => {
  const shown: ChartViewport = { x: [50, 100], y: [0, 40] };

  expect(scatterWheelViewport(FULL, shown, 0.5, 0.5, 100)).toBeNull();
});
