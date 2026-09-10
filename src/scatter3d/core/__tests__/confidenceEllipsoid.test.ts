import { expect, test } from 'vitest';

import {
  confidenceEllipsoid,
  ellipsoidStandardDeviations,
} from '../confidenceEllipsoid.ts';
import type { Vector3 } from '../orbitCamera.ts';

const ONE_SD = { kind: 'standardDeviations', standardDeviations: 1 } as const;

function axisLengths(axes: readonly Vector3[]): number[] {
  return axes.map((axis) => Math.hypot(axis[0], axis[1], axis[2]));
}

/** A box of eight corners: spread 1 in x, 2 in y, 3 in z, centred on the origin. */
const BOX: Vector3[] = [
  [-1, -2, -3],
  [-1, -2, 3],
  [-1, 2, -3],
  [-1, 2, 3],
  [1, -2, -3],
  [1, -2, 3],
  [1, 2, -3],
  [1, 2, 3],
];

test('the shell is centred on the average of the group', () => {
  const shell = confidenceEllipsoid(
    BOX.map(([x, y, z]) => [x + 10, y - 4, z + 0.5] as Vector3),
    { size: ONE_SD },
  );

  expect(shell?.center[0]).toBeCloseTo(10, 12);
  expect(shell?.center[1]).toBeCloseTo(-4, 12);
  expect(shell?.center[2]).toBeCloseTo(0.5, 12);
});

test('its axes are the spread of the group, longest first', () => {
  const shell = confidenceEllipsoid(BOX, { size: ONE_SD });
  // Each coordinate takes two values, so its variance is n/(n-1) times the
  // square of the half-width: 8/7 of 9, 4 and 1.
  const expected = [3, 2, 1].map((half) => half * Math.sqrt(8 / 7));
  const lengths = axisLengths(shell?.axes ?? []);

  expect(lengths[0]).toBeCloseTo(expected[0] as number, 10);
  expect(lengths[1]).toBeCloseTo(expected[1] as number, 10);
  expect(lengths[2]).toBeCloseTo(expected[2] as number, 10);
});

test('it counts the points it actually used', () => {
  expect(confidenceEllipsoid(BOX, { size: ONE_SD })?.count).toBe(8);
});

test('a wider share draws a wider shell, in the same proportions', () => {
  const near = confidenceEllipsoid(BOX, {
    size: { kind: 'coverage', probability: 0.5 },
  });
  const far = confidenceEllipsoid(BOX, {
    size: { kind: 'coverage', probability: 0.95 },
  });
  const [nearLongest] = axisLengths(near?.axes ?? []);
  const [farLongest] = axisLengths(far?.axes ?? []);

  expect(farLongest as number).toBeGreaterThan(nearLongest as number);
  expect((farLongest as number) / (nearLongest as number)).toBeCloseTo(
    ellipsoidStandardDeviations({ kind: 'coverage', probability: 0.95 }) /
      ellipsoidStandardDeviations({ kind: 'coverage', probability: 0.5 }),
    10,
  );
});

test('a group of three has no volume, so it is given no shell', () => {
  expect(
    confidenceEllipsoid(
      [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
      ],
      { size: ONE_SD },
    ),
  ).toBeNull();
});

test('fewer than four is read as four, whatever the caller asks for', () => {
  const three: Vector3[] = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
  ];

  expect(
    confidenceEllipsoid(three, { size: ONE_SD, minimumPoints: 1 }),
  ).toBeNull();
});

test('a flat group keeps its shell, with no thickness in the third direction', () => {
  const flat: Vector3[] = [
    [-1, -1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [1, 1, 0],
    [0, 0, 0],
  ];
  const lengths = axisLengths(
    confidenceEllipsoid(flat, { size: ONE_SD })?.axes ?? [],
  );

  expect(lengths[2]).toBeCloseTo(0, 10);
  expect(lengths[0]).toBeGreaterThan(0);
});

test('points that are not finite are skipped rather than poisoning the average', () => {
  const withGaps: Vector3[] = [
    ...BOX,
    [Number.NaN, 0, 0],
    [0, Number.POSITIVE_INFINITY, 0],
  ];
  const shell = confidenceEllipsoid(withGaps, { size: ONE_SD });

  expect(shell?.count).toBe(8);
  expect(shell?.center[0]).toBeCloseTo(0, 12);
});

test('an unbounded size draws nothing rather than an infinite shell', () => {
  expect(
    confidenceEllipsoid(BOX, { size: { kind: 'coverage', probability: 1 } }),
  ).toBeNull();
});

test('a size in standard deviations is taken as written', () => {
  expect(ellipsoidStandardDeviations(ONE_SD)).toBe(1);
  expect(
    ellipsoidStandardDeviations({
      kind: 'standardDeviations',
      standardDeviations: 2.5,
    }),
  ).toBe(2.5);
});
