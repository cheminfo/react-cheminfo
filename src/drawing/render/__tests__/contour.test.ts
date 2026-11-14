/**
 * Outlines drawn with a pen: lines, cubics, quadratics written as cubics,
 * arcs written as cubics on the circle, and outlines walked, ended and bounded.
 */

import { expect, test } from 'vitest';

import { bezierOf } from '../../core/curves.ts';
import type { Point } from '../../core/types.ts';
import type { Contour } from '../contour.ts';
import {
  Pen,
  contourBounds,
  contourEnd,
  isCubic,
  sampleContour,
} from '../contour.ts';

test('a pen keeps where it is, and closes or leaves open what it drew', () => {
  const pen = new Pen(1, 2);

  expect(pen.at).toStrictEqual({ x: 1, y: 2 });

  pen.line(5, 2).curve(6, 3, 7, 4, 8, 5);

  expect(pen.at).toStrictEqual({ x: 8, y: 5 });

  const closed = pen.close();

  expect(closed).toStrictEqual({
    start: { x: 1, y: 2 },
    segments: [
      { to: { x: 5, y: 2 } },
      { c1: { x: 6, y: 3 }, c2: { x: 7, y: 4 }, to: { x: 8, y: 5 } },
    ],
    closed: true,
  });
  expect(pen.open()).toStrictEqual({ ...closed, closed: false });
  expect(closed.segments.map(isCubic)).toStrictEqual([false, true]);
});

test('a quadratic is written as the cubic it is', () => {
  const contour = new Pen(0, 0).quad(3, 6, 6, 0).open();

  expect(contour.segments).toStrictEqual([
    { c1: { x: 2, y: 4 }, c2: { x: 4, y: 4 }, to: { x: 6, y: 0 } },
  ]);
});

test('an arc first goes to where it starts, then stays on the circle', () => {
  const contour = new Pen(0, 0).arc(0, 0, 10, 0, Math.PI).open();
  const [lead, ...rest] = contour.segments;
  const pieces = rest.filter(isCubic);

  expect(lead).toStrictEqual({ to: { x: 10, y: 0 } });
  expect(rest).toHaveLength(2);
  expect(pieces).toHaveLength(2);

  let from: Point = { x: 10, y: 0 };
  for (const piece of pieces) {
    for (const t of [0.25, 0.5, 0.75]) {
      const point = bezierOf({
        from,
        control1: piece.c1,
        control2: piece.c2,
        to: piece.to,
      }).compute(t);

      expect(Math.hypot(point.x, point.y)).toBeCloseTo(10, 2);
    }
    from = piece.to;
  }

  expect(contourEnd(contour).x).toBeCloseTo(-10, 10);
  expect(contourEnd(contour).y).toBeCloseTo(0, 10);
});

test('an arc from where the pen stands draws no line, and turns either way', () => {
  const clockwise = new Pen(10, 0).arc(0, 0, 10, 0, Math.PI / 2).open();

  expect(clockwise.segments).toHaveLength(1);

  const quarter = clockwise.segments.find(isCubic);
  const k = (4 / 3) * Math.tan(Math.PI / 8) * 10;

  expect(quarter?.c1.x).toBeCloseTo(10, 10);
  expect(quarter?.c1.y).toBeCloseTo(k, 10);
  expect(quarter?.c2.x).toBeCloseTo(k, 10);
  expect(quarter?.c2.y).toBeCloseTo(10, 10);

  const back = new Pen(10, 0).arc(0, 0, 10, 0, -Math.PI / 2).open();

  expect(back.segments).toHaveLength(1);
  expect(contourEnd(back).x).toBeCloseTo(0, 10);
  expect(contourEnd(back).y).toBeCloseTo(-10, 10);
});

test('a pen following an outline joins it with a line only when apart', () => {
  const side = new Pen(5, 0).line(5, 5).open();
  const joined = new Pen(0, 0).line(5, 0).follow(side).open();

  expect(joined.segments).toStrictEqual([
    { to: { x: 5, y: 0 } },
    { to: { x: 5, y: 5 } },
  ]);

  const apart = new Pen(0, 0).follow(side);

  expect(apart.at).toStrictEqual({ x: 5, y: 5 });
  expect(apart.open().segments).toStrictEqual([
    { to: { x: 5, y: 0 } },
    { to: { x: 5, y: 5 } },
  ]);
});

test('a closed outline is sampled without repeating its start', () => {
  const square = new Pen(0, 0)
    .line(10, 0)
    .line(10, 10)
    .line(0, 10)
    .line(0, 0)
    .close();

  expect(sampleContour(square)).toStrictEqual([
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ]);

  const triangle = new Pen(0, 0).line(4, 0).line(0, 3).close();

  expect(sampleContour(triangle)).toHaveLength(3);
  expect(sampleContour(new Pen(2, 2).close())).toStrictEqual([{ x: 2, y: 2 }]);
});

test('a curve is walked in even steps of its parameter', () => {
  const arch = new Pen(0, 0).curve(0, 10, 10, 10, 10, 0).open();

  expect(sampleContour(arch, 2)).toStrictEqual([
    { x: 0, y: 0 },
    { x: 5, y: 7.5 },
    { x: 10, y: 0 },
  ]);
  expect(sampleContour(arch)).toHaveLength(9);
});

test('an outline ends at its last piece, or where it starts with none', () => {
  expect(contourEnd(new Pen(3, 4).open())).toStrictEqual({ x: 3, y: 4 });
  expect(contourEnd(new Pen(0, 0).line(1, 2).line(3, 4).open())).toStrictEqual({
    x: 3,
    y: 4,
  });
});

test('the bounds of outlines take in every curve, and nothing has none', () => {
  const arch = new Pen(0, 0).curve(0, 10, 10, 10, 10, 0).open();
  const post: Contour = new Pen(-5, -2).line(-5, 1).open();

  expect(contourBounds([arch, post], 2)).toStrictEqual({
    x: -5,
    y: -2,
    width: 15,
    height: 9.5,
  });
  expect(contourBounds([])).toBeUndefined();
});
