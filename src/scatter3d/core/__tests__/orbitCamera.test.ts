import { expect, test } from 'vitest';

import {
  CUBE_HALF_DIAGONAL,
  DEFAULT_ORBIT_CAMERA,
  ORBIT_PITCH_LIMIT,
  depthFraction,
  orbitByDrag,
  projectPoint,
  rotatePoint,
} from '../orbitCamera.ts';

const STRAIGHT_ON = { yaw: 0, pitch: 0 };

test('a camera looking straight on leaves a point where it was', () => {
  expect(rotatePoint([0.25, -0.5, 0.75], STRAIGHT_ON)).toStrictEqual([
    0.25, -0.5, 0.75,
  ]);
});

test('a quarter turn of yaw swaps the horizontal axis for the depth axis', () => {
  const [x, y, z] = rotatePoint([1, 0, 0], { yaw: Math.PI / 2, pitch: 0 });

  expect(x).toBeCloseTo(0, 12);
  expect(y).toBe(0);
  expect(z).toBeCloseTo(-1, 12);
});

test('a quarter turn of pitch swaps the vertical axis for the depth axis', () => {
  const [x, y, z] = rotatePoint([0, 1, 0], { yaw: 0, pitch: Math.PI / 2 });

  expect(x).toBeCloseTo(0, 12);
  expect(y).toBeCloseTo(0, 12);
  expect(z).toBeCloseTo(1, 12);
});

test('a rotation keeps the length of every vector', () => {
  const rotated = rotatePoint([0.3, -0.7, 0.4], { yaw: 1.1, pitch: -0.4 });

  expect(Math.hypot(...rotated)).toBeCloseTo(Math.hypot(0.3, -0.7, 0.4), 12);
});

test('projecting puts the middle of the cube at the middle of the box', () => {
  expect(
    projectPoint([0, 0, 0], DEFAULT_ORBIT_CAMERA, {
      scale: 100,
      centerX: 210,
      centerY: 160,
    }),
  ).toStrictEqual({ x: 210, y: 160, depth: 0 });
});

test('the vertical axis is flipped, because pixels grow downwards', () => {
  const up = projectPoint([0, 1, 0], STRAIGHT_ON, {
    scale: 50,
    centerX: 100,
    centerY: 100,
  });

  expect(up).toStrictEqual({ x: 100, y: 50, depth: 0 });
});

test('a drag turns the scene by a hundredth of a radian per pixel', () => {
  expect(orbitByDrag({ yaw: 0, pitch: 0 }, 30, -20)).toStrictEqual({
    yaw: 0.3,
    pitch: -0.2,
  });
});

test('the pitch stops short of straight down instead of flipping over', () => {
  expect(orbitByDrag({ yaw: 0, pitch: 1.3 }, 0, 900).pitch).toBe(
    ORBIT_PITCH_LIMIT,
  );
  expect(orbitByDrag({ yaw: 0, pitch: -1.3 }, 0, -900).pitch).toBe(
    -ORBIT_PITCH_LIMIT,
  );
});

test('the yaw is free to wrap, because a box has no top of its turn', () => {
  expect(orbitByDrag({ yaw: 6.2, pitch: 0 }, 100, 0).yaw).toBeCloseTo(7.2, 12);
});

test('the depth fraction runs from the far corner to the near one', () => {
  expect(depthFraction(-CUBE_HALF_DIAGONAL)).toBe(0);
  expect(depthFraction(0)).toBe(0.5);
  expect(depthFraction(CUBE_HALF_DIAGONAL)).toBe(1);
});

test('a depth outside the cube is held inside the fraction', () => {
  expect(depthFraction(-99)).toBe(0);
  expect(depthFraction(99)).toBe(1);
  expect(depthFraction(Number.NaN)).toBe(0);
});

test('the default camera is off both axes, so the box reads as a box', () => {
  expect(DEFAULT_ORBIT_CAMERA.yaw).not.toBe(0);
  expect(DEFAULT_ORBIT_CAMERA.pitch).not.toBe(0);
});
