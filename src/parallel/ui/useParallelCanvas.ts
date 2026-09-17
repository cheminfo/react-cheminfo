/**
 * The two canvases, and when they are repainted.
 *
 * Two rather than one, because the mass of lines changes when the data or the
 * brushes do, while the row under the pointer changes on every frame the
 * pointer moves. Repainting ten thousand lines to move one highlight is the
 * difference between a figure that follows the pointer and one that lags it.
 */

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

import type { ParallelAxisLayout } from '../core/parallelAxes.ts';
import type { ParallelHighlight } from '../core/parallelPaint.ts';
import {
  paintParallelHighlights,
  paintParallelLines,
  preparePlotCanvas,
} from '../core/parallelPaint.ts';

import type { ParallelInkValues } from './parallelInk.ts';

/** What {@link useParallelCanvas} needs. */
export interface ParallelCanvasOptions {
  /** Total width of the figure, in CSS pixels. */
  width: number;
  /** Its total height. */
  height: number;
  /** The axes, from left to right. */
  layouts: readonly ParallelAxisLayout[];
  /** Each axis's column, in the same order. */
  values: ReadonlyArray<ArrayLike<number>>;
  /** How many rows are drawn. */
  count: number;
  /** Which rows the brushes keep, or `null` when they keep every one. */
  included: Uint8Array | null;
  /** Which colour each row takes, or `null` when nothing is colouring them. */
  steps: Uint8Array | null;
  /** The colours a step indexes. */
  palette: readonly string[];
  /** The rows drawn over the mass, the last one on top. */
  highlights: readonly ParallelHighlight[];
  /** The colours to paint with. */
  ink: ParallelInkValues;
}

/** The two canvases a figure stacks. */
export interface ParallelCanvases {
  /** The mass of lines, underneath. */
  lines: RefObject<HTMLCanvasElement | null>;
  /** The singled-out rows, over them. */
  marks: RefObject<HTMLCanvasElement | null>;
}

/**
 * Keep both canvases sized to the device pixel grid and painted.
 * @param options - See {@link ParallelCanvasOptions}.
 * @returns The two refs to hand to the `<canvas>` elements.
 */
export function useParallelCanvas(
  options: ParallelCanvasOptions,
): ParallelCanvases {
  const { width, height, layouts, values, count } = options;
  const { included, steps, palette, highlights, ink } = options;
  const lines = useRef<HTMLCanvasElement>(null);
  const marks = useRef<HTMLCanvasElement>(null);
  const { line, excluded, includedAlpha, halo } = ink;

  useEffect(() => {
    const context = preparePlotCanvas(lines.current, width, height);
    if (context === null) return;
    paintParallelLines(context, {
      layouts,
      values,
      count,
      included,
      steps,
      palette,
      line,
      excluded,
      includedAlpha,
    });
  }, [
    width,
    height,
    layouts,
    values,
    count,
    included,
    steps,
    palette,
    line,
    excluded,
    includedAlpha,
  ]);

  useEffect(() => {
    const context = preparePlotCanvas(marks.current, width, height);
    if (context === null) return;
    paintParallelHighlights(context, { highlights, layouts, values, halo });
  }, [width, height, highlights, layouts, values, halo]);

  return { lines, marks };
}
