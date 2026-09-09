import { expect, test } from 'vitest';

import { pointInPolygon, pointsInPolygon, polygonBounds } from '../polygon.ts';
import type { ScreenPoints } from '../screenPoints.ts';

const squareX = new Float64Array([0, 10, 10, 0]);
const squareY = new Float64Array([0, 0, 10, 10]);

const notchX = new Float64Array([0, 10, 10, 5, 0]);
const notchY = new Float64Array([0, 0, 10, 5, 10]);

const CIRCLE_VERTICES = 200;
const circleX = new Float64Array(CIRCLE_VERTICES);
const circleY = new Float64Array(CIRCLE_VERTICES);
for (let index = 0; index < CIRCLE_VERTICES; index++) {
  const angle = (index / CIRCLE_VERTICES) * Math.PI * 2;
  circleX[index] = 150 + 100 * Math.cos(angle);
  circleY[index] = 150 + 100 * Math.sin(angle);
}

const cloud: ScreenPoints = {
  x: new Float64Array([150, 150, 150, 0, 240, 300]),
  y: new Float64Array([150, 60, 20, 0, 150, 300]),
};

test('a point well inside the square is inside', () => {
  expect(pointInPolygon(5, 5, squareX, squareY)).toBe(true);
  expect(pointInPolygon(1, 1, squareX, squareY)).toBe(true);
  expect(pointInPolygon(9, 9, squareX, squareY)).toBe(true);
  expect(pointInPolygon(0.001, 9.999, squareX, squareY)).toBe(true);
});

test('a point well outside the square is outside', () => {
  expect(pointInPolygon(-1, 5, squareX, squareY)).toBe(false);
  expect(pointInPolygon(11, 5, squareX, squareY)).toBe(false);
  expect(pointInPolygon(5, -1, squareX, squareY)).toBe(false);
  expect(pointInPolygon(5, 11, squareX, squareY)).toBe(false);
  expect(pointInPolygon(20, 20, squareX, squareY)).toBe(false);
});

test('the low edges of the square are inside and the high ones are outside', () => {
  expect(pointInPolygon(5, 0, squareX, squareY)).toBe(true);
  expect(pointInPolygon(0, 5, squareX, squareY)).toBe(true);
  expect(pointInPolygon(10, 5, squareX, squareY)).toBe(false);
  expect(pointInPolygon(5, 10, squareX, squareY)).toBe(false);
});

test('of the square corners only the low one is inside', () => {
  expect(pointInPolygon(0, 0, squareX, squareY)).toBe(true);
  expect(pointInPolygon(10, 10, squareX, squareY)).toBe(false);
  expect(pointInPolygon(10, 0, squareX, squareY)).toBe(false);
  expect(pointInPolygon(0, 10, squareX, squareY)).toBe(false);
});

test('the notch of a concave polygon holds nothing', () => {
  expect(pointInPolygon(5, 7, notchX, notchY)).toBe(false);
  expect(pointInPolygon(5, 9, notchX, notchY)).toBe(false);
});

test('both legs beside the notch are inside', () => {
  expect(pointInPolygon(2, 7, notchX, notchY)).toBe(true);
  expect(pointInPolygon(8, 7, notchX, notchY)).toBe(true);
  expect(pointInPolygon(5, 2, notchX, notchY)).toBe(true);
  expect(pointInPolygon(5, 5, notchX, notchY)).toBe(true);
});

test('nothing thinner than a triangle holds anything', () => {
  const twoX = new Float64Array([0, 10]);
  const twoY = new Float64Array([0, 10]);

  expect(pointInPolygon(5, 5, twoX, twoY)).toBe(false);
  expect(pointInPolygon(0, 0, twoX, twoY)).toBe(false);
  expect(pointInPolygon(5, 5, squareX, squareY, 2)).toBe(false);
  expect(pointInPolygon(5, 5, squareX, squareY, 0)).toBe(false);
  expect(pointInPolygon(5, 5, new Float64Array(0), new Float64Array(0))).toBe(
    false,
  );
});

