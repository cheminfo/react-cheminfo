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
      ...radiusMaxOf(canvas3d),
    },
    durationMs,
  );
}

/**
 * Keep the view the student has set, and rescale it for an orbital of a
 * different extent.
 *
 * Every atomic orbital is drawn at one canonical size, so the two extents are
 * normally equal and the camera does not move at all: clicking through a shell
 * keeps the rotation and the zoom instead of throwing them away. When they do
 * differ, the offset from the target and the radius are multiplied by the same
 * factor, which keeps the zoom *relative* to the orbital.
 * @param plugin - The molstar context.
 * @param previousRadius - Extent the camera is currently fitted to.
 * @param orbitalRadius - Extent to fit now.
 * @param durationMs - Transition length. Pass 0 for an instant jump.
 */
export function refitOrbital(
  plugin: PluginContext,
  previousRadius: number,
  orbitalRadius: number,
  durationMs = DEFAULT_CAMERA_DURATION,
): void {
  const canvas3d = plugin.canvas3d;
  if (canvas3d === undefined) return;
  const scale = orbitalRadius / previousRadius;
  if (!Number.isFinite(scale) || scale <= 0) {
    frameOrbital(plugin, orbitalRadius, durationMs);
    return;
  }
  // The box a sampled orbital lives in changes with the orbital, and molstar
  // only tracks that for a camera it also reframes, which this one is not.
  const radiusMax = radiusMaxOf(canvas3d);
  if (scale === 1) {
    canvas3d.camera.setState(radiusMax, 0);
    return;
  }
  const { target, position, radius } = canvas3d.camera.state;
  const offset = Vec3.sub(Vec3.zero(), position, target);
  Vec3.scale(offset, offset, scale);
  canvas3d.camera.setState(
    {
      position: Vec3.add(Vec3.zero(), target, offset),
      radius: radius * scale,
      ...radiusMax,
    },
    durationMs,
  );
}

/**
 * The far plane's share of a camera state, left out when the scene cannot be
 * measured yet.
 * @param canvas3d - The canvas whose scene to measure.
 * @returns `{ radiusMax }`, or an empty object to keep the camera's own value.
 */
function radiusMaxOf(canvas3d: PluginContext['canvas3d'] & object): {
  radiusMax?: number;
} {
  const radiusMax = sceneRadius(canvas3d);
  return radiusMax > 0 ? { radiusMax } : {};
}

/**
 * How far the whole scene reaches, as molstar measures it for its near and far
 * planes.
 *
 * `boundingSphere` covers the whole scene but is only recomputed on a draw, so
 * in the moment after a representation was added it still reads 0 — and a zero
 * `radiusMax` collapses the near and far planes onto the target, leaving the
 * orbital sliced into a few thin arcs. The visible sphere is current there, so
 * it stands in.
 * @param canvas3d - The canvas whose scene to measure.
 * @returns The radius, in scene units; 0 when neither sphere is ready.
 */
function sceneRadius(canvas3d: PluginContext['canvas3d'] & object): number {
  const radius =
    canvas3d.boundingSphere.radius > 0
      ? canvas3d.boundingSphere.radius
      : canvas3d.boundingSphereVisible.radius;
  return radius * canvas3d.props.sceneRadiusFactor;
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
