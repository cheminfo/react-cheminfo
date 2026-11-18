/**
 * The half of the crystal viewer that has never heard of molstar.
 *
 * A page that only *builds* a scene — repeats a cell, works out which symmetry
 * elements to draw, frames what it has — imports this and pays nothing: the
 * molstar chunk hangs off `viewer/`, which is reached through the lazy canvas
 * and nowhere else.
 */

export type { CellSegment } from './cellClip.ts';
export { cellSection, clipLineToCell } from './cellClip.ts';
export type { CellEdge } from './cellGeometry.ts';
export {
  cellAxes,
  cellAxisLabelPoints,
  cellEdges,
  cellPoint,
  clampRepeat,
  latticeShifts,
} from './cellGeometry.ts';
export { mergeDrawings, sameDrawings, withoutDrawings } from './drawingSet.ts';
export type { ElementGroup } from './elementDrawing.ts';
export { drawingPrimitives, elementGroups } from './elementDrawing.ts';
export { drawingLabels } from './elementLabels.ts';
export { plainName } from './labelText.ts';
export type { PlaneFrame } from './frame.ts';
export { perpendicularTo, planeFrame } from './frame.ts';
export type { SceneSphere } from './framing.ts';
export { boundingSphereOf, primitivesExtent, unionSpheres } from './framing.ts';
export type { OrientedScene, ViewOrientation } from './orientation.ts';
export {
  principalAxisOf,
  sceneOrientation,
  threeQuarterView,
} from './orientation.ts';
export type { Matrix4 } from './operationMatrix.ts';
export {
  IDENTITY_MATRIX4,
  ROTATION_PHASE,
  operationAt,
  operationIsRigid,
  operationMatrix,
} from './operationMatrix.ts';
export {
  CELL_COLOUR,
  ELEMENT_COLOURS,
  LABEL_COLOUR,
  drawingColour,
} from './palette.ts';
export type {
  ElementStyle,
  MeshPrimitive,
  ResolvedElementStyle,
  TextItem,
} from './primitives.ts';
export {
  DEFAULT_ELEMENT_STYLE,
  primitivePoints,
  resolveElementStyle,
} from './primitives.ts';
export { toXyzText } from './structureText.ts';
export { supercellAtoms } from './supercell.ts';
export type {
  CellRepeat,
  DrawingBase,
  GlideDrawing,
  InversionDrawing,
  MirrorDrawing,
  Point3,
  RotationDrawing,
  RotoinversionDrawing,
  ScrewDrawing,
  SymmetryDrawing,
  SymmetryDrawingKind,
  UnitCell,
  ViewerAtom,
  ViewerOperation,
} from './types.ts';

export type { Mat3 } from './mat3.ts';
export {
  IDENTITY_MATRIX,
  INVERSION_MATRIX,
  applyMatrix,
  matrixDeterminant,
  matrixDistance,
  matrixTrace,
  multiplyMatrices,
  reflectionMatrix,
  rotationMatrix,
  scaleMatrix,
  transposeMatrix,
} from './mat3.ts';
export type { Vec3 } from './vec3.ts';
export {
  addVectors,
  collinear,
  crossProduct,
  dotProduct,
  normalizeVector,
  sameAxis,
  scaleVector,
  subtractVectors,
  vectorDistance,
  vectorNorm,
} from './vec3.ts';
export {
  normalToCartesian,
  normalToFractional,
  toCartesian,
  toFractional,
} from './latticeBasis.ts';
export { axisRod, faceOf } from './elementExtent.ts';
export type { AxisRod } from './elementExtent.ts';
export {
  SUPERCELL_ATOM_CAP,
  largestRepeatThatFits,
  repeatCell,
  repeatedAtomCount,
} from './cellStack.ts';
export type {
  CrystalPacking,
  CrystalView,
  CrystalViewOptions,
  CrystalViewSettings,
} from './crystalView.ts';
export {
  CELL_COUNT_RANGE,
  CRYSTAL_PACKINGS,
  DEFAULT_CRYSTAL_VIEW_SETTINGS,
  crystalView,
} from './crystalView.ts';
