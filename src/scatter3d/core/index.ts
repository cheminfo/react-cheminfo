/**
 * A cloud of samples in three dimensions: where the reader is standing, where
 * a sample lands on screen from there, and the shell that holds a group.
 *
 * It is the two-dimensional `scatter` domain with one axis more, and the extra
 * axis changes more than it looks. Nothing can be handed to an SVG shape any
 * more — a shell has to be cut into faces, projected, and painted back to
 * front — and the three axes have to share one scale, because a solid seen
 * from an angle has no tick labels to record three different ones with.
 *
 * Nothing here knows what produced the coordinates, and nothing here draws:
 * every function is arithmetic over plain numbers, so the geometry can be
 * checked without a DOM.
 */

export type {
  ConfidenceEllipsoid,
  ConfidenceEllipsoidOptions,
} from './confidenceEllipsoid.ts';
export {
  confidenceEllipsoid,
  ellipsoidStandardDeviations,
} from './confidenceEllipsoid.ts';
export type { CubeArm } from './cubeFrame.ts';
export { CUBE_ARMS, CUBE_ORIGIN, cubeEdges } from './cubeFrame.ts';
export {
  coverageForStandardDeviations3,
  standardDeviationsForCoverage3,
} from './ellipsoidCoverage.ts';
export type { EllipsoidSilhouette } from './ellipsoidSilhouette.ts';
export { ellipsoidSilhouette } from './ellipsoidSilhouette.ts';
export type {
  OrbitCamera,
  OrbitViewport,
  ProjectedPoint,
  Vector3,
} from './orbitCamera.ts';
export {
  CUBE_HALF_DIAGONAL,
  DEFAULT_ORBIT_CAMERA,
  ORBIT_PITCH_LIMIT,
  ORBIT_RADIANS_PER_PIXEL,
  depthFraction,
  orbitByDrag,
  projectPoint,
  rotatePoint,
} from './orbitCamera.ts';
export type { CloudGesture } from './cloudGesture.ts';
export type { CubePointsOptions } from './cubePoints.ts';
export { cubePoints } from './cubePoints.ts';
export type { SymmetricEigen3, SymmetricMatrix3 } from './symmetricEigen.ts';
export { symmetricEigen3 } from './symmetricEigen.ts';
