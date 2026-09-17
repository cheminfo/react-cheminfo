/**
 * What a parallel-coordinates figure has to work out before it can draw: where
 * each axis stands, how a value on it becomes a pixel, which row the pointer
 * is over, which rows the brushes keep, and the canvas pass that paints them.
 *
 * The brush is the part worth reading twice. It is a pure function of a press
 * and a pointer rather than a behaviour attached to an element, so every one
 * of its four gestures — create, move, resize from either edge, clear — is
 * covered by tests in a runtime with no DOM, and the figure stays declarative.
 */

export type { ParallelAxisLayout, ParallelAxisPixels } from './parallelAxes.ts';
export {
  PARALLEL_MARGIN,
  parallelAxisLayouts,
  parallelAxisPixels,
  parallelPixelAt,
  parallelValueToY,
  parallelYToValue,
} from './parallelAxes.ts';
export type {
  ParallelBand,
  ParallelBrushDrag,
  ParallelBrushGrip,
  ParallelBrushTarget,
} from './parallelBrush.ts';
export {
  PARALLEL_BRUSH_HALF_WIDTH,
  PARALLEL_BRUSH_HANDLE_REACH,
  PARALLEL_BRUSH_SMALLEST,
  parallelBandAt,
  parallelBandOf,
  parallelBrushGrip,
  parallelBrushTarget,
  parallelIsBand,
  parallelRangeOf,
} from './parallelBrush.ts';
export type { ParallelExtent } from './parallelExtent.ts';
export {
  PARALLEL_DEGENERATE_PADDING,
  parallelExtent,
} from './parallelExtent.ts';
export {
  parallelIncludedMask,
  parallelKeptCount,
  parallelRangeKeeps,
  parallelSelectionKeeps,
} from './parallelFilter.ts';
export type { ParallelPoint, ParallelSegment } from './parallelHit.ts';
export {
  PARALLEL_HOVER_TOLERANCE,
  parallelNearestRow,
  parallelSegmentAt,
} from './parallelHit.ts';
export {
  parallelAxisOrder,
  parallelDropIndex,
  parallelMoveAxis,
} from './parallelOrder.ts';
export type {
  ParallelHighlight,
  ParallelHighlightPaint,
  ParallelPaint,
} from './parallelPaint.ts';
export {
  PARALLEL_INCLUDED_ALPHA,
  paintParallelHighlights,
  paintParallelLines,
  preparePlotCanvas,
  traceParallelRow,
} from './parallelPaint.ts';
export {
  PARALLEL_PALETTE_STEPS,
  PARALLEL_PALETTE_UNKNOWN,
  parallelColorSteps,
  parallelPalette,
} from './parallelPalette.ts';
export {
  parallelHasRange,
  parallelMergeRanges,
  parallelRangeList,
  parallelWriteRange,
} from './parallelSelection.ts';
export type { ParallelGraduation } from './parallelTicks.ts';
export { PARALLEL_TICK_COUNT, parallelTicks } from './parallelTicks.ts';
export type {
  ParallelAxis,
  ParallelAxisScale,
  ParallelAxisSource,
  ParallelColorBy,
  ParallelRange,
  ParallelRanges,
  ParallelSelection,
  ParallelTick,
} from './parallelTypes.ts';
export { parallelAxisOf } from './parallelTypes.ts';
