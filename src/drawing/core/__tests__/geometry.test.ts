/**
 * The plane a drawing is laid out on: distances and angles with y pointing
 * down, boxes and polygons, and coordinates kept to what a file stores.
 */

import { expect, test } from 'vitest';

import {
  angleTo,
  boundsOf,
  boxContains,
  boxCorners,
  boxFromCorners,
  clampToBox,
  distance,
  distanceToSegment,
  normalizeAngle,
  polar,
  polygonContains,
  roundCoordinate,
  signedArea,
  snapAngle,
} from '../geometry.ts';
import type { Point } from '../types.ts';

const BOX = { x: 0, y: 0, width: 10, height: 5 };

test('a distance is Euclidean, and an angle turns clockwise on screen', () => {
  expect(distance({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(5);
  expect(angleTo({ x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2, 12);
  expect(angleTo({ x: 0, y: 0 }, { x: -1, y: 0 })).toBeCloseTo(Math.PI, 12);

  const reached = polar({ x: 1, y: 1 }, Math.PI / 2, 2);

  expect(reached.x).toBeCloseTo(1, 12);
  expect(reached.y).toBeCloseTo(3, 12);
});

test('an angle is brought into one turn, and snapped to its nearest step', () => {
  expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 12);
  expect(normalizeAngle(5 * Math.PI)).toBeCloseTo(Math.PI, 12);
  expect(normalizeAngle(2 * Math.PI)).toBe(0);
  expect(normalizeAngle(1)).toBe(1);
  expect(snapAngle(0.4, Math.PI / 6)).toBeCloseTo(Math.PI / 6, 12);
  expect(snapAngle(1.2, Math.PI / 6)).toBeCloseTo(Math.PI / 3, 12);
});

test('the bounds of points are grown by the margin; none gives an empty box', () => {
  expect(boundsOf([])).toStrictEqual({ x: 0, y: 0, width: 0, height: 0 });
  expect(
    boundsOf(
      [
        { x: 3, y: -1 },
        { x: -2, y: 4 },
        { x: 1, y: 2 },
      ],
      1,
    ),
  ).toStrictEqual({ x: -3, y: -2, width: 7, height: 7 });
});

test('a box holds its edges, and a point is brought onto its nearest edge', () => {
  expect(boxContains(BOX, { x: 10, y: 5 })).toBe(true);
  expect(boxContains(BOX, { x: 0, y: 0 })).toBe(true);
  expect(boxContains(BOX, { x: 10.01, y: 2 })).toBe(false);
  expect(boxContains(BOX, { x: 5, y: -0.01 })).toBe(false);
  expect(clampToBox(BOX, { x: 3, y: 2 })).toStrictEqual({ x: 3, y: 2 });
  expect(clampToBox(BOX, { x: -4, y: 9 })).toStrictEqual({ x: 0, y: 5 });
  expect(clampToBox(BOX, { x: 12, y: -3 })).toStrictEqual({ x: 10, y: 0 });
});

test('a box is spanned by two corners in either order, and has four', () => {
  expect(boxFromCorners({ x: 10, y: 5 }, { x: 0, y: 0 })).toStrictEqual(BOX);
  expect(boxFromCorners({ x: 0, y: 5 }, { x: 10, y: 0 })).toStrictEqual(BOX);
  expect(boxCorners(BOX)).toStrictEqual([
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 5 },
    { x: 0, y: 5 },
  ]);
});

test('a polygon holds a point by the even–odd rule', () => {
  const square = boxCorners(BOX);

  expect(polygonContains(square, { x: 5, y: 2 })).toBe(true);
  expect(polygonContains(square, { x: 11, y: 2 })).toBe(false);
  expect(polygonContains([], { x: 0, y: 0 })).toBe(false);

  // A pentagram: its tips are wound once, its centre twice.
  const star: Point[] = [];
  for (let index = 0; index < 5; index++) {
    const angle = -Math.PI / 2 + (index * 4 * Math.PI) / 5;
    star.push({ x: 10 * Math.cos(angle), y: 10 * Math.sin(angle) });
  }

  expect(polygonContains(star, { x: 0, y: -8 })).toBe(true);
  expect(polygonContains(star, { x: 0, y: 0 })).toBe(false);
});

test('the area of a polygon is positive when it runs clockwise on the page', () => {
  const square = boxCorners({ x: 0, y: 0, width: 10, height: 10 });

  expect(signedArea(square)).toBe(100);
  expect(signedArea(square.toReversed())).toBe(-100);
  expect(signedArea([])).toBe(0);
});

test('the distance to a segment is to its nearest point, its ends included', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 10, y: 0 };

  expect(distanceToSegment({ x: 5, y: 5 }, a, b)).toBe(5);
  expect(distanceToSegment({ x: 13, y: 4 }, a, b)).toBe(5);
  expect(distanceToSegment({ x: -3, y: -4 }, a, b)).toBe(5);
  expect(distanceToSegment({ x: 3, y: 4 }, a, a)).toBe(5);
});

test('a coordinate is kept to a hundredth of a point, never as -0', () => {
  expect(roundCoordinate(1.234)).toBe(1.23);
  expect(roundCoordinate(-7.126)).toBe(-7.13);
  expect(Object.is(roundCoordinate(-0.001), 0)).toBe(true);
});
