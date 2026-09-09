/**
 * What a scatter plot has to work out before it can draw: which point the
 * pointer is nearest, which points a lasso caught, and the outline that holds
 * a given share of a group.
 *
 * The ellipse is the part worth reading twice. A group's outline is computed
 * in the data's own units and drawn in pixels, and because the two axes rarely
 * carry the same number of units per pixel, the rotation is not the same in
 * both — which is why the outline is projected rather than handed to an SVG
 * `<ellipse>` with a data-space angle.
 */

export type {
  ConfidenceEllipse,
  ConfidenceEllipseOptions,
  EllipseCovariance,
  EllipseCoverageSize,
  EllipsePoint,
  EllipseSize,
  EllipseStandardDeviationSize,
} from './confidenceEllipse.ts';
export {
  confidenceEllipse,
  ellipseAxes,
  ellipseStandardDeviations,
} from './confidenceEllipse.ts';
export {
  coverageForStandardDeviations,
  standardDeviationsForCoverage,
} from './ellipseCoverage.ts';
export type { PixelEllipse } from './ellipseProjection.ts';
export { ellipsePolygon, projectEllipse } from './ellipseProjection.ts';
export type { LassoPath } from './lassoPath.ts';
export {
  appendLassoPoint,
  createLassoPath,
  lassoPathData,
  resetLassoPath,
} from './lassoPath.ts';
export { pointInPolygon, pointsInPolygon, polygonBounds } from './polygon.ts';
export type { ScatterSelectionMode } from './scatterSelection.ts';
export {
  mergeScatterSelection,
  scatterSelectedIndices,
  scatterSelectionMask,
} from './scatterSelection.ts';
export type { PixelBounds, ScreenPoints } from './screenPoints.ts';
export { nearestPointIndex, pointsWithinBounds } from './screenPoints.ts';
