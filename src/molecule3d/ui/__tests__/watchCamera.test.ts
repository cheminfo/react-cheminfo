/**
 * Following the camera: every move of molstar's camera read back as the
 * scene-relative camera a link carries, until the watch is stopped.
 */

import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { expect, test } from 'vitest';

import type { Molecule3DCamera } from '../../core/camera.ts';
import { watchCamera } from '../camera.ts';

test('every move of the camera is read back, until the watch is stopped', () => {
  const changed = standInEvent();
  const sphere = { center: Vec3.create(0, 0, 0), radius: 10 };
  const plugin = {
    canvas3d: {
      boundingSphereVisible: sphere,
      camera: {
        changed,
        getSnapshot: () => ({
          position: Vec3.create(0, 0, 30),
          target: Vec3.create(0, 0, 0),
          up: Vec3.create(0, 1, 0),
        }),
        getTargetDistance: () => 30,
      },
    },
  } as unknown as PluginContext;
  const seen: Array<Molecule3DCamera | null> = [];

  const stop = watchCamera(plugin, (camera) => seen.push(camera));
  changed.next();
  sphere.radius = 0;
  changed.next();
  stop();
  changed.next();

  expect(seen).toStrictEqual([
    { rotation: [0, 0, 0, 1], zoom: 1, offset: [0, 0, 0] },
    null,
  ]);
  expect(changed.listeners.size).toBe(0);
});

test('a viewer without a canvas has no camera to follow', () => {
  const seen: unknown[] = [];

  const stop = watchCamera({} as PluginContext, (camera) => seen.push(camera));
  stop();

  expect(seen).toStrictEqual([]);
});

/**
 * The few members of an rxjs subject the camera's `changed` is read through.
 * @returns The event, its `next` and its listeners.
 */
function standInEvent() {
  const listeners = new Set<() => void>();
  return {
    listeners,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return { unsubscribe: () => listeners.delete(listener) };
    },
    next() {
      for (const listener of listeners) listener();
    },
  };
}
