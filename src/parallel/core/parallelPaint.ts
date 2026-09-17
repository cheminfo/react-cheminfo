/**
 * The lines, painted into a canvas.
 *
 * The first canvas figure in the family, and for one reason: ten thousand
 * polylines of a dozen points each is a hundred and twenty thousand SVG
 * coordinates the browser would keep as elements. Everything a reader points
 * at, brushes or reads is still SVG or HTML over the top, so only the mass of
 * lines is pixels — which is also why saving the figure keeps the axes and
 * loses the lines, and why a site that needs a downloadable figure should say
 * so before choosing this one.
 */

import type { ParallelAxisLayout } from './parallelAxes.ts';
import { PARALLEL_MARGIN, parallelPixelAt } from './parallelAxes.ts';

/** How strongly one kept line is drawn, so that the mass reads as a density. */
export const PARALLEL_INCLUDED_ALPHA = 0.35;

/** How wide a singled-out line's halo is, in pixels. */
const HALO_WIDTH = 5;

/** How wide a singled-out line itself is. */
const HIGHLIGHT_WIDTH = 2;

/** How large the dot at each of its axis crossings is. */
const HIGHLIGHT_DOT_RADIUS = 3;

const FULL_TURN = 2 * Math.PI;

/** What one pass of the line painter needs. */
export interface ParallelPaint {
  /** The axes, from left to right, already placed and measured. */
  layouts: readonly ParallelAxisLayout[];
  /** Each axis's column, in the same order. */
  values: ReadonlyArray<ArrayLike<number>>;
  /** How many rows to draw. */
  count: number;
  /**
   * Which rows the brushes keep, a zero meaning the row is drawn underneath in
   * the excluded ink.
   * @default null — every row is kept and nothing is drawn underneath
   */
  included?: Uint8Array | null;
  /**
   * Which colour each row takes, as a step into `palette`.
   * @default null — every line takes `line`
   */
  steps?: Uint8Array | null;
  /**
   * The colours a step indexes, from `parallelPalette`.
   * @default [] — nothing to index
   */
  palette?: readonly string[];
  /** The ink a line takes when no quantity is colouring the lines. */
  line: string;
  /** The ink the rows a brush left out are drawn in. */
  excluded: string;
  /**
   * How strongly a kept line is drawn. Turn it down for a dense library.
   * @default PARALLEL_INCLUDED_ALPHA
   */
  includedAlpha?: number;
}

/** One row drawn over the mass, and the ink it is drawn in. */
export interface ParallelHighlight {
  /** The row. */
  row: number;
  /** Its ink. */
  color: string;
}

/** What the highlight pass needs. */
export interface ParallelHighlightPaint {
  /** The rows to draw, the last one on top. */
  highlights: readonly ParallelHighlight[];
  /** The axes, from left to right. */
  layouts: readonly ParallelAxisLayout[];
  /** Each axis's column, in the same order. */
  values: ReadonlyArray<ArrayLike<number>>;
  /** The ink the halo under each line is drawn in. */
  halo: string;
}

/**
 * Resize a canvas to the device pixel grid and move its origin to the drawing
 * area, which also clears whatever it held.
 * @param canvas - The canvas, or `null` before it is mounted.
 * @param width - Width of the figure, in CSS pixels.
 * @param height - Its height, in CSS pixels.
 * @returns The context, or `null` when there is nothing to draw on.
 */
export function preparePlotCanvas(
  canvas: HTMLCanvasElement | null,
  width: number,
  height: number,
): CanvasRenderingContext2D | null {
  if (canvas === null) return null;
  const context = canvas.getContext('2d');
  if (context === null) return null;
  const pixelRatio = Math.max(globalThis.devicePixelRatio || 1, 1);
  // Assigning the backing store is what clears it; there is no second clear.
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.resetTransform();
  context.scale(pixelRatio, pixelRatio);
  context.translate(PARALLEL_MARGIN.left, PARALLEL_MARGIN.top);
  return context;
}

/**
 * Draw one line per row: the ones a brush left out first, underneath, then the
 * kept ones over them.
 *
 * The excluded rows are one single path stroked once, in a light grey rather
 * than a translucent black: overlapping segments of one stroked path
 * accumulate alpha, so a translucent black saturates to black wherever the
 * library is dense, while a light grey is a colour the pile can only converge
 * on.
 * @param context - A context already scaled and moved to the drawing area by {@link preparePlotCanvas}.
 * @param paint - See {@link ParallelPaint}.
 */
