import { expect, test } from 'vitest';

import type { Vector3 } from '../../core/orbitCamera.ts';
import { cloudShells } from '../scatterCloudModel.ts';

/** Two tetrahedra of four samples each, and three samples far from both. */
const CUBE: Vector3[] = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [2, 2, 2],
  [3, 2, 2],
  [2, 3, 2],
  [2, 2, 3],
  [9, 9, 9],
  [9, 9, 9],
  [9, 9, 9],
];

const GROUPS = [
  { id: 'a', label: 'A', color: 'var(--text)' },
  { id: 'b', label: 'B', color: 'var(--text-muted)' },
];

const INK = {
  colors: ['var(--accent)', 'var(--text-faint)'],
  opacities: [1, 0.2],
};

const SIZE = { kind: 'standardDeviations', standardDeviations: 1 } as const;

test('a row with no usable group is left out, and a fractional group is read by its whole part', () => {
  const shells = cloudShells({
    cube: CUBE,
    groupOf: [0, 0, 0, 0.6, 1, 1, 1, 1.2, Number.NaN, -1, 7],
    groups: GROUPS,
    ink: INK,
    size: SIZE,
  });

  expect(
    shells.map((shell) => [
      shell.id,
      shell.color,
      shell.opacity,
      shell.ellipsoid.count,
    ]),
  ).toStrictEqual([
    ['a', 'var(--accent)', 1, 4],
    ['b', 'var(--text-faint)', 0.2, 4],
  ]);
  expect(shells.map((shell) => shell.ellipsoid.center)).toStrictEqual([
    [0.25, 0.25, 0.25],
    [2.25, 2.25, 2.25],
  ]);
});

test('a group left with too few samples once its padded rows are dropped gets no shell', () => {
  const shells = cloudShells({
    cube: CUBE,
    groupOf: Float64Array.from([
      0,
      0,
      0,
      Number.NaN,
      1,
      1,
      1,
      1,
      Number.NaN,
      Number.NaN,
      Number.NaN,
    ]),
    groups: GROUPS,
    ink: INK,
    size: SIZE,
  });

  expect(shells.map((shell) => shell.id)).toStrictEqual(['b']);
});
