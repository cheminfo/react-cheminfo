import { expect, test } from 'vitest';

import type { ScreenPoints } from '../screenPoints.ts';
import { nearestPointIndex } from '../screenPoints.ts';

const points: ScreenPoints = {
  x: new Float64Array([0, 10, 20]),
  y: new Float64Array([0, 0, 0]),
};

test('the nearest of three points inside the radius wins', () => {
  expect(nearestPointIndex(points, 11, 0, 12)).toBe(1);
  expect(nearestPointIndex(points, 1, 0, 12)).toBe(0);
  expect(nearestPointIndex(points, 19, 0, 12)).toBe(2);
});

test('a position with every point outside the radius finds nothing', () => {
  expect(nearestPointIndex(points, 100, 100, 5)).toBe(-1);
  expect(nearestPointIndex(points, 5, 0, 4)).toBe(-1);
});

test('a point excluded by the mask is skipped and the second nearest wins', () => {
  const included = new Uint8Array([1, 0, 1]);

  expect(nearestPointIndex(points, 11, 0, 12, included)).toBe(2);
  expect(nearestPointIndex(points, 11, 0, 12, new Uint8Array([1, 1, 1]))).toBe(
    1,
  );
  expect(nearestPointIndex(points, 11, 0, 12, new Uint8Array([0, 0, 0]))).toBe(
    -1,
  );
});

test('a point exactly at the radius still counts', () => {
  expect(nearestPointIndex(points, 5, 0, 5)).toBe(0);
  expect(nearestPointIndex(points, 5, 0, 4.999)).toBe(-1);
});

test('a tie goes to the lower index', () => {
  const tied: ScreenPoints = {
    x: new Float64Array([4, 6, 4]),
    y: new Float64Array([0, 0, 0]),
  };

  expect(nearestPointIndex(tied, 5, 0, 10)).toBe(0);
});

test('a mask shorter than the cloud hides the points past its end', () => {
  expect(nearestPointIndex(points, 19, 0, 12, new Uint8Array([1, 1]))).toBe(1);
});

test('a position or radius that is not finite finds nothing', () => {
  expect(nearestPointIndex(points, Number.NaN, 0, 12)).toBe(-1);
  expect(nearestPointIndex(points, 0, Number.NaN, 12)).toBe(-1);
  expect(nearestPointIndex(points, 0, 0, Number.POSITIVE_INFINITY)).toBe(-1);
});

test('an empty cloud finds nothing', () => {
  const empty: ScreenPoints = {
    x: new Float64Array(0),
    y: new Float64Array(0),
  };

  expect(nearestPointIndex(empty, 0, 0, 10)).toBe(-1);
});
