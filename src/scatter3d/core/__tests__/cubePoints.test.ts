import { expect, test } from 'vitest';

import {
  chartPadExtent,
  chartValuesExtent,
} from '../../../chart/core/chartExtent.ts';
import { cubePoints } from '../cubePoints.ts';

test('every coordinate is the padded closed form 2(v − min)/span − 1 to within rounding', () => {
  const runs = [
    { base: -3, span: 6 },
    { base: 1600, span: 200 },
    { base: 0, span: 0.02 },
  ].map(({ base, span }) => {
    const values = new Float64Array(5000);
    for (let index = 0; index < values.length; index++) {
      values[index] = base + ((index * 0.618_033_988_75) % 1) * span;
    }
    return values;
  });
  const [across, up, away] = runs as [Float64Array, Float64Array, Float64Array];
  const points = cubePoints(across, up, away);

  const mismatches: string[] = [];
  for (let axis = 0; axis < 3; axis++) {
    const values = runs[axis] as Float64Array;
    const { min, max } = chartPadExtent(chartValuesExtent(values), 0.05);
    for (let index = 0; index < values.length; index++) {
      const expected =
        (2 * ((values[index] as number) - min)) / (max - min) - 1;
      const actual = points[index]?.[axis] as number;
      if (!(Math.abs(actual - expected) <= 1e-14)) {
        mismatches.push(`axis ${axis} row ${index}: ${actual} vs ${expected}`);
      }
    }
  }

  expect(points).toHaveLength(5000);
  expect(mismatches).toStrictEqual([]);
});

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
