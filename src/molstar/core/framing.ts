/**
 * Framing a scene: the sphere everything on screen fits in, the camera moved
 * to show it whole, and the zoom onto one point of it.
 *
 * What is on screen is measured rather than read off molstar: a canvas's own
 * `boundingSphereVisible` is read once when the canvas is built, a
 * ball-and-stick representation pads its sphere by the largest ball it could
 * ever draw, and an isosurface reports the whole sampled box. So a site hands
 * the spheres it measured itself, and names which render objects are worth
 * their own sphere — a mesh it built, whose sphere is exactly its vertices.
 */

import type { GraphicsRenderObject } from 'molstar/lib/mol-gl/render-object.js';
import { BoundaryHelper } from 'molstar/lib/mol-math/geometry/boundary-helper.js';
import { Sphere3D } from 'molstar/lib/mol-math/geometry.js';
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

import {
  DEFAULT_CAMERA_DURATION,
  FRAMING_MARGIN,
  MINIMUM_FRAMING_RADIUS,
  framedRadius,
} from './camera.ts';

/**
 * Frame everything on screen.
 *
 * Without an orientation the camera keeps the direction it already points in,
 * which is what a reframe after a reader turned the scene must do. A scene with
 * nothing measured is framed by molstar's own reset.
 * @param plugin - The molstar context.
 * @param options - What to frame, from where, and how fast.
 */
export function resetCamera(
  plugin: PluginContext,
  options: ResetCameraOptions = {},
): void {
  const { durationMs = DEFAULT_CAMERA_DURATION, margin = FRAMING_MARGIN } =
    options;
  const { sphere, orientation } = options;
  plugin.canvas3d?.commit(true);
  const scene = sphere === undefined ? sceneSphere(plugin, options) : sphere;
  if (scene === null || scene.radius <= 0) {
    plugin.managers.camera.reset(undefined, durationMs);
    return;
  }
  const { center, radius } = scene;
  const [x = 0, y = 0, z = 0] = center;
  focusPoint(plugin, [x, y, z], framedRadius(radius, margin), {
    durationMs,
    orientation,
  });
}

/**
 * Frame one ball of the scene: an atom picked, the centre of a bond, the
 * whole scene.
 *
 * The canvas is committed first — `add()` only queues, and a queued object
 * belongs to no bounding sphere yet — and the ball is framed with no padding
 * of molstar's own, whose 4 Å default leaves water a twentieth of the canvas.
 * @param plugin - The molstar context.
 * @param centre - What to frame, Cartesian ångström.
 * @param radius - Radius of the ball to fit, ångström.
 * @param options - From where, and how fast.
 */
export function focusPoint(
  plugin: PluginContext,
  centre: Point3,
  radius: number,
  options: FocusOptions = {},
): void {
  const { durationMs = DEFAULT_CAMERA_DURATION, orientation } = options;
  plugin.canvas3d?.commit(true);
  const target = Vec3.create(centre[0], centre[1], centre[2]);
  const camera = plugin.canvas3d?.camera;
  if (orientation !== undefined && camera !== undefined) {
    // `getFocus` only matches the sign of a direction against the current
    // camera; `getInvariantFocus` takes the direction and the up as given.
    const { eye, up } = orientation;
    plugin.managers.camera.setSnapshot(
      camera.getInvariantFocus(
        target,
        Math.max(radius, MINIMUM_FRAMING_RADIUS),
        Vec3.create(up[0], up[1], up[2]),
        Vec3.create(-eye[0], -eye[1], -eye[2]),
      ),
      durationMs,
    );
    return;
  }
  plugin.managers.camera.focusSphere(Sphere3D.create(target, radius), {
    extraRadius: 0,
    minRadius: MINIMUM_FRAMING_RADIUS,
    durationMs,
  });
}

/**
 * The one sphere everything worth framing fits in: the spheres a site
 * measured itself, and those of the render objects it names.
 * @param plugin - The molstar context.
 * @param options - The measured spheres, and which render objects count.
 * @returns The sphere, or `null` when nothing was measured.
 */
export function sceneSphere(
  plugin: PluginContext,
  options: SceneSphereOptions = {},
): Sphere3D | null {
  const spheres: Sphere3D[] = [];
  for (const sphere of options.spheres ?? []) {
    if (sphere.radius > 0) spheres.push(sphere);
  }
  const { include } = options;
  const canvas3d = plugin.canvas3d;
  if (include !== undefined && canvas3d !== undefined) {
    canvas3d.commit(true);
    for (const object of canvas3d.getRenderObjects()) {
      if (!include(object)) continue;
      const sphere = object.values.boundingSphere.ref.value;
      if (sphere.radius > 0) spheres.push(sphere);
    }
  }
  return unionSphere(spheres);
}

/**
 * The smallest sphere holding a set of spheres, as molstar's own camera
 * manager computes it.
 * @param spheres - The spheres to hold.
 * @returns It, the one sphere itself when there is one, `null` when there is none.
 */
export function unionSphere(spheres: readonly Sphere3D[]): Sphere3D | null {
  const first = spheres[0];
  if (first === undefined) return null;
  if (spheres.length === 1) return first;
  boundary.reset();
  for (const sphere of spheres) boundary.includeSphere(sphere);
  boundary.finishedIncludeStep();
  for (const sphere of spheres) boundary.radiusSphere(sphere);
  return boundary.getSphere();
}

/** A point in Cartesian ångström. */
export type Point3 = readonly [x: number, y: number, z: number];

/** Where the camera stands to look at a scene. */
export interface ViewOrientation {
  /** The direction from what is looked at to the eye. */
  eye: Point3;
  /** The direction that is up on screen. */
  up: Point3;
}

/** How {@link focusPoint} moves the camera. */
export interface FocusOptions {
  /**
   * Transition length, in milliseconds; 0 jumps.
   * @default 250
   */
  durationMs?: number;
  /**
   * Where to look from.
   * @default undefined — the direction the camera already points in
   */
  orientation?: ViewOrientation;
}

/** What {@link sceneSphere} measures. */
export interface SceneSphereOptions {
  /**
   * Spheres the site measured itself: a model from its own atoms, a part of
   * the scene registered as it was drawn.
   * @default []
   */
  spheres?: readonly Sphere3D[];
  /**
   * Which render objects of the canvas count with their own sphere.
   * @default undefined — none does
   */
  include?: (object: GraphicsRenderObject) => boolean;
}

/** What {@link resetCamera} frames, and how. */
export interface ResetCameraOptions extends SceneSphereOptions, FocusOptions {
  /**
   * The sphere to frame, measured by the caller, instead of the scene's.
   * @default undefined — the sphere `sceneSphere` measures
   */
  sphere?: Sphere3D | null;
  /**
   * Fraction of the radius kept as breathing room around the scene.
   * @default 0.08
   */
  margin?: number;
}

// Reused across calls, as molstar's own camera manager does.
const boundary = new BoundaryHelper('98');
