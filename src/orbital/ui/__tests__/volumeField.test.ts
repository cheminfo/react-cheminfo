/**
 * A sampled field wrapped as molstar's `Volume`: where each sample lands in
 * the scene, how the samples are read back, and the statistics the volume
 * themes are given.
 */

import { Mat4, Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import { assert, expect, test } from 'vitest';

import type { OrbitalGrid } from '../../core/grid.ts';
import { toVolume } from '../volumeField.ts';

/** 2 × 3 × 4 samples, each holding its own index. */
const FIELD: OrbitalGrid = {
  data: Float32Array.from({ length: 24 }, (_, index) => index),
  dimensions: [2, 3, 4],
  origin: { x: -1, y: -2, z: -3 },
  spacing: 0.25,
  min: 0,
  max: 23,
  mean: 4,
  sigma: 3,
};

test('a sample lands at the origin plus its index times the spacing, all scaled for display', () => {
  const { transform } = toVolume(FIELD, 2).grid;
  assert(transform.kind === 'matrix', 'expected a matrix');
  const { matrix } = transform;
  const at = (x: number, y: number, z: number) =>
    Array.from(Vec3.transformMat4(Vec3.zero(), Vec3.create(x, y, z), matrix));

  expect(at(0, 0, 0)).toStrictEqual([-2, -4, -6]);
  expect(at(1, 2, 3)).toStrictEqual([-1.5, -3, -4.5]);
});

test('the samples are read back with z varying fastest', () => {
  const { grid } = toVolume(FIELD, 1);
  const { space, data } = grid.cells;

  expect(space.dimensions).toStrictEqual([2, 3, 4]);
  expect(space.get(data, 0, 0, 1)).toBe(1);
  expect(space.get(data, 0, 1, 0)).toBe(4);
  expect(space.get(data, 1, 2, 3)).toBe(23);
});

test('the volume carries the field’s statistics, sigma as molstar reads it', () => {
  expect(toVolume(FIELD, 1).grid.stats).toStrictEqual({
    min: 0,
    max: 23,
    mean: 4,
    sigma: 5,
  });
});

test('the volume is drawn once, where it stands, and says what it holds', () => {
  const volume = toVolume(FIELD, 1);

  expect(volume.instances).toHaveLength(1);
  expect(
    Mat4.areEqual(
      volume.instances[0]?.transform ?? Mat4.zero(),
      Mat4.identity(),
      0,
    ),
  ).toBe(true);
  expect(volume.sourceData).toStrictEqual({
    name: 'react-cheminfo sampled orbital',
    kind: 'atomic-orbital-field',
    data: FIELD.data,
  });
});
