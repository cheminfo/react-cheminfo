/**
 * Where the crosshair writes what the axes say under it.
 *
 * The readout is the one thing on the chart that must never be clipped: it is
 * what the pointer was put there to read, and the places it is most often put
 * are exactly the awkward ones — on the tallest peak, hard against the top of
 * the plot, or out at the far right where a label written rightwards runs off
 * the edge. So the side it is written on and the line it starts on are both
 * decided from the room there is, and neither is a fixed offset.
 */

import type { PlotRect } from './chartGeometry.ts';
import { CHART_FONT, PEAK_LABEL } from './chartTheme.ts';
import type { ChartPoint } from './svgPoint.ts';

/** The clear space between the crosshair and what is written beside it. */
export const READOUT_GAP = 6;

/**
 * The room the readout claims, in pixels.
 *
 * A value at a deep zoom is `1234.5678` and the one under it is shorter, so this
 * is the width of the longest line either can be — measured from the font rather
 * than from the text, because the text is not on screen yet when the side it goes
 * on has to be chosen.
 */
export const READOUT_WIDTH = 88;

/** How many lines the readout is written on: one for each axis. */
export const READOUT_LINES = 2;

/** Where the readout is written, and which way it runs from there. */
export interface ReadoutPlacement {
  /** The edge the lines are anchored on. */
  x: number;
  /** The baseline of the first line. */
  y: number;
  /** Which way the text runs from `x`. */
  anchor: 'start' | 'end';
}

/**
 * Work out where the readout beside the pointer goes.
 *
 * It is written to the right of the crosshair and above the pointer, which is
 * where a hand holding a mouse is not covering it, and flips to the left as soon
 * as it would otherwise cross the right edge of the plot. Flipping rather than
 * sliding: a readout pinned to the edge would drift away from the crosshair it
 * belongs to as the pointer went further right, and the pair would stop reading
 * as one thing.
 *
 * Both bounds are honoured rather than only the near one, so the last line never
 * runs off the bottom of a short plot. In a plot too short to hold every line
 * the top edge wins: the first line is the one worth keeping, because every
 * viewer writes what its horizontal axis reads there first.
 * @param point - Where the pointer is, in user units.
 * @param plot - Where the plot sits inside the SVG.
 * @param lines - How many lines are written. Defaults to `READOUT_LINES`.
 * @returns The anchor, the first baseline, and which way the text runs.
 */
export function readoutPlacement(
  point: ChartPoint,
  plot: PlotRect,
  lines = READOUT_LINES,
): ReadoutPlacement {
  const runsRight = point.x + READOUT_GAP + READOUT_WIDTH <= plot.right;
  const x = runsRight ? point.x + READOUT_GAP : point.x - READOUT_GAP;

  const written = Math.max(1, lines);
  const highest = plot.top + CHART_FONT.readout;
  const lowest = plot.bottom - (written - 1) * PEAK_LABEL.lineHeight;
  const y = Math.min(
    Math.max(point.y - READOUT_GAP, highest),
    Math.max(highest, lowest),
  );

  return { x, y, anchor: runsRight ? 'start' : 'end' };
}
