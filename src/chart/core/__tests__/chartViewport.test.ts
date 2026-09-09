import { expect, test } from 'vitest';

import type { ChartViewport } from '../chartViewport.ts';
import {
  CHART_WHEEL_LARGEST,
  chartClampViewport,
  chartWheelFactor,
  chartZoomDomain,
  chartZoomViewport,
} from '../chartViewport.ts';

const FULL: ChartViewport = { x: [0, 100], y: [-40, 40] };

test('zooming in about a point leaves that point where it was', () => {
  const zoomed = chartZoomViewport(FULL, null, 25, 0, 0.5);

  expect(zoomed).toStrictEqual({ x: [12.5, 62.5], y: [-20, 20] });
  // A quarter of the way across before, and a quarter of the way across after.
  expect(shareOf(zoomed?.x, 25)).toBe(0.25);
  expect(shareOf(zoomed?.y, 0)).toBe(0.5);
});

test('zooming back out hands back the unzoomed chart rather than a copy of it', () => {
  const near = { x: [10, 20], y: [0, 5] } as const;

  expect(chartZoomViewport(FULL, near, 15, 2, 100)).toBeNull();
  expect(chartZoomViewport(FULL, near, 15, 2, 4)).toStrictEqual({
    x: [0, 40],
    y: [-6, 14],
  });
});

test('a frame that would reach past an end is slid back inside, keeping its span', () => {
  const zoomed = chartZoomDomain([0, 100], [0, 10], 2, 2);

  // Twenty wide, as asked, and against the left end rather than at -2.
  expect(zoomed).toStrictEqual([0, 20]);
  expect(chartZoomDomain([0, 100], [90, 100], 99, 2)).toStrictEqual([80, 100]);
});

test('the zoom stops at a five hundredth of the axis', () => {
  const capped = chartZoomDomain([0, 100], [40, 60], 50, 0.001);

  expect(capped).toStrictEqual([49.9, 50.1]);
});

test('a frame around one sample is drawn at the cap, not thrown away', () => {
  const single = chartClampViewport(FULL, { x: [50, 50], y: [10, 10] });

  expect(single).toStrictEqual({ x: [49.9, 50.1], y: [9.92, 10.08] });
});

test('a frame asked for is kept as it is when it already fits', () => {
  const wanted = { x: [20, 30], y: [0, 4] } as const;

  expect(chartClampViewport(FULL, wanted)).toStrictEqual(wanted);
  expect(chartClampViewport(FULL, { x: [-10, 200], y: [-99, 99] })).toBeNull();
});

test('a wheel notch zooms the same whether the browser counts pixels or lines', () => {
  const lines = chartWheelFactor(3, 1);

  expect(lines).toBe(chartWheelFactor(48, 0));
  expect(lines).toBeCloseTo(1.074655, 6);
});

test('scrolling away zooms out, scrolling towards zooms in, and a flick is capped', () => {
  expect(chartWheelFactor(100)).toBeCloseTo(1.161834, 6);
  expect(chartWheelFactor(-100)).toBeCloseTo(0.860708, 6);
  expect(chartWheelFactor(100_000)).toBe(CHART_WHEEL_LARGEST);
  expect(chartWheelFactor(-100_000)).toBe(1 / CHART_WHEEL_LARGEST);
  expect(chartWheelFactor(0)).toBe(1);
  expect(chartWheelFactor(Number.NaN)).toBe(1);
});

/**
 * Where a value sits across a range, which is what a zoom about a point has to
 * hold still.
 * @param domain - The range, or `undefined` when there was no viewport at all.
 * @param value - The value.
 * @returns The share, from 0 to 1.
 */
function shareOf(
  domain: readonly [number, number] | undefined,
  value: number,
): number {
  if (domain === undefined) return Number.NaN;
  return (value - domain[0]) / (domain[1] - domain[0]);
}
