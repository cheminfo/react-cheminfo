import { expect, test } from 'vitest';

import type { CurveShape } from '../curveShape.ts';
import { bezierOf, curvePieces } from '../curves.ts';
import { roundCoordinate } from '../geometry.ts';
import type { CurveHandle } from '../shapeHandles.ts';
import {
  dragShapeHandle,
  resetShapeVertex,
  shapeHandleAt,
  shapeHandles,
  shapeLineAt,
} from '../shapeHandles.ts';
import type { Point } from '../types.ts';

const ARC: CurveShape = {
  points: [
    { x: 0, y: 0 },
    { x: 10, y: -10 },
    { x: 20, y: 0 },
  ],
  controls: [null, null, null],
  closed: false,
};
const FREE = { snap: false, corner: false };

// The curve once a handle is dragged, rounded as a drawing keeps it.
function dragged(
  handle: CurveHandle,
  pointer: Point,
  options = FREE,
  shape = ARC,
): CurveShape {
  return rounded(dragShapeHandle(shape, handle, pointer, options));
}

test('an open curve has a control point on each side of its inner points, one at each end', () => {
  const handles = shapeHandles(ARC).map(({ handle }) => handle);

  expect(handles).toStrictEqual([
    { vertex: 0, part: 'after' },
    { vertex: 1, part: 'before' },
    { vertex: 1, part: 'after' },
    { vertex: 2, part: 'before' },
    { vertex: 0, part: 'point' },
    { vertex: 1, part: 'point' },
    { vertex: 2, part: 'point' },
  ]);
  expect(shapeHandleAt(ARC, { x: 14.5, y: -10.3 }, 1)).toStrictEqual({
    vertex: 1,
    part: 'after',
  });
  expect(shapeHandleAt(ARC, { x: 10.5, y: -9.5 }, 1)).toStrictEqual({
    vertex: 1,
    part: 'point',
  });
  // Seven pixels reach seven points at full size, half as far zoomed in.
  expect(shapeHandleAt(ARC, { x: 10, y: -4 }, 1)).toStrictEqual({
    vertex: 1,
    part: 'point',
  });
  expect(shapeHandleAt(ARC, { x: 10, y: -4 }, 0.5)).toBeUndefined();
});

test('a drag pulls a point out of the line within five pixels of it', () => {
  const piece = bezierOf(
    curvePieces(ARC.points, false, ARC.controls)[0] as never,
  );
  const on = piece.get(0.5);
  const normal = piece.normal(0.5);
  const off = { x: on.x + 3 * normal.x, y: on.y + 3 * normal.y };
  const spot = shapeLineAt(ARC, off, 1);

  expect(spot?.piece).toBe(0);
  expect(spot?.t).toBeCloseTo(0.5, 1);
  // Three points off is six pixels zoomed in twice: out of reach.
  expect(shapeLineAt(ARC, off, 0.5)).toBeUndefined();
});

test('a control point dragged turns the tangent, the opposite one kept in line at its length', () => {
  expect(
    dragged({ vertex: 1, part: 'after' }, { x: 14, y: -14 }),
  ).toStrictEqual({
    ...ARC,
    controls: [
      null,
      { before: { x: 6.67, y: -6.67 }, after: { x: 14, y: -14 } },
      null,
    ],
  });
});

test('with Alt the control point moves alone, and with shift it turns by 15°', () => {
  expect(
    dragged(
      { vertex: 1, part: 'after' },
      { x: 14, y: -14 },
      { snap: false, corner: true },
    ),
  ).toMatchObject({
    controls: [
      null,
      { before: { x: 5.29, y: -10 }, after: { x: 14, y: -14 } },
      null,
    ],
  });
  expect(
    dragged(
      { vertex: 1, part: 'before' },
      { x: 6, y: -13.5 },
      { snap: true, corner: false },
    ),
  ).toMatchObject({
    controls: [
      null,
      { before: { x: 6.24, y: -13.76 }, after: { x: 13.33, y: -6.67 } },
      null,
    ],
  });
});

test('a point dragged carries its control points, and a reset gives the curve its own tangent back', () => {
  const curve = dragged({ vertex: 1, part: 'after' }, { x: 14, y: -14 });
  const moved = dragged(
    { vertex: 1, part: 'point' },
    { x: 10, y: -15 },
    FREE,
    curve,
  );

  expect(moved).toStrictEqual({
    ...ARC,
    points: [
      { x: 0, y: 0 },
      { x: 10, y: -15 },
      { x: 20, y: 0 },
    ],
    controls: [
      null,
      { before: { x: 6.67, y: -11.67 }, after: { x: 14, y: -19 } },
      null,
    ],
  });
  // With no hand-set point left, the curve is the one it was.
  expect(resetShapeVertex(curve, 1)).toStrictEqual(ARC);
});

function rounded(shape: CurveShape): CurveShape {
  return {
    points: shape.points.map(round),
    controls: shape.controls.map(
      (control) =>
        control && {
          before: round(control.before),
          after: round(control.after),
        },
    ),
    closed: shape.closed,
  };
}

function round(point: Point): Point {
  return { x: roundCoordinate(point.x), y: roundCoordinate(point.y) };
}
