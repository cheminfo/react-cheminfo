import { expect, test } from 'vitest';

import type { ParallelAxisLayout } from '../parallelAxes.ts';
import { parallelAxisLayouts } from '../parallelAxes.ts';
import type { ParallelBand, ParallelBrushDrag } from '../parallelBrush.ts';
import {
  parallelBandAt,
  parallelBandOf,
  parallelBrushGrip,
  parallelIsBand,
  parallelRangeOf,
} from '../parallelBrush.ts';

const HEIGHT = 200;
const BAND: ParallelBand = { top: 60, bottom: 120 };

test('a press on a bare axis starts a new band', () => {
  expect(parallelBrushGrip(40, null)).toBe('create');
  expect(parallelBrushGrip(200, null)).toBe('create');
});

test('a press within a few pixels of an edge takes that edge', () => {
  expect(parallelBrushGrip(60, BAND)).toBe('top');
  expect(parallelBrushGrip(63, BAND)).toBe('top');
  expect(parallelBrushGrip(118, BAND)).toBe('bottom');
  expect(parallelBrushGrip(124, BAND)).toBe('bottom');
});

test('a press inside the band moves it, and one outside starts afresh', () => {
  expect(parallelBrushGrip(90, BAND)).toBe('move');
  expect(parallelBrushGrip(20, BAND)).toBe('create');
  expect(parallelBrushGrip(180, BAND)).toBe('create');
});

test('a band being drawn orders its edges and stops at both ends', () => {
  const drag = dragging('create', 80, { top: 80, bottom: 80 });

  expect(parallelBandAt(drag, 140, HEIGHT)).toStrictEqual({
    top: 80,
    bottom: 140,
  });
  expect(parallelBandAt(drag, 20, HEIGHT)).toStrictEqual({
    top: 20,
    bottom: 80,
  });
  expect(parallelBandAt(drag, -40, HEIGHT)).toStrictEqual({
    top: 0,
    bottom: 80,
  });
  expect(parallelBandAt(drag, 900, HEIGHT)).toStrictEqual({
    top: 80,
    bottom: HEIGHT,
  });
});

test('a band being moved keeps its height and stops at both ends', () => {
  const drag = dragging('move', 90, BAND);

  expect(parallelBandAt(drag, 110, HEIGHT)).toStrictEqual({
    top: 80,
    bottom: 140,
  });
  expect(parallelBandAt(drag, -500, HEIGHT)).toStrictEqual({
    top: 0,
    bottom: 60,
  });
  expect(parallelBandAt(drag, 500, HEIGHT)).toStrictEqual({
    top: 140,
    bottom: HEIGHT,
  });
});

test('dragging one edge past the other swaps them', () => {
  const drag = dragging('top', 60, BAND);

  expect(parallelBandAt(drag, 170, HEIGHT)).toStrictEqual({
    top: 120,
    bottom: 170,
  });

  const bottom = dragging('bottom', 120, BAND);

  expect(parallelBandAt(bottom, 10, HEIGHT)).toStrictEqual({
    top: 10,
    bottom: 60,
  });
});

test('a release that drew nothing is a click, not a band', () => {
  expect(parallelIsBand({ top: 80, bottom: 80 })).toBe(false);
  expect(parallelIsBand({ top: 80, bottom: 80.5 })).toBe(false);
  expect(parallelIsBand({ top: 80, bottom: 81 })).toBe(true);
});

test('a band reports the interval it keeps, low value first', () => {
  const axis = axisAt(0, 200);

  expect(parallelRangeOf({ top: 40, bottom: 140 }, axis)).toStrictEqual([
    60, 160,
  ]);
});

test('an interval and its band are each other s inverse', () => {
  const axis = axisAt(-3.25, 8.75);
  const band = parallelBandOf([1.5, 6.25], axis);

  expect(band.top).toBeLessThan(band.bottom);

  const [low, high] = parallelRangeOf(band, axis);

  expect(low).toBeCloseTo(1.5, 9);
  expect(high).toBeCloseTo(6.25, 9);
});

test('a logarithmic axis brushes in its own units', () => {
  const axis = axisAt(1, 10_000, 'log');
  const band = parallelBandOf([10, 1000], axis);

  expect(band.top).toBeCloseTo(50, 9);
  expect(band.bottom).toBeCloseTo(150, 9);

  const [low, high] = parallelRangeOf(band, axis);

  expect(low).toBeCloseTo(10, 6);
  expect(high).toBeCloseTo(1000, 6);
});

test('a band dragged to the top of an axis keeps the row sitting on its maximum', () => {
  // Inverting the placement is not exact: for this domain over osiris's own
  // drawing area it lands one ulp below the maximum, so the row drawn on the
  // top of the axis fell outside its own full-range brush.
  const axis = axisAt(180.15851999999998, 418.57171999999997, undefined, 292);

  expect(parallelRangeOf({ top: 0, bottom: 150 }, axis)[1]).toBe(axis.max);
  expect(parallelRangeOf({ top: 0, bottom: 292 }, axis)).toStrictEqual([
    axis.min,
    axis.max,
  ]);
});

test('a band dragged to the bottom of an axis keeps the row sitting on its minimum', () => {
  const axis = axisAt(46.07, 285.34, undefined, 292);

  expect(parallelRangeOf({ top: 150, bottom: 292 }, axis)[0]).toBe(axis.min);
});

test('an end whose own pixel falls outside the drawing area is still reachable', () => {
  // These two domains place `max` a hair above the top of the area, and `min`
  // a hair below its bottom, so a band clamped to the area never covers the
  // pixel the extreme row is drawn on.
  const high = axisAt(422.03, 916.3799999999999, undefined, 292);
  const low = axisAt(442.72, 775.6600000000001, undefined, 292);

  expect(parallelRangeOf({ top: 0, bottom: 150 }, high)[1]).toBe(high.max);
  expect(parallelRangeOf({ top: 150, bottom: 292 }, low)[0]).toBe(low.min);
});

test('a logarithmic band reaching an end reports that end exactly', () => {
  const axis = axisAt(1.7, 9_400, 'log', 292);

  expect(parallelRangeOf({ top: 0, bottom: 292 }, axis)).toStrictEqual([
    axis.min,
    axis.max,
  ]);
});

function dragging(
  grip: ParallelBrushDrag['grip'],
  originY: number,
  origin: ParallelBand,
): ParallelBrushDrag {
  return {
    axis: 'mw',
    index: grip === 'create' ? -1 : 0,
    grip,
    originY,
    origin,
  };
}

function axisAt(
  min: number,
  max: number,
  scale?: 'linear' | 'log',
  height: number = HEIGHT,
): ParallelAxisLayout {
  const layouts = parallelAxisLayouts(
    [
      {
        id: 'mw',
        label: 'MW',
        values: new Float64Array(0),
        domain: [min, max],
        scale,
      },
    ],
    0,
    0,
    height,
  );
  return layouts[0] as ParallelAxisLayout;
}
