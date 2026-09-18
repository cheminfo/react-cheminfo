/**
 * Where the camera stands, in a form a link can carry.
 *
 * A position in ångström would not survive the trip: the molecule a link names
 * is built again on the other side, and a distance that frames a benzene leaves
 * a peptide off screen. So the camera is stored against the scene rather than
 * against the coordinates — a rotation from the front view, a zoom against the
 * distance that frames the whole model, and a target as an offset from the
 * scene centre in bounding-sphere radii. All three read the same whatever the
 * molecule and whatever the size of the canvas showing it.
 */

import { clamp } from '../../format/core/clamp.ts';
import { roundTo } from '../../format/core/roundTo.ts';
// Deep import on purpose: the codec is the one way a link carries a camera, and
// `share/core` knows nothing of molecules, so nothing is pulled in by it.
import type { ShareParamCodec } from '../../share/core/params.ts';

/** A rotation, as a unit quaternion `[x, y, z, w]`. */
export type Molecule3DRotation = readonly [number, number, number, number];

/** A point or a direction, `[x, y, z]`. */
export type Molecule3DVector = readonly [number, number, number];

/** Where the camera stands, against the scene rather than its coordinates. */
export interface Molecule3DCamera {
  /**
   * Rotation of the camera from the front view — looking down -z with y up —
   * as a unit quaternion.
   */
  rotation: Molecule3DRotation;
  /**
   * How close the camera is. `1` frames the whole model, as the reset button
   * does; `2` is twice as close, so the model is drawn twice as large.
   */
  zoom: number;
  /**
   * Where the camera looks, as an offset from the centre of the model, in
   * bounding-sphere radii. `[0, 0, 0]` looks at the centre.
   */
  offset: Molecule3DVector;
}

/** Looking at the centre of the model from the front, framing all of it. */
export const DEFAULT_MOLECULE_3D_CAMERA: Molecule3DCamera = {
  rotation: [0, 0, 0, 1],
  zoom: 1,
  offset: [0, 0, 0],
};

/** The closest and furthest a link may ask the camera to stand. */
export const MOLECULE_3D_ZOOM_RANGE = { minimum: 0.01, maximum: 100 } as const;

/** Furthest a link may push the target from the centre, in radii. */
const MAX_OFFSET = 100;

/** Decimals kept of a quaternion component: 0.0001 is under a hundredth of a degree. */
const ROTATION_DECIMALS = 4;

/** Decimals kept of the zoom and of the target offset. */
const POSITION_DECIMALS = 3;

/**
 * Write a camera as the text a link carries.
 *
 * The four components of the rotation come first, then the zoom, then the
 * target offset — which is left out entirely while the camera looks at the
 * centre of the model, as it does until someone pans.
 * @param camera - The camera to write.
 * @returns Comma-separated numbers: five, or eight when the camera is panned.
 */
export function formatMolecule3DCamera(camera: Molecule3DCamera): string {
  const { rotation, zoom, offset } = normalizeMolecule3DCamera(camera);
  const parts: string[] = [];
  for (let index = 0; index < 4; index++) {
    parts.push(String(roundTo(rotation[index] ?? 0, ROTATION_DECIMALS)));
  }
  parts.push(String(roundTo(zoom, POSITION_DECIMALS)));
  if (offset[0] !== 0 || offset[1] !== 0 || offset[2] !== 0) {
    for (const value of offset) {
      parts.push(String(roundTo(value, POSITION_DECIMALS)));
    }
  }
  return parts.join(',');
}

/**
 * Read a camera out of the text a link carries.
 *
 * A rotation that is not a rotation — four zeros, a stray word — is what makes
 * the whole value unusable; everything else is brought back into range rather
 * than rejected, so a link written against an older range still opens.
 * @param raw - The text of the parameter.
 * @returns The camera, or `null` when the text does not describe one.
 */
export function parseMolecule3DCamera(raw: string): Molecule3DCamera | null {
  const parts = raw.split(',');
  if (parts.length !== 5 && parts.length !== 8) return null;
  const numbers: number[] = [];
  for (const part of parts) {
    const value = Number(part.trim());
    if (!Number.isFinite(value)) return null;
    numbers.push(value);
  }
  const rotation = normalizeRotation([
    numbers[0] ?? 0,
    numbers[1] ?? 0,
    numbers[2] ?? 0,
    numbers[3] ?? 1,
  ]);
  if (rotation === null) return null;
  return {
    rotation,
    zoom: clampZoom(numbers[4] ?? 1),
    offset: [
      clampOffset(numbers[5] ?? 0),
      clampOffset(numbers[6] ?? 0),
      clampOffset(numbers[7] ?? 0),
    ],
  };
}

/**
 * A camera with its rotation made a unit quaternion and its numbers in range.
 * @param camera - The camera to repair.
 * @returns A camera safe to hand the viewer; the default when the rotation is
 * degenerate.
 */
export function normalizeMolecule3DCamera(
  camera: Molecule3DCamera,
): Molecule3DCamera {
  const rotation = normalizeRotation(camera.rotation);
  if (rotation === null) return DEFAULT_MOLECULE_3D_CAMERA;
  return {
    rotation,
    zoom: clampZoom(camera.zoom),
    offset: [
      clampOffset(camera.offset[0]),
      clampOffset(camera.offset[1]),
      clampOffset(camera.offset[2]),
    ],
  };
}

/**
 * Whether two cameras are the same once written into a link.
 *
 * What a link carries is rounded, so two cameras a drag apart by less than the
 * rounding are one camera as far as the address is concerned — which is what
 * keeps a settling animation from rewriting it a dozen times.
 * @param first - One camera, or `null` for none.
 * @param second - The other.
 * @returns True when a link would carry the same text for both.
 */
export function sameMolecule3DCamera(
  first: Molecule3DCamera | null,
  second: Molecule3DCamera | null,
): boolean {
  if (first === null || second === null) return first === second;
  return formatMolecule3DCamera(first) === formatMolecule3DCamera(second);
}

/**
 * The codec a site mirrors the camera in the address with.
 *
 * The default framing is written as nothing at all, so the address of a page
 * nobody has turned yet stays a plain link.
 * @returns The codec, whose value is `null` while the camera is where a reset
 * would leave it.
 */
export function molecule3DCameraParam(): ShareParamCodec<Molecule3DCamera | null> {
  return {
    parse(raw) {
      return raw === null ? null : parseMolecule3DCamera(raw);
    },
    serialize(value) {
      if (value === null) return null;
      const text = formatMolecule3DCamera(value);
      return text === formatMolecule3DCamera(DEFAULT_MOLECULE_3D_CAMERA)
        ? null
        : text;
    },
  };
}

function normalizeRotation(
  rotation: Molecule3DRotation,
): Molecule3DRotation | null {
  let squared = 0;
  for (let index = 0; index < 4; index++) {
    const value = rotation[index] ?? 0;
    if (!Number.isFinite(value)) return null;
    squared += value * value;
  }
  if (squared <= 0) return null;
  const scale = 1 / Math.sqrt(squared);
  return [
    rotation[0] * scale,
    rotation[1] * scale,
    rotation[2] * scale,
    rotation[3] * scale,
  ];
}

function clampZoom(zoom: number): number {
  const { minimum, maximum } = MOLECULE_3D_ZOOM_RANGE;
  return clamp(zoom, minimum, maximum, 1);
}

function clampOffset(value: number): number {
  return clamp(value, -MAX_OFFSET, MAX_OFFSET, 0);
}