export function paintParallelLines(
  context: CanvasRenderingContext2D,
  paint: ParallelPaint,
): void {
  const { layouts, values, count, line, excluded, includedAlpha } = paint;
  if (layouts.length < 2) return;
  const included = paint.included ?? null;
  const steps = paint.steps ?? null;
  const palette = paint.palette ?? [];
  context.lineWidth = 1;

  if (included !== null) {
    context.strokeStyle = excluded;
    context.beginPath();
    for (let row = 0; row < count; row++) {
      if (included[row] !== 0) continue;
      traceParallelRow(context, row, layouts, values);
    }
    context.stroke();
  }

  context.globalAlpha = includedAlpha ?? PARALLEL_INCLUDED_ALPHA;
  context.strokeStyle = line;
  let previousStep = -1;
  for (let row = 0; row < count; row++) {
    if (included !== null && included[row] === 0) continue;
    if (steps !== null) {
      const step = steps[row] as number;
      if (step !== previousStep) {
        // A step past the end of the ramp is a quantity nobody knows for this
        // row; it is drawn in the neutral ink rather than in the ramp's first
        // colour, which means the smallest value in the set.
        context.strokeStyle = palette[step] ?? line;
        previousStep = step;
      }
    }
    context.beginPath();
    traceParallelRow(context, row, layouts, values);
    context.stroke();
  }
  context.globalAlpha = 1;
}

/**
 * Draw a few singled-out rows over the mass, each over a halo and dotted at
 * every axis crossing.
 * @param context - A context already scaled and moved to the drawing area.
 * @param paint - See {@link ParallelHighlightPaint}.
 */
export function paintParallelHighlights(
  context: CanvasRenderingContext2D,
  paint: ParallelHighlightPaint,
): void {
  const { highlights, layouts, values, halo } = paint;
  if (layouts.length < 2) return;
  context.lineJoin = 'round';
  context.lineCap = 'round';
  for (const { row, color } of highlights) {
    context.beginPath();
    traceParallelRow(context, row, layouts, values);
    context.strokeStyle = halo;
    context.lineWidth = HALO_WIDTH;
    context.stroke();
    context.strokeStyle = color;
    context.lineWidth = HIGHLIGHT_WIDTH;
    context.stroke();

    context.fillStyle = color;
    for (let index = 0; index < layouts.length; index++) {
      const layout = layouts[index];
      const column = values[index];
      if (layout === undefined || column === undefined) continue;
      const y = parallelPixelAt(layout.pixels, column[row] as number);
      if (!Number.isFinite(y)) continue;
      context.beginPath();
      context.arc(layout.x, y, HIGHLIGHT_DOT_RADIUS, 0, FULL_TURN);
      context.fill();
    }
  }
}

/**
 * Add one row's line to the path being built.
 *
 * The line is one polyline per unbroken run of known values, so a row with a
 * gap in the middle is drawn as two, and nothing is painted over an axis the
 * row has no value on.
 * @param context - A context already scaled and moved to the drawing area.
 * @param row - The row to trace.
 * @param layouts - The axes, from left to right.
 * @param values - Each axis's column, in the same order.
 */
export function traceParallelRow(
  context: CanvasRenderingContext2D,
  row: number,
  layouts: readonly ParallelAxisLayout[],
  values: ReadonlyArray<ArrayLike<number>>,
): void {
  let started = false;
  for (let index = 0; index < layouts.length; index++) {
    const layout = layouts[index];
    const column = values[index];
    if (layout === undefined || column === undefined) continue;
    const y = parallelPixelAt(layout.pixels, column[row] as number);
    // A row whose value on this axis is not known yet has no point to draw,
    // and the line breaks rather than bridging the axis: a segment drawn
    // across it reads as a value the row does not hold, and the hit test,
    // which has no endpoint there, cannot pick it back.
    if (!Number.isFinite(y)) {
      started = false;
      continue;
    }
    if (started) {
      context.lineTo(layout.x, y);
    } else {
      context.moveTo(layout.x, y);
      started = true;
    }
  }
}
