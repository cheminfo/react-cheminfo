/**
 * The camera moves every molstar scene of ours needs, and the one measurement
 * they all take: how big a sphere has to be framed for a handful of atoms to
 * be legible.
 */

import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

/** Transition length used when the caller does not pick one, milliseconds. */
export const DEFAULT_CAMERA_DURATION = 250;

/** Turn rate used when the caller does not pick one, in molstar's spin unit. */
export const DEFAULT_SPIN_SPEED = 1 / 3;

/**
 * Fraction of the bounding sphere kept as breathing room around the scene.
 *
 * `camera.reset()` frames with molstar's own margin, which suits a protein
 * filling a wide viewport and leaves a small molecule a speck in the middle:
 * measured coverage was 20% of the pixels. Framing the visible bounding sphere
 * directly, with a small margin, is what makes a single water molecule legible.
 */
export const FRAMING_MARGIN = 0.08;

/** Smallest radius framed, ångström, so one atom is not a close-up. */
export const MINIMUM_FRAMING_RADIUS = 0.5;

/** Axis the automatic spin turns about: screen up. */
const SPIN_AXIS = Vec3.create(0, 1, 0);

/**
 * The radius a reset frames, which is the length every stored camera is
 * measured against — so reading a camera and applying it are the same move in
 * opposite directions.
 * @param radius - Radius of the scene's visible bounding sphere.
 * @returns The framed radius.
 */
export function framedRadius(radius: number): number {
  return Math.max(radius * (1 + FRAMING_MARGIN), MINIMUM_FRAMING_RADIUS);
}

/**
 * Turn the automatic spin on or off. It moves the camera, never the object.
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
