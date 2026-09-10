import { expect, test } from 'vitest';

import { CUBE_ARMS, CUBE_ORIGIN, cubeEdges } from '../cubeFrame.ts';

test('a cube has twelve edges', () => {
  expect(cubeEdges()).toHaveLength(12);
});

test('every edge joins two corners of the cube', () => {
  for (const [from, to] of cubeEdges()) {
    for (const value of [...from, ...to]) expect(Math.abs(value)).toBe(1);
  }
});

test('every edge is one unit long in exactly one direction', () => {
  for (const [from, to] of cubeEdges()) {
    const differing =
      (from[0] === to[0] ? 0 : 1) +
      (from[1] === to[1] ? 0 : 1) +
      (from[2] === to[2] ? 0 : 1);

    expect(differing).toBe(1);
    expect(Math.hypot(from[0] - to[0], from[1] - to[1], from[2] - to[2])).toBe(
      2,
    );
  }
});

test('no edge is listed twice', () => {
  const seen = new Set(
    cubeEdges().map(([from, to]) => `${from.join(',')}|${to.join(',')}`),
  );

  expect(seen.size).toBe(12);
});

test('there is one labelled arm per axis', () => {
  expect(CUBE_ARMS.map((arm) => arm.axis)).toStrictEqual(['x', 'y', 'z']);
});

test('each arm runs from the origin corner along its own axis alone', () => {
  expect(CUBE_ORIGIN).toStrictEqual([-1, -1, -1]);

  for (const arm of CUBE_ARMS) {
    const moved = arm.end.filter((value, at) => value !== CUBE_ORIGIN[at]);

    expect(moved).toStrictEqual([1]);
  }
});

test('each label sits past the end of its own arm, outside the cloud', () => {
  for (const [at, arm] of CUBE_ARMS.entries()) {
    const axis = [0, 1, 2].find((index) => arm.end[index] === 1) as number;

    expect(arm.label[axis]).toBeGreaterThan(1);
    expect(at).toBe(at);
  }
});
