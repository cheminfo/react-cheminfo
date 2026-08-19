import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { expect, test, vi } from 'vitest';

import { refitOrbital } from '../camera.ts';

/** Where a stub camera sits, in scene units. */
interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  radius: number;
}

/** The snapshot `refitOrbital` writes; every field is optional. */
interface Snapshot {
  position?: Vec3;
  up?: Vec3;
  radius?: number;
  radiusMax?: number;
}

/**
 * A plugin whose camera is a plain object, which is all the camera moves read.
 * @param state - Where the camera currently sits.
 * @returns The stub and the `setState` spy the assertions read.
 */
function stubPlugin(state: CameraState): {
  plugin: PluginContext;
  setState: ReturnType<typeof vi.fn<(s: Snapshot, ms: number) => void>>;
} {
  const setState = vi.fn<(snapshot: Snapshot, durationMs: number) => void>();
  const plugin = {
    canvas3d: {
      camera: {
        state: {
          position: Vec3.create(...state.position),
          target: Vec3.create(...state.target),
          radius: state.radius,
        },
        getTargetDistance: (radius: number) => radius * 2,
        setState,
      },
      boundingSphere: { radius: 30 },
      boundingSphereVisible: { radius: 20, center: Vec3.zero() },
      props: { sceneRadiusFactor: 1 },
    },
  } as unknown as PluginContext;
  return { plugin, setState };
}

test('an orbital of the same extent leaves the view exactly where it was', () => {
  const { plugin, setState } = stubPlugin({
    position: [10, -20, 5],
    target: [0, 0, 0],
    radius: 12,
  });

  refitOrbital(plugin, 12, 12);

  // Only the scene extent is refreshed — molstar no longer tracks it — because
  // moving the camera at all is the bug this exists to prevent.
  expect(setState).toHaveBeenCalledExactlyOnceWith({ radiusMax: 30 }, 0);
});

test('a wider orbital scales the distance and the radius by the same factor', () => {
  const { plugin, setState } = stubPlugin({
    position: [0, -24, 0],
    target: [0, 0, 0],
    radius: 12,
  });

  refitOrbital(plugin, 12, 18, 100);

  expect(setState).toHaveBeenCalledOnce();

  const [snapshot, durationMs] = setState.mock.calls[0] ?? [];

  expect(durationMs).toBe(100);
  expect(snapshot?.radius).toBe(18);
  expect(snapshot?.radiusMax).toBe(30);
  // The direction is untouched — a student's rotation survives — and only the
  // distance grows, by 18 / 12.
  expect([...(snapshot?.position ?? [])]).toStrictEqual([0, -36, 0]);
});

test('a pan is kept: the offset is scaled about the target, not the origin', () => {
  const { plugin, setState } = stubPlugin({
    position: [4, -20, 0],
    target: [4, 4, 0],
    radius: 12,
  });

  refitOrbital(plugin, 12, 6);

  const [snapshot] = setState.mock.calls[0] ?? [];

  expect(snapshot?.radius).toBe(6);
  expect([...(snapshot?.position ?? [])]).toStrictEqual([4, -8, 0]);
});

test('no previous extent falls back to framing the orbital afresh', () => {
  const { plugin, setState } = stubPlugin({
    position: [1, 1, 1],
    target: [0, 0, 0],
    radius: 0,
  });

  refitOrbital(plugin, 0, 12);

  const [snapshot] = setState.mock.calls[0] ?? [];

  // `frameOrbital`'s own view: z up, and the orbital's extent plus its margin.
  expect([...(snapshot?.up ?? [])]).toStrictEqual([0, 0, 1]);
  expect(snapshot?.radius).toBeCloseTo(12 * 1.08, 10);
  expect(snapshot?.radiusMax).toBe(30);
});
