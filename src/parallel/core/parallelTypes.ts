/**
 * What a parallel-coordinates figure is asked to draw: one axis per column,
 * the intervals the reader brushed on them, and the quantity the lines are
 * coloured by.
 *
 * The figure itself is index-based — every axis hands over its column as an
 * `ArrayLike<number>` read in place — so a repaint costs an indexed read per
 * value rather than a call. {@link parallelAxisOf} is the one place a row type
 * is named, and it is run once per data change rather than once per repaint.
 */

import type { ColorScale } from '../../color/core/interpolate.ts';

/** How a value is placed along an axis. */
export type ParallelAxisScale = 'linear' | 'log';

/** One labelled graduation a caller writes itself. */
export interface ParallelTick {
  /** Where it sits, in the axis's own units. */
  value: number;
  /** What is written beside it. */
  label: string;
}

/** One vertical axis of a parallel-coordinates figure, and the column it draws. */
export interface ParallelAxis {
  /**
   * A stable key, which is how a brushed range is reported and how a caller
   * names the axis the colour is read from. Never an index: axes are added and
   * reordered, and a range keyed on a position outlives the axis it belonged
   * to.
   */
  id: string;
  /** What it is called, written over the axis. */
  label: string;
  /**
   * Every row's value, in the figure's row order. Read in place — nothing is
   * copied — so a `Float64Array` is the cheapest thing to pass.
   */
  values: ArrayLike<number>;
  /**
   * The two ends of the axis, low first. Left out, they are the column's own
   * smallest and largest finite value, and a column with no spread at all is
   * opened by half a unit on each side so that it still draws.
   * @default undefined — the column's own range
   */
  domain?: readonly [number, number];
  /**
   * How values are placed between the ends. `log` needs a domain whose low end
   * is above zero; a value at or below zero is pinned to the low end.
   * @default 'linear'
   */
  scale?: ParallelAxisScale;
  /**
   * How a tick is written. Left out, the ticks carry as many decimals as the
   * spacing needs.
   * @default undefined
   */
  format?: (value: number) => string;
  /**
   * The graduations, written out by the caller — what a coded quantity needs,
   * where `0`, `1`, `2` should read `none`, `low`, `high`.
   * @default undefined — the figure graduates the axis itself
   */
  ticks?: readonly ParallelTick[];
  /**
   * Roughly how many graduations to aim for, when the figure picks them.
   * @default 5
   */
  tickCount?: number;
  /**
   * Whether the ends are rounded outward to whole tick steps. Off, so the axis
   * ends exactly on the data — a reader comparing two molecules on a drug
   * score must see the best one touch the top of its axis, not float below a
   * round number nothing reached.
   * @default false
   */
  nice?: boolean;
  /**
   * The unit written after the axis name, e.g. `g/mol`.
   * @default '' — nothing is written
   */
  unit?: string;
}

/** An interval kept on one axis, in that axis's own units, low first. */
export type ParallelRange = readonly [number, number];

/**
 * What one axis keeps: nothing, one interval, or several disjoint ones.
 *
 * A reader comparing molecules wants the light ones *and* the heavy ones, with
 * nothing in between, which one interval cannot say. Several are read as a
 * union — a row is kept when it falls in any of them — while the axes are
 * still read as an intersection, so each axis narrows what the ones before it
 * left. A bare interval means the same as a list holding only it, so a caller
 * that only ever keeps one writes one.
 */
export type ParallelSelection = ParallelRange | readonly ParallelRange[] | null;

/** Which rows a set of brushes keeps, keyed by axis id. */
export type ParallelRanges = Readonly<Record<string, ParallelSelection>>;

/** How the lines are coloured. */
export interface ParallelColorBy {
  /** The quantity read for each row, in the figure's row order. */
  values: ArrayLike<number>;
  /**
   * The value at the low end of the ramp.
   * @default the smallest finite value
   */
  min?: number;
  /**
   * The value at its high end.
   * @default the largest finite value
   */
  max?: number;
  /**
   * The ramp, as the registry hands it over or as a plain list of colours.
   * @default viridis — `resolveColorScale(DEFAULT_COLOR_SCALE_ID).scale`
   */
  scale?: ColorScale | readonly string[];
  /**
   * Whether the quantity is read on a base-10 logarithmic ramp.
   * @default false
   */
  logarithmic?: boolean;
}

/** An axis described by the field to read off each row, rather than by its column. */
export type ParallelAxisSource<Row> = Omit<ParallelAxis, 'values'> & {
  /**
   * The value this axis reads off one row. Called once per row per data
   * change, never per repaint.
   */
  readonly value: (row: Row) => number;
};

/**
 * One axis built by reading a field off each row.
 *
 * The one place a row type is named: the figure itself reads numbers out of a
 * typed array, so a repaint costs an indexed read rather than a call per
 * value. Call it inside a `useMemo` keyed on the rows.
 * @param rows - The rows, in the order the figure will index them.
 * @param axis - The axis, with the field to read instead of its values.
 * @returns The axis, with its values filled in.
 */
export function parallelAxisOf<Row>(
  rows: readonly Row[],
  axis: ParallelAxisSource<Row>,
): ParallelAxis {
  const { value, ...rest } = axis;
  const values = new Float64Array(rows.length);
  for (let row = 0; row < rows.length; row++) {
    values[row] = value(rows[row] as Row);
  }
  return { ...rest, values };
}
