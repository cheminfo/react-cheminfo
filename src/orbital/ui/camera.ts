/**
 * The camera moves an atomic orbital needs: frame it from an angle its lobes
 * can be told apart at, and the slow spin that makes a flat screenshot of a 3D
 * shape readable.
 */

import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

/** Transition length used when the caller does not pick one, milliseconds. */
export const DEFAULT_CAMERA_DURATION = 250;

/**
 * Turn rate used when the caller does not pick one, in molstar's own spin unit.
 *
 * A lobe has to stay in one place long enough to be read; molstar's own 1 turns
 * an orbital fast enough that the phases blur into each other.
 */
export const DEFAULT_SPIN_SPEED = 0.3;

/**
 * Fraction of the bounding sphere kept as breathing room around the orbital.
 *
 * `camera.reset()` frames the scene with molstar's own margin, which suits a
 * protein filling a wide viewport. One orbital in a square frame measured 20%
 * of the pixels that way — it read as a speck. Framing the visible bounding
 * sphere directly, with a small margin, is what makes it legible.
 */
const FRAMING_MARGIN = 0.08;

/**
 * Frame everything currently in the scene.
 * @param plugin - The molstar context.
 * @param durationMs - Transition length. Pass 0 for an instant jump.
 */
export function resetCamera(
  plugin: PluginContext,
  durationMs = DEFAULT_CAMERA_DURATION,
): void {
  const scene = plugin.canvas3d?.boundingSphereVisible;
  if (scene === undefined || scene.radius <= 0) {
    plugin.managers.camera.reset(undefined, durationMs);
    return;
  }
  plugin.managers.camera.focusSphere(scene, {
    extraRadius: scene.radius * FRAMING_MARGIN,
    minRadius: 0.5,
    durationMs,
  });
}

/**
 * Direction from the target to the camera for a single atom's orbital.
 *
 * An atomic orbital is aligned with the cartesian axes, so the default view
 * looks straight down one of them and a `p_z` or a `d_z²` collapses into
 * concentric rings — geometrically correct and completely unreadable. Coming in
 * off-axis separates the lobes.
 */
const ORBITAL_VIEW_OFFSET = Vec3.create(0.8, -1, 0.45);

/**
 * Screen up for that view: `+z`, so the z axis is vertical exactly as every
 * textbook draws `p_z` and `d_z²`.
 */
const ORBITAL_VIEW_UP = Vec3.create(0, 0, 1);

/**
 * Frame the scene from an oblique angle, for a lone atom rather than a molecule.
 *
 * `camera.focus` cannot do this: its `up` and `dir` arguments only *flip* the
 * orientation the camera already has, so an explicit viewpoint has to be set
 * through the snapshot.
 * @param plugin - The molstar context.
 * @param orbitalRadius - Extent of the drawn surface, ångström. Molstar sizes a
 * volume representation's bounding sphere from the whole sampled box, which is
 * far larger than the isosurface inside it, so framing that sphere leaves the
 * orbital a quarter of the frame wide. Omit it to fall back on the scene.
 * @param durationMs - Transition length. Pass 0 for an instant jump.
 */
export function frameOrbital(
  plugin: PluginContext,
  orbitalRadius?: number,
  durationMs = DEFAULT_CAMERA_DURATION,
): void {
  const canvas3d = plugin.canvas3d;
  const scene = canvas3d?.boundingSphereVisible;
  if (canvas3d === undefined || scene === undefined || scene.radius <= 0) {
    resetCamera(plugin, durationMs);
    return;
  }
  const radius =
    orbitalRadius !== undefined && orbitalRadius > 0
      ? orbitalRadius * (1 + FRAMING_MARGIN)
      : scene.radius * (1 + FRAMING_MARGIN);
  const offset = Vec3.setMagnitude(
    Vec3.zero(),
    ORBITAL_VIEW_OFFSET,
    canvas3d.camera.getTargetDistance(radius),
  );
  // An atomic orbital is centred on its nucleus at the origin, so the drawn
  // surface is symmetric about it even when the sampled box's sphere is not.
  const centre = orbitalRadius === undefined ? scene.center : Vec3.zero();
  canvas3d.camera.setState(
    {
      target: Vec3.clone(centre),
      position: Vec3.add(Vec3.zero(), centre, offset),
      up: Vec3.clone(ORBITAL_VIEW_UP),
      radius,
    },
    durationMs,
  );
}

/**
 * Turn the automatic spin on or off.
 * @param plugin - The molstar context.
 * @param spinning - Whether the scene should keep turning.
 * @param speed - Revolutions per minute-ish; molstar's own unit.
 */
export function setSpin(
  plugin: PluginContext,
  spinning: boolean,
  speed = DEFAULT_SPIN_SPEED,
): void {
  plugin.canvas3d?.setProps({
    trackball: {
      animate: spinning
        ? { name: 'spin', params: { speed, axis: Vec3.create(0, 1, 0) } }
        : { name: 'off', params: {} },
    },
  });
}
