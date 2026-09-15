/**
 * The two camera moves the molecule viewer needs: frame whatever is on screen,
 * and the slow spin that makes a still picture of a 3D molecule readable.
 */

import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

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
      const framed = Math.max(
        radius * (1 + FRAMING_MARGIN),
        MIN_FRAMING_RADIUS,
      );
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
