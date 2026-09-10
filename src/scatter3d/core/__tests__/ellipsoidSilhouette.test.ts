import { expect, test } from 'vitest';

import type { ConfidenceEllipsoid } from '../confidenceEllipsoid.ts';
import { ellipsoidSilhouette } from '../ellipsoidSilhouette.ts';
import type { OrbitCamera } from '../orbitCamera.ts';

const SQUARE_ON: OrbitCamera = { yaw: 0, pitch: 0 };

const UNIT_SPHERE: ConfidenceEllipsoid = {
  center: [0, 0, 0],
  axes: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  count: 10,
};

test('a sphere is a circle of its own radius, from anywhere', () => {
  for (const camera of [
    SQUARE_ON,
    { yaw: 0.6, pitch: 0.5 },
    { yaw: 2, pitch: -1.2 },
  ]) {
    const outline = ellipsoidSilhouette(UNIT_SPHERE, camera);

    expect(outline.rx).toBeCloseTo(1, 12);
    expect(outline.ry).toBeCloseTo(1, 12);
  }
});

test('the radii scale with the shell', () => {
  const outline = ellipsoidSilhouette(
    {
      ...UNIT_SPHERE,
      axes: [
        [3, 0, 0],
        [0, 2, 0],
        [0, 0, 2],
      ],
    },
    SQUARE_ON,
  );

  expect(outline.rx).toBeCloseTo(3, 12);
  expect(outline.ry).toBeCloseTo(2, 12);
  expect(outline.angle).toBeCloseTo(0, 12);
});

test('an axis pointing at the reader leaves the two it hides', () => {
  const outline = ellipsoidSilhouette(
    {
      ...UNIT_SPHERE,
      axes: [
        [2, 0, 0],
        [0, 1, 0],
        [0, 0, 9],
      ],
    },
    SQUARE_ON,
  );

  expect(outline.rx).toBeCloseTo(2, 12);
  expect(outline.ry).toBeCloseTo(1, 12);
});

test('a tilted shell comes back turned, measured down from the right', () => {
  const outline = ellipsoidSilhouette(
    {
      ...UNIT_SPHERE,
      axes: [
        [2, 2, 0],
        [-0.5, 0.5, 0],
        [0, 0, 0],
      ],
    },
    SQUARE_ON,
  );

  // The long axis climbs to the right in the data, so on a screen whose y
  // grows downwards it is turned by a negative eighth of a turn.
  expect(outline.rx).toBeCloseTo(Math.hypot(2, 2), 12);
  expect(outline.ry).toBeCloseTo(Math.hypot(0.5, 0.5), 12);
  expect(outline.angle).toBeCloseTo(-Math.PI / 4, 12);
});

test('a group flat in one direction draws as the segment it is', () => {
  const outline = ellipsoidSilhouette(
    {
      ...UNIT_SPHERE,
      axes: [
        [1.5, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
    },
    SQUARE_ON,
  );

  expect(outline.rx).toBeCloseTo(1.5, 12);
  expect(outline.ry).toBe(0);
});

test('a shell seen face-on through a turned camera keeps its area', () => {
  const flat: ConfidenceEllipsoid = {
    ...UNIT_SPHERE,
    axes: [
      [2, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
  };
  // Turned about the vertical axis, the wide axis foreshortens by its cosine
  // and the upright one does not.
  const outline = ellipsoidSilhouette(flat, { yaw: Math.PI / 3, pitch: 0 });

  expect(outline.rx).toBeCloseTo(1, 12);
  expect(outline.ry).toBeCloseTo(2 * Math.cos(Math.PI / 3), 12);
});
