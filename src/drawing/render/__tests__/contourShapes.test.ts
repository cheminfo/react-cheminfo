/**
 * The outlines glass is drawn with: arcs that stay on their circle, a half
 * turned into a whole on a lathe, outlines walked backwards and mirrored, and
 * the crescents and streaks of light on shaded glass.
 */

import { expect, test } from 'vitest';

import { contourEnd, sampleContour } from '../contour.ts';
import {
  circleContour,
  crescent,
  roundBottomSide,
  segmentContour,
  smoothContour,
  streak,
} from '../contourShapes.ts';
import {
  lathe,
  latheSide,
  mirrorContour,
  reverseContour,
} from '../contourTransforms.ts';
import { pathData } from '../markup.ts';
import { Pen } from '../pen.ts';

test('an arc is written as cubics that stay on the circle', () => {
  const points = sampleContour(circleContour(0, 0, 10), 16);

  expect(points).toHaveLength(64);

  for (const point of points) {
    expect(Math.hypot(point.x, point.y)).toBeCloseTo(10, 2);
  }
});

test('a half and its mirror image close into one outline', () => {
  const half = new Pen(0, 0).line(5, 0).line(5, 10).line(0, 10).open();
  const whole = lathe(half);

  expect(whole.closed).toBe(true);
  expect(pathData(whole)).toBe('M0 0L5 0L5 10L0 10L-5 10L-5 0L0 0Z');
});

test('a side leaving the axis is turned into what a vessel holds', () => {
  const side = new Pen(5, 0).line(5, 10).line(0, 10).open();

  expect(pathData(latheSide(side))).toBe('M0 0L5 0L5 10L0 10L-5 10L-5 0L0 0Z');
});

test('an outline walked backwards swaps its control points', () => {
  const curve = new Pen(0, 0).curve(1, 2, 3, 4, 5, 6).open();
  const back = reverseContour(curve);

  expect(back.start).toStrictEqual({ x: 5, y: 6 });
  expect(back.segments).toStrictEqual([
    { c1: { x: 3, y: 4 }, c2: { x: 1, y: 2 }, to: { x: 0, y: 0 } },
  ]);
  expect(contourEnd(mirrorContour(curve))).toStrictEqual({ x: -5, y: 6 });
});

test('a segment is an open line, a smooth outline passes through its points', () => {
  expect(pathData(segmentContour({ x: 0, y: 0 }, { x: 3, y: 4 }))).toBe(
    'M0 0L3 4',
  );

  const smooth = smoothContour(
    [
      { x: 0, y: 0 },
      { x: 6, y: 0 },
      { x: 6, y: 6 },
    ],
    false,
  );

  expect(smooth.closed).toBe(false);
  expect(smooth.segments).toHaveLength(2);
  expect(contourEnd(smooth)).toStrictEqual({ x: 6, y: 6 });
});

test('a round-bottomed wall goes down the side and round to the axis', () => {
  const side = roundBottomSide(4, 0, 10);

  expect(side.start).toStrictEqual({ x: 4, y: 0 });

  const end = contourEnd(side);

  expect(end.x).toBeCloseTo(0, 9);
  expect(end.y).toBeCloseTo(14, 9);
});

test('a crescent and a streak of light are closed, and lie where they are drawn', () => {
  const light = crescent(10, 10, 5, 0, Math.PI / 2, 1);

  expect(light.closed).toBe(true);
  expect(light.start.x).toBeCloseTo(15, 9);
  expect(light.start.y).toBeCloseTo(10, 9);

  const shine = streak({ x: 0, y: 0 }, { x: 0, y: 10 }, 2);

  expect(shine.closed).toBe(true);
  expect(shine.segments).toHaveLength(6);
  expect(shine.start).toStrictEqual({ x: 0, y: 0 });
});
