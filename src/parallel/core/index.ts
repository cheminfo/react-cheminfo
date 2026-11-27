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
export { PARALLEL_MARGIN, parallelAxisLayouts } from './parallelAxes.ts';
export type {
  ParallelBand,
  ParallelBrushDrag,
  ParallelBrushGrip,
} from './parallelBrush.ts';
export { parallelBandAt, parallelRangeOf } from './parallelBrush.ts';
export { parallelIncludedMask, parallelKeptCount } from './parallelFilter.ts';
export type { ParallelPoint, ParallelSegment } from './parallelHit.ts';
export { parallelNearestRow, parallelSegmentAt } from './parallelHit.ts';
export type { ParallelPaint } from './parallelPaint.ts';
export { paintParallelLines, preparePlotCanvas } from './parallelPaint.ts';
export { parallelColorSteps, parallelPalette } from './parallelPalette.ts';
export { parallelHasRange } from './parallelSelection.ts';
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
