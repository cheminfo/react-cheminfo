/**
 * A parallel-coordinates figure the reader can interrogate: brush any axis to
 * keep an interval of it, rest on a line for what is known about that row, and
 * colour every line by whichever column answers the question being asked.
 *
 * Nothing here knows what the rows are. The same figure draws a library of
 * molecules, a set of experimental runs and a table of measurements, which is
 * why it is its own domain rather than part of the first viewer to want one.
 */

export { ParallelAxesLayer } from './ParallelAxesLayer.tsx';
export type { ParallelAxesLayerProps } from './ParallelAxesLayer.tsx';
export { ParallelCoordinates } from './ParallelCoordinates.tsx';
export type {
  ParallelCoordinatesProps,
  ParallelHover,
  ParallelInk,
} from './parallelCoordinatesProps.ts';
export type {
  ParallelInkBinding,
  ParallelInkValues,
  ParallelTokenInk,
} from './parallelInk.ts';
export {
  parallelInkFrom,
  readParallelInk,
  readParallelTokens,
  useParallelInk,
} from './parallelInk.ts';
export { ParallelLabels } from './ParallelLabels.tsx';
export type { ParallelLabelsProps } from './ParallelLabels.tsx';
export {
  parallelColorOf,
  parallelFigureLabel,
  parallelHighlightsOf,
  parallelIsBrushed,
  parallelRowCount,
} from './parallelPlotModel.ts';
export { ParallelTooltip } from './ParallelTooltip.tsx';
export type { ParallelTooltipProps } from './ParallelTooltip.tsx';
export type {
  ParallelCanvasOptions,
  ParallelCanvases,
} from './useParallelCanvas.ts';
export { useParallelCanvas } from './useParallelCanvas.ts';
export type {
  ParallelGesture,
  ParallelGestureOptions,
} from './useParallelGesture.ts';
export { useParallelGesture } from './useParallelGesture.ts';
