import { expect, test } from 'vitest';

import type { ChartSize } from '../../core/chartGeometry.ts';
import { layoutSize, nextChartSize } from '../useChartSize.ts';

const held: ChartSize = { width: 640, height: 320 };

test('a wrapper scaled down by a transform is measured at its laid-out size', () => {
  // A popover opening from scale(0.3): painted at 192 × 54, laid out at 640 × 180.
  const element = box({ width: 192, height: 54 }, { width: 640, height: 180 });

  expect(layoutSize(element)).toStrictEqual({ width: 640, height: 180 });
});

test('an untransformed wrapper keeps its fractional size', () => {
  const element = box(
    { width: 639.5, height: 180.25 },
    { width: 640, height: 180 },
  );

  expect(layoutSize(element)).toStrictEqual({ width: 639.5, height: 180.25 });
});

test('an element without a laid-out size of its own is measured as painted', () => {
  const element = {
    getBoundingClientRect: () => ({ width: 320, height: 120 }),
  } as unknown as Element;

  expect(layoutSize(element)).toStrictEqual({ width: 320, height: 120 });
});

/**
 * A stand-in for an HTML element, painted at one size and laid out at another.
 * @param painted - What getBoundingClientRect reports.
 * @param painted.width - The painted width.
 * @param painted.height - The painted height.
 * @param laidOut - What offsetWidth and offsetHeight report.
 * @param laidOut.width - The laid-out width.
 * @param laidOut.height - The laid-out height.
 * @returns The element.
 */
function box(
  painted: { width: number; height: number },
  laidOut: { width: number; height: number },
): Element {
  return {
    getBoundingClientRect: () => painted,
    offsetWidth: laidOut.width,
    offsetHeight: laidOut.height,
  } as unknown as Element;
}

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
