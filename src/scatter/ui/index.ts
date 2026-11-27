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
export type { ScatterMarkLayerProps } from './ScatterMarkLayer.tsx';
export type { ScatterPixelMark } from './scatterMarkGlyph.tsx';
export { ScatterMarkLayer } from './ScatterMarkLayer.tsx';
export { ScatterMatrix } from './ScatterMatrix.tsx';
export { ScatterPlot } from './ScatterPlot.tsx';
export type {
  ScatterGroup,
  ScatterGroupProps,
  ScatterInteractionProps,
  ScatterPointOpen,
} from './scatterFigureProps.ts';
export type { ScatterPlotView } from './scatterPlotModel.ts';
export type { ScatterMarker, ScatterPlotProps } from './scatterPlotProps.ts';
export type { ScatterPointLayerProps } from './ScatterPointLayer.tsx';
export { ScatterPointLayer } from './ScatterPointLayer.tsx';
export type {
  LassoGesture,
  LassoGestureOptions,
  ScatterSurfaceProps,
  SurfaceEvent,
} from './lassoGesture.ts';
export type {
  ScatterMatrixAxis,
  ScatterMatrixProps,
} from './scatterMatrixProps.ts';
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
} from './scatterInteractionTypes.ts';
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
