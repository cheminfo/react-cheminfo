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

import {
  CHART_TICK_ROOM as TICKS,
  CHART_TITLE_ROOM as TITLES,
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

/** Room the left column and the bottom row keep for their ticks and titles. */
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
 * `PC 1 — 73.0 %` is about a hundred pixels of type, and an axis title is
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
 * @returns The side, in pixels, which the caller floors at the smallest plot.
 */
export function scatterMatrixPlotSide(width: number, count: number): number {
  if (count < 1) return SCATTER_MATRIX_SMALLEST_PLOT;
  const inner = SCATTER_MATRIX_MARGINS.left + SCATTER_MATRIX_GAP;
  const chrome =
    SCATTER_MATRIX_ROOM.left +
    (count - 1) * inner +
    count * SCATTER_MATRIX_MARGINS.right;
  return (Math.max(0, width) - chrome) / count;
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