test('only the leading vertices of a buffer are the polygon', () => {
  expect(pointInPolygon(8, 2, squareX, squareY, 3)).toBe(true);
  expect(pointInPolygon(2, 8, squareX, squareY, 3)).toBe(false);
  expect(pointInPolygon(2, 8, squareX, squareY, 4)).toBe(true);
  expect(pointInPolygon(2, 8, squareX, squareY)).toBe(true);
  expect(pointInPolygon(2, 8, squareX, squareY, 99)).toBe(true);
  expect(pointInPolygon(2, 8, squareX, squareY, Number.NaN)).toBe(false);
});

test('a point that is not finite is outside', () => {
  expect(pointInPolygon(Number.NaN, 5, squareX, squareY)).toBe(false);
  expect(pointInPolygon(5, Number.POSITIVE_INFINITY, squareX, squareY)).toBe(
    false,
  );
});

test('a polygon is bounded by the rectangle its vertices span', () => {
  expect(polygonBounds(squareX, squareY)).toStrictEqual({
    minX: 0,
    minY: 0,
    maxX: 10,
    maxY: 10,
  });
  expect(polygonBounds(squareX, squareY, 2)).toStrictEqual({
    minX: 0,
    minY: 0,
    maxX: 10,
    maxY: 0,
  });
});

test('a polygon with no finite vertex has no bounds', () => {
  expect(polygonBounds(new Float64Array(0), new Float64Array(0))).toBeNull();
  expect(
    polygonBounds(
      new Float64Array([Number.NaN, 1]),
      new Float64Array([2, Number.NaN]),
    ),
  ).toBeNull();
});

test('a vertex that is not finite is left out of the bounds', () => {
  const raggedX = new Float64Array([0, Number.NaN, 4]);
  const raggedY = new Float64Array([1, 9, 7]);

  expect(polygonBounds(raggedX, raggedY)).toStrictEqual({
    minX: 0,
    minY: 1,
    maxX: 4,
    maxY: 7,
  });
});

test('a cloud is split by a two-hundred-vertex loop', () => {
  expect(pointsInPolygon(cloud, circleX, circleY)).toStrictEqual(
    new Uint8Array([1, 1, 0, 0, 1, 0]),
  );
});

test('a mask of the right length is written into rather than replaced', () => {
  const into = new Uint8Array([1, 1, 1, 1, 1, 1]);
  const mask = pointsInPolygon(cloud, circleX, circleY, undefined, into);

  expect(mask).toBe(into);
  expect(mask).toStrictEqual(new Uint8Array([1, 1, 0, 0, 1, 0]));
});

test('a mask of the wrong length is replaced rather than written into', () => {
  const wrong = new Uint8Array(3);
  const mask = pointsInPolygon(cloud, circleX, circleY, undefined, wrong);

  expect(mask).not.toBe(wrong);
  expect(wrong).toStrictEqual(new Uint8Array([0, 0, 0]));
  expect(mask).toStrictEqual(new Uint8Array([1, 1, 0, 0, 1, 0]));
});

test('a polygon too thin to hold anything selects nothing', () => {
  const into = new Uint8Array([1, 1, 1, 1, 1, 1]);
  const mask = pointsInPolygon(cloud, circleX, circleY, 2, into);

  expect(mask).toBe(into);
  expect(mask).toStrictEqual(new Uint8Array([0, 0, 0, 0, 0, 0]));
});

test('the square selects the points its edges claim', () => {
  const onEdges: ScreenPoints = {
    x: new Float64Array([5, 0, 10, 5, 0, 10]),
    y: new Float64Array([0, 5, 5, 10, 0, 10]),
  };

  expect(pointsInPolygon(onEdges, squareX, squareY)).toStrictEqual(
    new Uint8Array([1, 1, 0, 0, 1, 0]),
  );
});
