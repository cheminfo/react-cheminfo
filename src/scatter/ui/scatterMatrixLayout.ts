/**
 * How much room a pair grid gives each of its cells.
 *
 * The numbers are the grid's own rather than the chart family's: a figure
 * standing alone can afford ten pixels of quiet around its plot, and a grid
 * repeating that margin thirty-six times inside somebody else's page spends a
 * fifth of its width on nothing. What a tick label and an axis title need is
 * still taken from the chart, because that is a property of the type and not
 * of the figure.
 */

import { chartAxisScale } from '../../chart/core/chartAxisScale.ts';
import type { ChartExtent } from '../../chart/core/chartExtent.ts';
import {
  CHART_TICK_ROOM as TICKS,
  CHART_TITLE_ROOM as TITLES,
  chartTickRoom,
} from '../../chart/ui/chartStyles.ts';

/** Room a cell keeps around its plot before its outer edges ask for more. */
export const SCATTER_MATRIX_MARGINS = {
  top: 4,
  right: 8,
  bottom: 4,
  left: 8,
} as const;

/**
 * Gap between two cells, which is what tells one plot from the next.
 *
 * The three numbers across a join — this and the two margins beside it — have
 * to hold two tick labels facing each other, since the label on a plot's last
 * tick is centred on its edge and reaches into the gap from both sides. Twenty
 * two pixels is where `4` and `-1.5` stop reading as `4-1.5`.
 */
export const SCATTER_MATRIX_GAP = 6;

/**
 * Room the left column and the bottom row keep for their ticks and titles
 * when the labels up the column are no wider than the family's usual column of
 * figures — the least {@link scatterMatrixRoom} gives, and the room the count
 * of axes that fit a width is decided at.
 */
export const SCATTER_MATRIX_ROOM = {
  left: SCATTER_MATRIX_MARGINS.left + TICKS.left + TITLES.left,
  bottom: SCATTER_MATRIX_MARGINS.bottom + TICKS.bottom + TITLES.bottom,
} as const;

/**
 * The most axes a grid ever lays out, and the fewest it falls back to.
 *
 * Six is where the reading stops being worth the room: the sixth component of
 * a real model usually carries a per cent of the differences, and thirty-six
 * cells is already more than a reader compares in one sitting. It is a
 * ceiling, not a target — {@link scatterMatrixAxesThatFit} drops axes until
 * the cells are readable, so a narrow embed draws three of them.
 */
export const SCATTER_MATRIX_MOST_AXES = 6;
const SMALLEST_GRID = 2;

/**
 * The smallest plot the grid draws.
 *
 * Below it the dots merge and the ticks collide, so an axis is dropped
 * instead: three components a reader can see beat six they cannot.
 */
export const SCATTER_MATRIX_SMALLEST_PLOT = 50;

/**
 * The narrowest cell that writes its share into its axis title.
 *
 * `PC1 — 73.0 %` is about a hundred pixels of type, and an axis title is
 * centred on a cell that may be seventy: three of them along the foot of a
 * narrow grid run into one another and none of the three can be read. Under
 * this the title is the component's name alone, which is the half a reader
 * needs to know which cell they are looking at.
 */
export const SCATTER_MATRIX_SHARE_IN_TITLE = 110;

/**
 * The smallest plot a group outline is drawn in.
 *
 * An outline holding ninety-five per cent of its group covers most of the cell
 * it is drawn in, so under about sixty-four pixels the boundary runs along the
 * edges and the fill reads as a tinted cell rather than as a region — a blob
 * that says where the group is not. The dots still say it, so the outline is
 * simply left out.
 */
export const SCATTER_MATRIX_SMALLEST_OUTLINE = 64;

/**
 * How many axes fit in the width at a readable size.
 * @param width - What the grid was given, in pixels.
 * @param wanted - How many the caller asked for.
 * @returns The count to lay out, never below two.
 */
export function scatterMatrixAxesThatFit(
  width: number,
  wanted: number,
): number {
  for (let count = wanted; count > SMALLEST_GRID; count--) {
    if (scatterMatrixPlotSide(width, count) >= SCATTER_MATRIX_SMALLEST_PLOT) {
      return count;
    }
  }
  return Math.max(0, Math.min(wanted, SMALLEST_GRID));
}

/**
 * The side of every plot rectangle once the chrome has taken its share.
 * @param width - What the grid was given, in pixels.
 * @param count - How many axes are laid out.
 * @param left - Room the left column keeps, from {@link scatterMatrixRoom}.
 * Defaults to {@link SCATTER_MATRIX_ROOM}'s, labels no wider than usual.
 * @returns The side, in pixels, which the caller floors at the smallest plot.
 */
export function scatterMatrixPlotSide(
  width: number,
  count: number,
  left: number = SCATTER_MATRIX_ROOM.left,
): number {
  if (count < 1) return SCATTER_MATRIX_SMALLEST_PLOT;
  const inner = SCATTER_MATRIX_MARGINS.left + SCATTER_MATRIX_GAP;
  const chrome =
    left + (count - 1) * inner + count * SCATTER_MATRIX_MARGINS.right;
  return (Math.max(0, width) - chrome) / count;
}

/**
 * Room the left column and the bottom row keep for their ticks and titles.
 *
 * The left is as wide as the widest label written up the column: a column of
 * `-125.5` needs more than the family's usual room, and the axis title beside
 * it is drawn past those labels, so a room fixed in advance would put the
 * title outside the cell. The labels are worked out the way each cell's frame
 * works them out, from the same domain and the same tick count.
 * @param extents - The range of each laid-out axis, by its index.
 * @param shown - How many axes are laid out.
 * @param ticks - How many ticks a written axis aims for.
 * @returns The room, in pixels: never less than {@link SCATTER_MATRIX_ROOM}.
 */
export function scatterMatrixRoom(
  extents: readonly ChartExtent[],
  shown: number,
  ticks: number,
): { left: number; bottom: number } {
  let labels: number = TICKS.left;
  // The diagonal heads the column and writes no ticks of its own.
  for (let row = 1; row < shown; row++) {
    const [min, max] = scatterMatrixDomain(extents[row]);
    const scale = chartAxisScale(min, max, { count: ticks });
    labels = Math.max(labels, chartTickRoom('left', scale));
  }
  return {
    left: SCATTER_MATRIX_MARGINS.left + labels + TITLES.left,
    bottom: SCATTER_MATRIX_ROOM.bottom,
  };
}

/**
 * The domain a cell draws an axis over: the axis' range, or the unit range
 * while it has none.
 * @param extent - The axis' range, if it was measured.
 * @returns The domain.
 */
export function scatterMatrixDomain(
  extent: ChartExtent | undefined,
): [number, number] {
  return [extent?.min ?? 0, extent?.max ?? 1];
}

/**
 * How many ticks a cell's axis aims for.
 *
 * Four labels on a ninety-pixel axis run into one another and the reader
 * reads none of them; two ends and nothing else is enough to say which way the
 * component grows, which is all a cell of a grid is asked.
 * @param side - The side of the plot rectangle, in pixels.
 * @returns The tick count to ask the axis for.
 */
export function scatterMatrixTickCount(side: number): number {
  if (side < CROWDED_AXIS) return 2;
  return side < ROOMY_AXIS ? 3 : 4;
}

/** Where an axis stops holding three tick labels, and where it holds four. */
const CROWDED_AXIS = 90;
const ROOMY_AXIS = 150;
