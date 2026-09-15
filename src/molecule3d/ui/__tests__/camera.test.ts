import type { Camera } from 'molstar/lib/mol-canvas3d/camera.js';
import type { Canvas3DCameraResetOptions } from 'molstar/lib/mol-canvas3d/canvas3d.js';
import type { Scene } from 'molstar/lib/mol-gl/scene.js';
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { expect, test, vi } from 'vitest';

import { resetCamera } from '../camera.ts';

type SnapshotFunction = (
  scene: Scene,
  camera: Camera,
) => Partial<Camera.Snapshot>;

/**
 * Ask `resetCamera` for a reset and hand back the snapshot function molstar
 * would call once the canvas has committed the scene.
 * @param durationMilliseconds - Passed through to `resetCamera`.
 * @returns The reset options and their snapshot function.
 */
function requestReset(durationMilliseconds: number): {
  options: Canvas3DCameraResetOptions;
  snapshot: SnapshotFunction;
} {
  const requestCameraReset =
    vi.fn<(options: Canvas3DCameraResetOptions) => void>();
  const plugin = {
    canvas3d: { requestCameraReset },
  } as unknown as PluginContext;
  resetCamera(plugin, durationMilliseconds);

  expect(requestCameraReset).toHaveBeenCalledOnce();

  const options = requestCameraReset.mock.calls[0]?.[0] ?? {};

  expect(typeof options.snapshot).toBe('function');

  return { options, snapshot: options.snapshot as SnapshotFunction };
}

/**
 * Evaluate a snapshot function against a scene sphere.
 * @param snapshot - What `resetCamera` requested.
 * @param radius - Radius of the visible sphere.
 * @returns The centre and radius handed to `getFocus`.
 */
function frame(
  snapshot: SnapshotFunction,
  radius: number,
): { center: Vec3; radius: number } {
  const center = Vec3.create(1, 2, 3);
  const scene = {
    boundingSphereVisible: { center, radius },
  } as unknown as Scene;
  const getFocus = vi.fn((target: Vec3, focusRadius: number) => ({
    target,
    radius: focusRadius,
  }));
  snapshot(scene, { getFocus } as unknown as Camera);

  expect(getFocus).toHaveBeenCalledOnce();

  const [target, focusRadius] = getFocus.mock.calls[0] ?? [];
  return { center: target ?? Vec3.zero(), radius: focusRadius ?? 0 };
}

test('the sphere is read when molstar resolves the reset, after the scene commit', () => {
  const { options, snapshot } = requestReset(0);

  expect(options.durationMs).toBe(0);

  // The canvas refreshes the sphere a frame after the model is added, so the
  // one framed is the one present when the snapshot is evaluated.
  const framed = frame(snapshot, 10);

  expect([...framed.center]).toStrictEqual([1, 2, 3]);
  expect(framed.radius).toBeCloseTo(10.8, 10);
});

test('a single atom is framed at the minimum radius, not as a close-up', () => {
  const { snapshot } = requestReset(250);

  expect(frame(snapshot, 0.2).radius).toBe(0.5);
});

test('framing from the front looks down -z with y up, instantly', () => {
  const requestCameraReset =
    vi.fn<(options: Canvas3DCameraResetOptions) => void>();
  const plugin = {
    canvas3d: { requestCameraReset },
  } as unknown as PluginContext;
  resetCamera(plugin, 0, true);
  const options = requestCameraReset.mock.calls[0]?.[0] ?? {};
  const getFocus = vi.fn(
    (target: Vec3, radius: number, up?: Vec3, direction?: Vec3) => ({
      target,
      radius,
      up,
      direction,
    }),
  );
  const scene = {
    boundingSphereVisible: { center: Vec3.create(1, 2, 3), radius: 10 },
  } as unknown as Scene;
  (options.snapshot as SnapshotFunction)(scene, {
    getFocus,
  } as unknown as Camera);

  expect(options.durationMs).toBe(0);

  const [, , up, direction] = getFocus.mock.calls[0] ?? [];

  expect([...(up ?? [])]).toStrictEqual([0, 1, 0]);
  expect([...(direction ?? [])]).toStrictEqual([0, 0, -1]);
});

test('a viewer without a canvas asks for nothing', () => {
  const plugin = { canvas3d: undefined } as unknown as PluginContext;

  expect(() => {
    resetCamera(plugin);
  }).not.toThrow();
});
