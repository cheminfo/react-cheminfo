import { expect, test } from 'vitest';

import type { OrbitCamera, Vector3 } from '../../core/orbitCamera.ts';
import { DEFAULT_ORBIT_CAMERA, projectPoint } from '../../core/orbitCamera.ts';
import type { CloudCloud } from '../cloudGeometry.ts';
import { projectCloud, projectShellOutline } from '../cloudGeometry.ts';

const VIEWPORT = { scale: 180, centerX: 320, centerY: 240 };

const CAMERAS: OrbitCamera[] = [
  DEFAULT_ORBIT_CAMERA,
  { yaw: 0, pitch: 0 },
  { yaw: -2.3, pitch: 1.4 },
  { yaw: 7.9, pitch: -0.8 },
];

/**
 * A cloud with ties in depth, a repeated sample and one that is not finite.
 * @returns The samples, in cube units.
 */
function testCube(): Vector3[] {
  const cube: Vector3[] = [];
  for (let index = 0; index < 400; index++) {
    cube.push([
      ((index * 0.618_033_988_75) % 1) * 2 - 1,
      ((index * 0.754_877_666_25) % 1) * 2 - 1,
      ((index * 0.569_840_290_99) % 1) * 2 - 1,
    ]);
  }
  cube.push([0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0, 0, 0], [Number.NaN, 0, 0]);
  return cube;
}

/**
 * Every sample through `projectPoint` on its own, then a sorted row order:
 * the definition the one-pass projection must reproduce bit for bit.
 * @param cube - The samples.
 * @param camera - Where the reader is standing.
 * @returns The reference projection.
 */
function projectOneByOne(cube: Vector3[], camera: OrbitCamera): CloudCloud {
  const x = new Float64Array(cube.length);
  const y = new Float64Array(cube.length);
  const depths = new Float64Array(cube.length);
  const rows = new Uint32Array(cube.length);
  for (let index = 0; index < cube.length; index++) {
    const at = projectPoint(cube[index] as Vector3, camera, VIEWPORT);
    x[index] = at.x;
    y[index] = at.y;
    depths[index] = at.depth;
    rows[index] = index;
  }
  const order = rows.toSorted(
    (a, b) => (depths[a] as number) - (depths[b] as number),
  );
  return { points: { x, y }, depths, order };
}

test('the one-pass projection matches projecting every point on its own, bit for bit', () => {
  const cube = testCube();
  for (const camera of CAMERAS) {
    expect(projectCloud(cube, camera, VIEWPORT)).toStrictEqual(
      projectOneByOne(cube, camera),
    );
  }
});

test('the cloud is painted back to front', () => {
  const cloud = projectCloud(
    [
      [0, 0, 0.5],
      [0, 0, -0.5],
      [0, 0, 0],
    ],
    { yaw: 0, pitch: 0 },
    VIEWPORT,
  );

  expect(cloud.order).toStrictEqual(new Uint32Array([1, 2, 0]));
  expect(cloud.depths).toStrictEqual(new Float64Array([0.5, -0.5, 0]));
  expect(cloud.points.x).toStrictEqual(new Float64Array([320, 320, 320]));
});

test('an empty cloud projects to empty runs', () => {
  expect(projectCloud([], DEFAULT_ORBIT_CAMERA, VIEWPORT)).toStrictEqual({
    points: { x: new Float64Array(0), y: new Float64Array(0) },
    depths: new Float64Array(0),
    order: new Uint32Array(0),
  });
});

test('a shell seen straight on keeps its two front axes as its outline', () => {
  expect(
    projectShellOutline(
      {
        center: [0, 0, 0],
        axes: [
          [0.5, 0, 0],
          [0, 0.25, 0],
          [0, 0, 0.1],
        ],
        count: 12,
      },
      { yaw: 0, pitch: 0 },
      VIEWPORT,
    ),
  ).toStrictEqual({ cx: 320, cy: 240, rx: 90, ry: 45, angle: 0, depth: 0 });
});

test('a shell the camera cannot place is not outlined', () => {
  const axes: [Vector3, Vector3, Vector3] = [
    [0.5, 0, 0],
    [0, 0.25, 0],
    [0, 0, 0.1],
  ];

  expect(
    projectShellOutline(
      { center: [Number.NaN, 0, 0], axes, count: 12 },
      DEFAULT_ORBIT_CAMERA,
      VIEWPORT,
    ),
  ).toBeNull();
  expect(
    projectShellOutline(
      {
        center: [0, 0, 0],
        axes: [[Number.POSITIVE_INFINITY, 0, 0], axes[1], axes[2]],
        count: 12,
      },
      DEFAULT_ORBIT_CAMERA,
      VIEWPORT,
    ),
  ).toBeNull();
});
