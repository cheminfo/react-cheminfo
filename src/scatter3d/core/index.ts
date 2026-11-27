/**
 * A cloud of samples in three dimensions: where the reader is standing, where
 * a sample lands on screen from there, and the shell that holds a group.
 *
 * It is the two-dimensional `scatter` domain with one axis more, and the extra
 * axis changes more than it looks. A shell is drawn as the silhouette the
 * camera sees of it, painted back to front, and the three axes have to share
 * one scale, because a solid seen from an angle has no tick labels to record
 * three different ones with.
 *
 * Nothing here knows what produced the coordinates, and nothing here draws:
 * every function is arithmetic over plain numbers, so the geometry can be
 * checked without a DOM.
 */

export type {
  ConfidenceEllipsoid,
  ConfidenceEllipsoidOptions,
} from './confidenceEllipsoid.ts';
export { confidenceEllipsoid } from './confidenceEllipsoid.ts';
export type { OrbitCamera, Vector3 } from './orbitCamera.ts';
export { DEFAULT_ORBIT_CAMERA } from './orbitCamera.ts';
export type { CloudGesture } from './cloudGesture.ts';
