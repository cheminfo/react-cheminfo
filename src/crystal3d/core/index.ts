/**
 * The half of the crystal viewer that has never heard of molstar.
 *
 * A page that only *builds* a scene — repeats a cell, cuts a plane through it,
 * names the atoms of its supercell — imports this and pays nothing: the molstar
 * chunk hangs off `viewer/`, which is reached through the lazy canvas and
 * nowhere else. How the viewer draws and frames a scene stays inside it.
 */

export type { CellSegment } from './cellClip.ts';
export { cellSection, clipLineToCell } from './cellClip.ts';
export type { CellEdge } from './cellGeometry.ts';
export { cellAxes, cellEdges } from './cellGeometry.ts';
export type { PlaneFrame } from './frame.ts';
export { perpendicularTo, planeFrame } from './frame.ts';
export { ELEMENT_COLOURS } from './palette.ts';
export type { ElementStyle } from './primitives.ts';
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
export { SUPERCELL_ATOM_CAP, largestRepeatThatFits } from './cellStack.ts';
export type {
  CrystalBonds,
  CrystalPacking,
  CrystalView,
  CrystalViewOptions,
  CrystalViewSettings,
} from './crystalView.ts';
export {
  CELL_COUNT_RANGE,
  CRYSTAL_BONDS,
  CRYSTAL_PACKINGS,
  DEFAULT_CRYSTAL_VIEW_SETTINGS,
  crystalView,
} from './crystalView.ts';
