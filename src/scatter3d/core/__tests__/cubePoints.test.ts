import { expect, test } from 'vitest';

import { cubePoints } from '../cubePoints.ts';

const ACROSS = [-10, 0, 10];
const UP = [0, 1, 2];
const AWAY = [100, 150, 200];

test('every axis is stretched to the same cube, whatever its own units were', () => {
  expect(cubePoints(ACROSS, UP, AWAY, { padding: 0 })).toStrictEqual([
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1],
  ]);
});

test('the padding leaves the cloud short of the frame at both ends', () => {
  const points = cubePoints(ACROSS, UP, AWAY, { padding: 0.05 });

  expect(points[0]?.[0]).toBeCloseTo(-0.909_09, 5);
  expect(points[2]?.[0]).toBeCloseTo(0.909_09, 5);
});

test('it pads by a twentieth unless told otherwise', () => {
  expect(cubePoints(ACROSS, UP, AWAY)).toStrictEqual(
    cubePoints(ACROSS, UP, AWAY, { padding: 0.05 }),
  );
});

test('the three runs are read in the order they were named', () => {
  expect(cubePoints(AWAY, ACROSS, UP, { padding: 0 })).toStrictEqual([
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1],
  ]);
});

test('one run may be drawn on two axes, giving a diagonal', () => {
  const points = cubePoints(ACROSS, ACROSS, UP, { padding: 0 });

  expect(points[0]).toStrictEqual([-1, -1, -1]);
  expect(points[1]).toStrictEqual([0, 0, 0]);
});

test('an axis with no spread puts every sample in the middle of it', () => {
  const points = cubePoints(ACROSS, [5, 5, 5], AWAY, { padding: 0 });

  expect(points.map((point) => point[1])).toStrictEqual([0, 0, 0]);
});

test('a value that is not finite stays that way, so nothing draws it', () => {
  const points = cubePoints([0, 1, Number.NaN], UP, AWAY, { padding: 0 });

  expect(Number.isNaN(points[2]?.[0] as number)).toBe(true);
});

test('it gives as many points as the shortest run holds', () => {
  expect(cubePoints(ACROSS, [0, 1], AWAY)).toHaveLength(2);
});

test('no samples at all gives no points', () => {
  expect(cubePoints([], [], [])).toStrictEqual([]);
});
