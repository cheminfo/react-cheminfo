/**
 * What a caller hands a `ParallelCoordinates`.
 *
 * The types the figure is *told* about — an axis, an interval, a colour ramp —
 * live in `parallel/core`, because the same words describe the mask a table
 * beside the figure filters on and the layout the painter reads. What is left
 * here is what only a React component has: the render props, the inks a canvas
 * cannot read off a stylesheet, and the controlled pairs.
 */

import type { ReactNode } from 'react';

import type {
  ParallelAxis,
  ParallelColorBy,
  ParallelRange,
  ParallelRanges,
} from '../core/parallelTypes.ts';

/** What the pointer is over, and where. */
export interface ParallelHover {
  /** The row, as an index into the axes' value arrays. */
  index: number;
  /** Where the pointer is, in pixels from the figure's left edge. */
  x: number;
  /** Where it is, in pixels from its top edge. */
  y: number;
}

/** The colours a canvas is painted with, which cannot read a custom property. */
export interface ParallelInk {
  /**
   * The rows a brush left out, drawn under the rest.
   * @default a light grey the dense mass can only converge on
   */
  excluded?: string;
  /**
   * The rows nothing is colouring, when no quantity was given.
   * @default the value of `--text-muted` on the figure
   */
  line?: string;
  /**
   * The row under the pointer.
   * @default the value of `--text` on the figure
   */
  hover?: string;
  /**
   * The rows singled out elsewhere — picked in a table, pinned by the reader.
   * @default the value of `--accent` on the figure
   */
  selection?: string;
  /**
   * The halo a singled-out line is drawn over, so it reads against the mass.
   * @default the value of `--surface`, at 85%
   */
  halo?: string;
  /**
   * The axis lines, their ticks and their labels.
   * @default the value of `--text-muted`
   */
  axis?: string;
  /**
   * How strongly a kept line is drawn. Turn it down for a dense library.
   * @default 0.35
   */
  includedAlpha?: number;
}

/** What `ParallelCoordinates` needs. */
export interface ParallelCoordinatesProps {
  /** The axes, from left to right. Fewer than two draws no lines. */
  axes: readonly ParallelAxis[];
  /**
   * How many rows to draw.
   * @default the shortest axis's value count
   */
  count?: number;
  /** Total width, in pixels, normally from `useContainerSize`. */
  width: number;
  /**
   * Total height, axis names and tick labels included.
   * @default 320
   */
  height?: number;

  /**
   * What each axis keeps, keyed by axis id: one interval, several, or `null`.
   * Present, the caller owns the brushes — which is what lets a table beside
   * the figure filter on the same ranges. The band being dragged stays inside
   * the component either way, so a controlled parent is never asked to
   * re-render sixty times a second.
   * @default undefined — the figure keeps its own
   */
  ranges?: ParallelRanges;
  /**
   * The intervals in force before the reader touches anything.
   * @default undefined — no axis is brushed
   */
  defaultRanges?: ParallelRanges;
  /**
   * Whether one axis may keep several intervals at once — the light molecules
   * and the heavy ones, with nothing in between. A reader brushes a second
   * interval by dragging on a bare part of an axis that already carries one,
   * and takes one away by clicking it.
   * @default false — a new brush replaces the one the axis carried
   */
  several?: boolean;
  /**
   * Called when a brush is released, with every interval that axis now keeps —
   * empty when the reader cleared it, and never while a band is being dragged.
   * @default undefined
   */
  onRangeChange?: (axisId: string, ranges: readonly ParallelRange[]) => void;
  /**
   * Called on every frame a band grows, for a caption saying what letting go
   * would keep. Nothing else should be wired to it.
   * @default undefined
   */
  onRangePreview?: (axisId: string, ranges: readonly ParallelRange[]) => void;
  /**
   * Which rows the brushes keep, one entry per row, a zero meaning excluded.
   * Left out, it is worked out from the ranges with `parallelIncludedMask`,
   * which is exported so a table beside the figure filters on the same answer
   * rather than on a second definition of "kept".
   * @default undefined — worked out from the ranges
   */
  included?: Uint8Array;

  /**
   * The row under the pointer, or `-1`. Present, the caller owns it, which is
   * what lets a table hovered elsewhere light up its line here.
   * @default undefined — the figure keeps its own
   */
  hovered?: number;
  /**
   * Called with the row under the pointer, or `-1`, whenever that changes.
   * @default undefined
   */
  onHoverChange?: (index: number) => void;
  /**
   * The rows singled out elsewhere, drawn over the mass in the selection ink.
   * A row that is also the hovered one is drawn once, in the hover ink.
   * @default undefined — nothing is singled out
   */
  selected?: readonly number[];
  /**
   * Called when a line is clicked, with the row, or `-1` for empty ground.
   * @default undefined — the lines are not clickable
   */
  onRowClick?: (index: number) => void;

  /**
   * The quantity the lines are coloured by.
   * @default undefined — every line takes one ink
   */
  color?: ParallelColorBy;
  /**
   * The id of the axis the lines are coloured by, for the common case where it
   * is one of the axes already drawn. Ignored when `color` is given.
   * @default undefined
   */
  colorAxis?: string;
  /**
   * The canvas colours, merged over the ones read off the figure's own tokens.
   * @default {}
   */
  ink?: ParallelInk;

  /**
   * The card shown over the row under the pointer. It is placed by the figure,
   * flipped rather than clipped at either edge, so a caller writes only what
   * it says.
   * @default undefined — no card is shown
   */
  renderTooltip?: (hover: ParallelHover) => ReactNode;
  /**
   * How an axis is named. The default writes the label and its unit; a caller
   * wraps it to hang a help tooltip off the name.
   * @default the axis label, and its unit after it
   */
  renderAxisLabel?: (axis: ParallelAxis, index: number) => ReactNode;
  /**
   * Called with the axis ids in the order the reader dragged them into.
   * Present, every axis name becomes a handle: drag it, or focus it and press
   * the left and right arrow keys. Two columns only show their relationship
   * when they stand next to each other, so this is how a reader asks a
   * different question of the same figure.
   * @default undefined — the axes stand in the order the caller gave them
   */
  onAxisOrder?: (ids: readonly string[]) => void;
  /**
   * What is shown in place of the figure when there is nothing to draw.
   * @default undefined — an empty figure of the given height
   */
  empty?: ReactNode;
  /**
   * What floats over the figure — a legend, a colour scale key, a caption.
   * @default undefined
   */
  overlay?: ReactNode;

  /**
   * What a screen reader is told the figure shows.
   * @default a sentence naming the axes and the row count
   */
  label?: string;
  /**
   * A class for the figure's outermost element, for a site placing it.
   * @default undefined
   */
  className?: string;
  /**
   * Value of the `data-testid` attribute of the wrapper.
   * @default undefined
   */
  testId?: string;
}
