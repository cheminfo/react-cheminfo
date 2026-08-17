import { expect, test } from 'vitest';

import { evaluateGrid, gridIndex } from '../grid.ts';

/**
 * Encodes the sampled position, so a value pins the index arithmetic.
 * @param x - Sampled x, ångström.
 * @param y - Sampled y, ångström.
 * @param z - Sampled z, ångström.
 * @returns A value encoding the sampled position.
 */
function encodePosition(x: number, y: number, z: number) {
  return 100 * x + 10 * y + z;
}

test('z varies fastest, as molstar Tensor.Space expects', () => {
  const grid = evaluateGrid(
    encodePosition,
    { origin: { x: 0, y: 0, z: 0 }, size: { x: 2, y: 2, z: 2 } },
    3,
  );

  expect(grid.dimensions).toStrictEqual([3, 3, 3]);
  expect(grid.spacing).toBe(1);
  expect(grid.data).toHaveLength(27);

  expect(grid.data[0]).toBe(0);
  // One step in z is one step in the flat array.
  expect(grid.data[1]).toBe(1);
  // One step in y is nz steps.
  expect(grid.data[3]).toBe(10);
  // One step in x is ny·nz steps.
  expect(grid.data[9]).toBe(100);

  expect(gridIndex(grid.dimensions, 2, 0, 1)).toBe(19);
  expect(grid.data[19]).toBe(201);
  expect(gridIndex(grid.dimensions, 1, 2, 2)).toBe(17);
  expect(grid.data[17]).toBe(122);
  expect(grid.data[26]).toBe(222);
});

test('the statistics come from the same pass as the samples', () => {
  const grid = evaluateGrid(
    encodePosition,
    { origin: { x: 0, y: 0, z: 0 }, size: { x: 2, y: 2, z: 2 } },
    3,
  );

  expect(grid.min).toBe(0);
  expect(grid.max).toBe(222);
  expect(grid.mean).toBeCloseTo(111, 12);
  // Three independent coordinates on {0,1,2}: variance 2/3 each, weighted
  // 100², 10² and 1².
  expect(grid.sigma).toBeCloseTo(Math.sqrt((10101 * 2) / 3), 9);
});

test('the box is covered with cubic voxels on every axis', () => {
  const grid = evaluateGrid(
    encodePosition,
    { origin: { x: -1, y: 0, z: 2 }, size: { x: 2, y: 4, z: 6 } },
    7,
  );

  expect(grid.dimensions).toStrictEqual([3, 5, 7]);
  expect(grid.spacing).toBe(1);
  expect(grid.data).toHaveLength(105);
  expect(grid.origin).toStrictEqual({ x: -1, y: 0, z: 2 });
  expect(grid.data[0]).toBe(encodePosition(-1, 0, 2));
  expect(grid.data[gridIndex(grid.dimensions, 2, 4, 6)]).toBe(
    encodePosition(1, 4, 8),
  );
});

test('a degenerate request is rejected', () => {
  const box = { origin: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };

  expect(() => evaluateGrid(encodePosition, box, 1)).toThrow(
    'a grid needs at least 2 samples per axis',
  );
  expect(() =>
    evaluateGrid(
      encodePosition,
      { origin: box.origin, size: { x: 0, y: 0, z: 0 } },
      8,
    ),
  ).toThrow('the sampling box must have a non-zero edge');
});
