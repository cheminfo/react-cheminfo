/**
 * The camera moves the molecule viewer needs: frame whatever is on screen, the
 * slow spin that makes a still picture of a 3D molecule readable, and the two
 * directions between molstar's camera and the scene-relative camera a link
 * carries.
 */

import type { Camera } from 'molstar/lib/mol-canvas3d/camera.js';
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

import {
  DEFAULT_CAMERA_DURATION,
  cameraToPose,
  framedRadius,
  poseToCamera,
} from '../../molstar/core/index.ts';
import type { Molecule3DCamera } from '../core/camera.ts';

/** Screen up and viewing direction when the model is seen as its file lays it. */
const FRONT_UP = Vec3.create(0, 1, 0);
const FRONT_DIRECTION = Vec3.create(0, 0, -1);

/**
 * Frame everything currently in the scene.
 *
 * The canvas refreshes its visible bounding sphere only when its render loop
 * commits the scene, one frame after the state tree has resolved. Reading the
 * sphere now would centre and clip on whatever was drawn before — atoms cut by
 * the near plane — so the framing is computed when molstar resolves the reset,
 * after that commit.
 * @param plugin - The molstar context.
 * @param durationMilliseconds - Transition length. Pass 0 for an instant jump.
 * @param fromFront - Look down -z with y up, instead of keeping the current
 * direction.
 */
export function resetCamera(
  plugin: PluginContext,
  durationMilliseconds = DEFAULT_CAMERA_DURATION,
  fromFront = false,
): void {
  plugin.canvas3d?.requestCameraReset({
    durationMs: durationMilliseconds,
    snapshot: (scene, camera) => {
      const { center, radius } = scene.boundingSphereVisible;
      const framed = framedRadius(radius);
      return fromFront
        ? camera.getFocus(center, framed, FRONT_UP, FRONT_DIRECTION)
        : camera.getFocus(center, framed);
    },
  });
}

/**
 * Where the camera stands, against the scene rather than its coordinates.
 *
 * An empty scene has no camera to read: a canvas showing nothing still has one,
 * pointing at the origin from molstar's default distance, and measuring that
 * against a sphere of no radius describes a view that means nothing — which
 * would then be applied to the first molecule drawn.
 * @param plugin - The molstar context.
 * @returns The camera, or `null` when there is no canvas or nothing to measure
 * it against.
 */
export function readCamera(plugin: PluginContext): Molecule3DCamera | null {
  const canvas = plugin.canvas3d;
  if (canvas === undefined) return null;
  const { center, radius } = canvas.boundingSphereVisible;
  if (!(radius > 0)) return null;
  const framed = framedRadius(radius);
  const camera = canvas.camera;
  return poseToCamera(
    camera.getSnapshot(),
    { center, radius: framed },
    camera.getTargetDistance(framed),
  );
}

/**
 * Put the camera back where a link says it stood.
 *
 * Ordered through `requestCameraReset` for the same reason {@link resetCamera}
 * is: the bounding sphere the camera is measured against is only refreshed when
 * the canvas commits the scene, so the move is computed then rather than now.
 * @param plugin - The molstar context.
 * @param camera - Where to stand.
 * @param durationMilliseconds - Transition length. Pass 0 for an instant jump.
 */
export function applyCamera(
  plugin: PluginContext,
  camera: Molecule3DCamera,
  durationMilliseconds = 0,
): void {
  plugin.canvas3d?.requestCameraReset({
    durationMs: durationMilliseconds,
    snapshot: (scene, current) => {
      const { center, radius } = scene.boundingSphereVisible;
      const framed = framedRadius(radius);
      const reference = { center, radius: framed };
      const pose = cameraToPose(
        camera,
        reference,
        current.getTargetDistance(framed),
      );
      return { ...pose, radius: framed };
    },
  });
}

/**
 * Follow the camera, however it moves — a drag, the reset button, the spin.
 * @param plugin - The molstar context.
 * @param listener - Called after every move, with the camera it left.
 * @returns A function that stops calling the listener.
 */
export function watchCamera(
  plugin: PluginContext,
  listener: (camera: Molecule3DCamera | null) => void,
): () => void {
  const camera: Camera | undefined = plugin.canvas3d?.camera;
  if (camera === undefined) return noop;
  const subscription = camera.changed.subscribe(() => {
    listener(readCamera(plugin));
  });
  return () => {
    subscription.unsubscribe();
  };
}

function noop(): void {
  // Nothing was subscribed, so there is nothing to unsubscribe.
}
