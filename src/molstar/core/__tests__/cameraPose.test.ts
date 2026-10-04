/**
 * The camera a link carries must bring back the pose it was read from, and
 * mean the same thing whatever size the scene is. Reading and applying a live
 * camera need a WebGL canvas; this is the half that does not.
 */

import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import { assert, expect, test } from 'vitest';

import type { CameraPose, CameraReference } from '../cameraPose.ts';
import { cameraToPose, poseToCamera } from '../cameraPose.ts';

const REFERENCE: CameraReference = {
  center: Vec3.create(1, -2, 0.5),
  radius: 3,
};

/** How far a camera stands to frame {@link REFERENCE}, as molstar would say. */
const FRAMING_DISTANCE = 12;

test('the front view at framing distance is the default camera', () => {
  const pose: CameraPose = {
    target: Vec3.clone(REFERENCE.center),
    position: Vec3.create(1, -2, 12.5),
    up: Vec3.create(0, 1, 0),
  };

  expect(poseToCamera(pose, REFERENCE, FRAMING_DISTANCE)).toStrictEqual({
    rotation: [0, 0, 0, 1],
    zoom: 1,
    offset: [0, 0, 0],
  });
});

test('twice as close reads as zoom 2, and a pan as an offset in radii', () => {
  const pose: CameraPose = {
    target: Vec3.create(4, -2, 0.5),
    position: Vec3.create(4, -2, 6.5),
    up: Vec3.create(0, 1, 0),
  };

  const camera = poseToCamera(pose, REFERENCE, FRAMING_DISTANCE);

  expect(camera?.zoom).toBe(2);
  expect(camera?.offset).toStrictEqual([1, 0, 0]);
});

test('a turned, zoomed and panned pose comes back from its camera', () => {
  const pose: CameraPose = {
    target: Vec3.create(1.6, -2.3, 1.1),
    position: Vec3.create(6.2, 1.4, -3.9),
    up: Vec3.normalize(Vec3.zero(), Vec3.create(-0.3, 0.9, 0.2)),
  };

  const camera = poseToCamera(pose, REFERENCE, FRAMING_DISTANCE);

  assert(camera !== null, 'a pose this ordinary must read as a camera');

  const back = cameraToPose(camera, REFERENCE, FRAMING_DISTANCE);

  for (let index = 0; index < 3; index++) {
    expect(back.target[index]).toBeCloseTo(pose.target[index] ?? 0, 10);
    expect(back.position[index]).toBeCloseTo(pose.position[index] ?? 0, 10);
  }
  // Up is squared against the viewing direction, as the trackball keeps it.
  const direction = Vec3.sub(Vec3.zero(), pose.target, pose.position);

  expect(Vec3.dot(back.up, direction)).toBeCloseTo(0, 10);
  expect(Vec3.dot(back.up, pose.up)).toBeGreaterThan(0.99);
});

test('the same camera frames a larger molecule from further away', () => {
  const camera = {
    rotation: [0, 0, 0, 1],
    zoom: 2,
    offset: [0, 0, 0],
  } as const;
  const small = cameraToPose(camera, REFERENCE, FRAMING_DISTANCE);
  const large = cameraToPose(
    camera,
    { center: REFERENCE.center, radius: 6 },
    FRAMING_DISTANCE * 2,
  );

  expect(Vec3.distance(small.position, small.target)).toBe(6);
  expect(Vec3.distance(large.position, large.target)).toBe(12);
});

test('a camera standing on its target is no camera', () => {
  const pose: CameraPose = {
    target: Vec3.create(0, 0, 0),
    position: Vec3.create(0, 0, 0),
    up: Vec3.create(0, 1, 0),
  };

  expect(poseToCamera(pose, REFERENCE, FRAMING_DISTANCE)).toBeNull();
});

test('an offset below what a link can write is no offset', () => {
  const pose: CameraPose = {
    target: Vec3.create(1.0003, -2, 0.5),
    position: Vec3.create(1.0003, -2, 12.5),
    up: Vec3.create(0, 1, 0),
  };

  expect(
    poseToCamera(pose, REFERENCE, FRAMING_DISTANCE, { snapOffset: 5e-4 })
      ?.offset,
  ).toStrictEqual([0, 0, 0]);
  // Without the option the hair is written out, which is what a site that
  // measures against the whole scene wants.
  expect(
    poseToCamera(pose, REFERENCE, FRAMING_DISTANCE)?.offset[0],
  ).toBeCloseTo(0.0001, 10);
});
