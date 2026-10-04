/**
 * The two directions between molstar's camera and the camera a shared link
 * carries.
 *
 * A link stores the camera against what is drawn rather than against ångström —
 * a rotation from the front view, a zoom against the distance that frames the
 * scene, and a target offset in its own radii — so a view opens the same on any
 * screen. Which sphere is the yardstick is the caller's to decide: a site whose
 * scene grows after the model arrives measures against the model alone, or one
 * view would read as two zooms.
 */

import { Quat, Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';

import type { Molecule3DCamera } from '../../molecule3d/core/camera.ts';
import { normalizeMolecule3DCamera } from '../../molecule3d/core/camera.ts';

/** Where the camera is and where it looks, in world coordinates. */
export interface CameraPose {
  position: Vec3;
  target: Vec3;
  up: Vec3;
}

/** The sphere a stored camera is measured against. */
export interface CameraReference {
  center: Vec3;
  /** Radius, ångström, framing margin included. */
  radius: number;
}

/** How small an offset, in radii, is written as none at all. */
export interface PoseOptions {
  /**
   * Target offsets below this, in radii, are read as zero. The framing centres
   * on the scene a hair off the atoms' own centre, and that hair would
   * otherwise be written into every link as `,0,0,0`.
   * @default 0
   */
  snapOffset?: number;
}

/** The camera's own axes, which a stored rotation turns into world ones. */
const CAMERA_UP = Vec3.create(0, 1, 0);
const CAMERA_BACK = Vec3.create(0, 0, 1);

/**
 * Measure a pose against what is drawn.
 * @param pose - Where the camera is.
 * @param reference - The sphere to measure against.
 * @param framingDistance - How far from the target the camera stands to frame
 * the reference sphere; the length `zoom: 1` means.
 * @param options - See {@link PoseOptions}.
 * @returns The camera, or `null` for a degenerate pose.
 */
export function poseToCamera(
  pose: CameraPose,
  reference: CameraReference,
  framingDistance: number,
  options: PoseOptions = {},
): Molecule3DCamera | null {
  const { snapOffset = 0 } = options;
  const { position, target, up } = pose;
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
  const offset = Vec3.sub(Vec3.zero(), target, reference.center);
  Vec3.scale(offset, offset, 1 / reference.radius);
  return normalizeMolecule3DCamera({
    rotation: [
      rotation[0] ?? 0,
      rotation[1] ?? 0,
      rotation[2] ?? 0,
      rotation[3] ?? 1,
    ],
    zoom: framingDistance / distance,
    offset: [
      snap(offset[0], snapOffset),
      snap(offset[1], snapOffset),
      snap(offset[2], snapOffset),
    ],
  });
}

/**
 * The pose a stored camera stands at: {@link poseToCamera} the other way round.
 * @param camera - The stored camera.
 * @param reference - The sphere it was measured against.
 * @param framingDistance - See {@link poseToCamera}.
 * @returns The pose.
 */
export function cameraToPose(
  camera: Molecule3DCamera,
  reference: CameraReference,
  framingDistance: number,
): CameraPose {
  const { rotation, zoom, offset } = normalizeMolecule3DCamera(camera);
  const turn = Quat.create(rotation[0], rotation[1], rotation[2], rotation[3]);
  const up = Vec3.transformQuat(Vec3.zero(), CAMERA_UP, turn);
  const back = Vec3.transformQuat(Vec3.zero(), CAMERA_BACK, turn);
  const shift = Vec3.create(offset[0], offset[1], offset[2]);
  const target = Vec3.scaleAndAdd(
    Vec3.zero(),
    reference.center,
    shift,
    reference.radius,
  );
  const position = Vec3.scaleAndAdd(
    Vec3.zero(),
    target,
    back,
    framingDistance / zoom,
  );
  return { position, target, up };
}

function snap(value: number | undefined, threshold: number): number {
  return value === undefined || Math.abs(value) < threshold ? 0 : value;
}
