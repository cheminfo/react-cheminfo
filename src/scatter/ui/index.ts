/**
 * A scatter plot the reader can interrogate: a lasso to select a crowd, a card
 * on the point under the pointer, an outline per group, and the grid of every
 * pair of axes.
 *
 * Nothing here knows what produced the coordinates. The same plot draws a
 * principal component map, a UMAP embedding and a k-means run with its
 * centroids, which is why it is its own domain rather than part of the viewer
 * that happens to use it first.
 */

export type { ScatterEllipseLayerProps } from './ScatterEllipseLayer.tsx';
export { ScatterEllipseLayer } from './ScatterEllipseLayer.tsx';
export type { ScatterLabelLayerProps } from './ScatterLabelLayer.tsx';
export { ScatterLabelLayer } from './ScatterLabelLayer.tsx';
export type {
  ScatterMarkLayerProps,
  ScatterPixelMark,
} from './ScatterMarkLayer.tsx';
export { ScatterMarkLayer } from './ScatterMarkLayer.tsx';
export { ScatterMatrix } from './ScatterMatrix.tsx';
export type { ScatterMatrixCellProps } from './ScatterMatrixCell.tsx';
export { ScatterMatrixCell } from './ScatterMatrixCell.tsx';
export type {
  ScatterMatrixDiagonalProps,
  ScatterMatrixGrid,
} from './ScatterMatrixDiagonal.tsx';
export { ScatterMatrixDiagonal } from './ScatterMatrixDiagonal.tsx';
export type {
  ScatterGroup,
  ScatterMarker,
  ScatterPlotProps,
} from './ScatterPlot.tsx';
export { ScatterPlot } from './ScatterPlot.tsx';
export type { ScatterPointLayerProps } from './ScatterPointLayer.tsx';
export { ScatterPointLayer } from './ScatterPointLayer.tsx';
export type {
  FrameSlot,
  GestureModifiers,
  LassoGesture,
  LassoGestureOptions,
  ScatterSurfaceProps,
} from './lassoGesture.ts';
export {
  DEFAULT_LASSO_MIN_DISTANCE,
  MINIMUM_RING_VERTICES,
  capturePointer,
  dropFrame,
  modifierMode,
  scheduleFrame,
  surfacePosition,
} from './lassoGesture.ts';
export type {
  ScatterGroupSpread,
  ScatterGroupSpreadOptions,
} from './scatterGroupSpread.ts';
export type { LabelBox } from './scatterLabelBoxes.ts';
export {
  LabelBoxField,
  SCATTER_GROUP_LABEL_SIZE,
  SCATTER_LABEL_SIZE,
  labelBoxHeight,
  labelBoxWidth,
  labelBoxesOverlap,
} from './scatterLabelBoxes.ts';
export type { ScatterLabelInk, ScatterPixelLabel } from './scatterLabels.ts';
export { scatterGroupLabels, scatterPointLabels } from './scatterLabels.ts';
export type {
  PlacedScatterLabel,
  ScatterLabelPlacementOptions,
} from './scatterLabelPlacement.ts';
export { placeScatterLabels } from './scatterLabelPlacement.ts';
export {
  scatterGroupSpread,
  scatterPairEllipse,
} from './scatterGroupSpread.ts';
export { scatterMatrixDots } from './scatterMatrixDots.tsx';
export {
  SCATTER_MATRIX_GAP,
  SCATTER_MATRIX_MARGINS,
  SCATTER_MATRIX_MOST_AXES,
  SCATTER_MATRIX_ROOM,
  SCATTER_MATRIX_SMALLEST_OUTLINE,
  SCATTER_MATRIX_SMALLEST_PLOT,
  scatterMatrixAxesThatFit,
  scatterMatrixPlotSide,
  scatterMatrixTickCount,
} from './scatterMatrixLayout.ts';
export { scatterMatrixOutlines } from './scatterMatrixOutlines.tsx';
export type {
  ScatterMatrixAxis,
  ScatterMatrixProps,
} from './scatterMatrixProps.ts';
export type { ScatterOutlineInk } from './scatterOutlineShape.tsx';
export {
  SCATTER_OUTLINE_FILL_OPACITY,
  scatterOutlineShape,
} from './scatterOutlineShape.tsx';
export { useLassoGesture } from './useLassoGesture.ts';
export type {
  HoverAnchor,
  PointHoverApi,
  PointHoverOptions,
} from './usePointHover.ts';
export { DEFAULT_HOVER_RADIUS, usePointHover } from './usePointHover.ts';
export type { ScatterFrame, ScatterFrameOptions } from './useScatterFrame.ts';
export { useScatterFrame } from './useScatterFrame.ts';
export type {
  ScatterInteractionApi,
  ScatterInteractionOptions,
} from './useScatterInteraction.ts';
export { useScatterInteraction } from './useScatterInteraction.ts';
export type {
  ScatterKeyboardApi,
  ScatterKeyboardOptions,
} from './useScatterKeyboard.ts';
export { useScatterKeyboard } from './useScatterKeyboard.ts';
export type {
  ScatterSelectionApi,
  ScatterSelectionOptions,
  SelectionChange,
} from './useScatterSelection.ts';
export { useScatterSelection } from './useScatterSelection.ts';
