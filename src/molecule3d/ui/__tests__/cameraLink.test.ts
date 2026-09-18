import type { Camera } from 'molstar/lib/mol-canvas3d/camera.js';
import type { Canvas3DCameraResetOptions } from 'molstar/lib/mol-canvas3d/canvas3d.js';
import type { Scene } from 'molstar/lib/mol-gl/scene.js';
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { expect, test, vi } from 'vitest';

import type { Molecule3DCamera } from '../../core/camera.ts';
import { applyCamera, readCamera } from '../camera.ts';

type SnapshotFunction = (
  scene: Scene,
  camera: Camera,
) => Partial<Camera.Snapshot>;

/**
 * A plugin whose canvas holds one sphere and one camera snapshot.
 * @param sphere - The visible bounding sphere.
 * @param sphere.center - Its centre.
 * @param sphere.radius - Its radius.
 * @param snapshot - Where the camera stands.
 * @param snapshot.position - Where the camera is.
 * @param snapshot.target - What it looks at.
 * @param snapshot.up - Which way is up on screen.
 * @param targetDistance - What `getTargetDistance` answers for any radius.
 * @returns The stand-in plugin.
 */
function pluginWithCamera(
  sphere: { center: Vec3; radius: number },
  snapshot: { position: Vec3; target: Vec3; up: Vec3 },
  targetDistance: number,
): PluginContext {
  return {
    canvas3d: {
      boundingSphereVisible: sphere,
      camera: {
        getSnapshot: () => snapshot,
        getTargetDistance: () => targetDistance,
      },
    },
  } as unknown as PluginContext;
}

test('the front view reads as no rotation, framing the whole model', () => {
  const plugin = pluginWithCamera(
    { center: Vec3.create(0, 0, 0), radius: 10 },
    {
      position: Vec3.create(0, 0, 30),
      target: Vec3.create(0, 0, 0),
      up: Vec3.create(0, 1, 0),
    },
    30,
  );
  const camera = readCamera(plugin);

  expect(camera?.rotation).toStrictEqual([0, 0, 0, 1]);
  expect(camera?.zoom).toBe(1);
  expect(camera?.offset).toStrictEqual([0, 0, 0]);
});

test('a quarter turn about the screen up axis reads as that quarter turn', () => {
  const plugin = pluginWithCamera(
    { center: Vec3.create(0, 0, 0), radius: 10 },
    {
      position: Vec3.create(30, 0, 0),
      target: Vec3.create(0, 0, 0),
      up: Vec3.create(0, 1, 0),
    },
    30,
  );
  const rotation = readCamera(plugin)?.rotation ?? [0, 0, 0, 0];

  expect(rotation[0]).toBeCloseTo(0, 10);
  expect(rotation[1]).toBeCloseTo(Math.SQRT1_2, 10);
  expect(rotation[2]).toBeCloseTo(0, 10);
  expect(rotation[3]).toBeCloseTo(Math.SQRT1_2, 10);
});

test('half the framing distance reads as twice the zoom, and a pan as an offset', () => {
  const plugin = pluginWithCamera(
    { center: Vec3.create(0, 0, 0), radius: 10 },
    {
      position: Vec3.create(0, 5.4, 15),
      target: Vec3.create(0, 5.4, 0),
      up: Vec3.create(0, 1, 0),
    },
    30,
  );
  const camera = readCamera(plugin);

  expect(camera?.zoom).toBe(2);
  // 5.4 is half of the 10.8 radius a reset frames.
  expect(camera?.offset).toStrictEqual([0, 0.5, 0]);
});

test('a camera at its target has no direction to read', () => {
  const plugin = pluginWithCamera(
    { center: Vec3.create(0, 0, 0), radius: 10 },
    {
      position: Vec3.create(0, 0, 0),
      target: Vec3.create(0, 0, 0),
      up: Vec3.create(0, 1, 0),
    },
    30,
  );

  expect(readCamera(plugin)).toBeNull();
});

test('applying a camera stands it where the link said, once the scene is committed', () => {
  const requestCameraReset =
    vi.fn<(options: Canvas3DCameraResetOptions) => void>();
  const plugin = {
    canvas3d: { requestCameraReset },
  } as unknown as PluginContext;
  applyCamera(plugin, { rotation: [0, 0, 0, 1], zoom: 2, offset: [0, 0, 0] });
  const options = requestCameraReset.mock.calls[0]?.[0] ?? {};

  expect(options.durationMs).toBe(0);

  const scene = {
    boundingSphereVisible: { center: Vec3.create(1, 2, 3), radius: 10 },
  } as unknown as Scene;
  const state = (options.snapshot as SnapshotFunction)(scene, {
    getTargetDistance: () => 30,
  } as unknown as Camera);

  expect([...(state.target ?? [])]).toStrictEqual([1, 2, 3]);
  // Twice the zoom is half the framing distance, along the way the camera looks.
  expect([...(state.position ?? [])]).toStrictEqual([1, 2, 18]);
  expect([...(state.up ?? [])]).toStrictEqual([0, 1, 0]);
  expect(state.radius).toBeCloseTo(10.8, 10);
});

test('what a viewer reads is what applying it puts back', () => {
  const plugin = pluginWithCamera(
    { center: Vec3.create(0, 0, 0), radius: 10 },
    {
      position: Vec3.create(12, 9, 6),
      target: Vec3.create(0, 0, 0),
      up: Vec3.create(0, 1, 0),
    },
    30,
  );
  const camera = readCamera(plugin);

  expect(camera).not.toBeNull();

  const requestCameraReset =
    vi.fn<(options: Canvas3DCameraResetOptions) => void>();
  const target = {
    canvas3d: { requestCameraReset },
  } as unknown as PluginContext;
  applyCamera(target, camera as Molecule3DCamera);
  const scene = {
    boundingSphereVisible: { center: Vec3.create(0, 0, 0), radius: 10 },
  } as unknown as Scene;
  const options = requestCameraReset.mock.calls[0]?.[0] ?? {};
  const state = (options.snapshot as SnapshotFunction)(scene, {
    getTargetDistance: () => 30,
  } as unknown as Camera);
  const position = state.position ?? Vec3.zero();

  expect(position[0]).toBeCloseTo(12, 3);
  expect(position[1]).toBeCloseTo(9, 3);
  expect(position[2]).toBeCloseTo(6, 3);
});

test('an empty scene has no camera to read', () => {
  const plugin = pluginWithCamera(
    { center: Vec3.create(0, 0, 0), radius: 0 },
    {
      position: Vec3.create(0, 0, 100),
      target: Vec3.create(0, 0, 0),
      up: Vec3.create(0, 1, 0),
    },
    1.5,
  );

  expect(readCamera(plugin)).toBeNull();
});
