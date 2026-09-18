/**
 * The camera moves the molecule viewer needs: frame whatever is on screen, the
 * slow spin that makes a still picture of a 3D molecule readable, and the two
 * directions between molstar's camera and the scene-relative camera a link
 * carries.
 */

import type { Camera } from 'molstar/lib/mol-canvas3d/camera.js';
import { Quat, Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

import type { Molecule3DCamera } from '../core/camera.ts';
import { normalizeMolecule3DCamera } from '../core/camera.ts';

/** Transition length used when the caller does not pick one, milliseconds. */
export const DEFAULT_CAMERA_DURATION = 250;

/** Turn rate used when the caller does not pick one, in molstar's spin unit. */
export const DEFAULT_SPIN_SPEED = 1 / 3;

/**
 * Fraction of the bounding sphere kept as breathing room around the model.
 *
 * `camera.reset()` frames the scene with molstar's own margin, which suits a
 * protein filling a wide viewport and leaves a small molecule a speck in the
 * middle. Framing the visible bounding sphere directly is what makes a single
 * ethanol legible.
 */
const FRAMING_MARGIN = 0.08;

/** Axis the automatic spin turns about: screen up. */
const SPIN_AXIS = Vec3.create(0, 1, 0);

/** Smallest radius framed, in ångström, so a single atom is not a close-up. */
const MIN_FRAMING_RADIUS = 0.5;

/** Screen up and viewing direction when the model is seen as its file lays it. */
const FRONT_UP = Vec3.create(0, 1, 0);
const FRONT_DIRECTION = Vec3.create(0, 0, -1);

/** The camera's own axes, which the stored rotation turns into world ones. */
const CAMERA_UP = Vec3.create(0, 1, 0);
const CAMERA_BACK = Vec3.create(0, 0, 1);

/**
 * The radius a reset frames, which is the length every stored camera is
 * measured against — so reading a camera and applying it are the same move in
 * opposite directions.
 * @param radius - Radius of the scene's visible bounding sphere.
 * @returns The framed radius.
 */
function framedRadius(radius: number): number {
  return Math.max(radius * (1 + FRAMING_MARGIN), MIN_FRAMING_RADIUS);
}

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
 * Turn the automatic spin on or off.
 * @param plugin - The molstar context.
 * @param spinning - Whether the scene should keep turning.
 * @param speed - Turn rate, in molstar's own spin unit.
 */
export function setSpin(
  plugin: PluginContext,
  spinning: boolean,
  speed = DEFAULT_SPIN_SPEED,
): void {
  plugin.canvas3d?.setProps({
    trackball: {
      animate: spinning
        ? { name: 'spin', params: { speed, axis: SPIN_AXIS } }
        : { name: 'off', params: {} },
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
  const { position, target, up } = camera.getSnapshot();
  const back = Vec3.sub(Vec3.zero(), position, target);
  const distance = Vec3.magnitude(back);
  if (distance <= 0) return null;
  Vec3.scale(back, back, 1 / distance);
  // The trackball keeps up and back close to square, never exactly so.
  const trueUp = Vec3.scaleAndAdd(Vec3.zero(), up, back, -Vec3.dot(up, back));
  if (Vec3.magnitude(trueUp) <= 0) return null;
  Vec3.normalize(trueUp, trueUp);
  const right = Vec3.cross(Vec3.zero(), trueUp, back);
  const rotation = Quat.fromBasis(Quat.identity(), right, trueUp, back);
  const offset = Vec3.sub(Vec3.zero(), target, center);
  Vec3.scale(offset, offset, 1 / framed);
  return normalizeMolecule3DCamera({
    rotation: [
      rotation[0] ?? 0,
      rotation[1] ?? 0,
      rotation[2] ?? 0,
      rotation[3] ?? 1,
    ],
    zoom: camera.getTargetDistance(framed) / distance,
    offset: [offset[0] ?? 0, offset[1] ?? 0, offset[2] ?? 0],
  });
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
  const { rotation, zoom, offset } = normalizeMolecule3DCamera(camera);
  const turn = Quat.create(rotation[0], rotation[1], rotation[2], rotation[3]);
  plugin.canvas3d?.requestCameraReset({
    durationMs: durationMilliseconds,
    snapshot: (scene, current) => {
      const { center, radius } = scene.boundingSphereVisible;
      const framed = framedRadius(radius);
      const up = Vec3.transformQuat(Vec3.zero(), CAMERA_UP, turn);
      const back = Vec3.transformQuat(Vec3.zero(), CAMERA_BACK, turn);
      const target = Vec3.create(
        (center[0] ?? 0) + offset[0] * framed,
        (center[1] ?? 0) + offset[1] * framed,
        (center[2] ?? 0) + offset[2] * framed,
      );
      const distance = current.getTargetDistance(framed) / zoom;
      const position = Vec3.scaleAndAdd(Vec3.zero(), target, back, distance);
      return { target, position, up, radius: framed };
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
