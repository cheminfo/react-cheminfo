import { expect, test } from 'vitest';

import type { CurveShape, CurveSpot } from '../curveShape.ts';
import { curveSpotAt, withPointAt, withoutPoint } from '../curveShape.ts';
import { bezierOf, curvePieces } from '../curves.ts';
import type { Point } from '../types.ts';

const WAVE: CurveShape = {
  points: [
    { x: 0, y: 0 },
    { x: 30, y: -20 },
    { x: 60, y: 10 },
    { x: 90, y: 0 },
  ],
  controls: [null, null, null, null],
  closed: false,
};

test('a point added on the line leaves the curve exactly as it was', () => {
  const spot = { piece: 1, t: 0.3 };
  const added = withPointAt(WAVE, spot);
  const before = bezierOf(
    curvePieces(WAVE.points, false, WAVE.controls)[1] as never,
  ).get(0.3);

  expect(added.points).toHaveLength(5);
  expect(added.points[2]?.x).toBeCloseTo(before.x, 9);
  expect(added.points[2]?.y).toBeCloseTo(before.y, 9);
  expect(outlineGap(WAVE, added, spot)).toBeLessThan(1e-9);
});

test('a point added on the last side of a closed curve keeps its shape too', () => {
  const triangle: CurveShape = {
    points: [
      { x: 0, y: 0 },
      { x: 40, y: 0 },
      { x: 20, y: 30 },
    ],
    controls: [null, null, null],
    closed: true,
  };
  const spot = { piece: 2, t: 0.5 };
  const added = withPointAt(triangle, spot);

  expect(added.points).toHaveLength(4);
  expect(outlineGap(triangle, added, spot)).toBeLessThan(1e-9);
});

test('a point taken out joins its two pieces, and an open curve keeps two points', () => {
  const removed = withoutPoint(WAVE, 1);

  expect(removed?.points).toStrictEqual([
    { x: 0, y: 0 },
    { x: 60, y: 10 },
    { x: 90, y: 0 },
  ]);

  const line: CurveShape = { ...WAVE, points: WAVE.points.slice(0, 2) };

  expect(withoutPoint(line, 0)).toBeUndefined();
});

test('the place on the line is found within reach, and nothing further off', () => {
  const on = bezierOf(
    curvePieces(WAVE.points, false, WAVE.controls)[2] as never,
  ).get(0.5);

  expect(curveSpotAt(WAVE, on, 1)).toMatchObject({
    piece: 2,
    t: expect.closeTo(0.5, 3),
  });
  expect(curveSpotAt(WAVE, { x: 45, y: 60 }, 3)).toBeUndefined();
});

test('a curve takes and loses points, and gives back the curve it was', () => {
  const curve: CurveShape = {
    points: [
      { x: 0, y: 0 },
      { x: 40, y: -30 },
      { x: 80, y: 0 },
    ],
    controls: [null, null, null],
    closed: false,
  };
  const added = withPointAt(curve, { piece: 1, t: 0.5 });

  expect(added.points).toHaveLength(4);
  expect(added.controls[2]).not.toBeNull();
  expect(withoutPoint(added, 2)?.points).toStrictEqual(curve.points);
  expect(
    withoutPoint({ ...curve, points: curve.points.slice(0, 2) }, 0),
  ).toBeUndefined();
});

/**
 * How far a curve with a point added at a place strays from the curve it was:
 * every other piece compared point for point, and the two halves of the split
 * one against the piece they came from, parameter for parameter.
 * @param was - The curve before.
 * @param now - The curve with the point added.
 * @param spot - Where the point was added.
 * @returns The largest distance found.
 */
function outlineGap(was: CurveShape, now: CurveShape, spot: CurveSpot): number {
  const old = curvePieces(was.points, was.closed, was.controls).map((piece) =>
    bezierOf(piece),
  );
  const fresh = curvePieces(now.points, now.closed, now.controls).map((piece) =>
    bezierOf(piece),
  );
  let worst = 0;
  for (const [index, piece] of old.entries()) {
    for (let step = 0; step <= 10; step++) {
      const u = step / 10;
      if (index === spot.piece) {
        const left = fresh[index]?.get(u) as Point;
        const right = fresh[index + 1]?.get(u) as Point;
        worst = Math.max(worst, gap(left, piece.get(u * spot.t)));
        worst = Math.max(
          worst,
          gap(right, piece.get(spot.t + u * (1 - spot.t))),
        );
      } else {
        const moved = fresh[index > spot.piece ? index + 1 : index];
        worst = Math.max(worst, gap(moved?.get(u) as Point, piece.get(u)));
      }
    }
  }
  return worst;
}

function gap(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
