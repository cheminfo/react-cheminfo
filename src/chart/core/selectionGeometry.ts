/**
 * The rectangle a drag sweeps out, in the pixels it is drawn in.
 *
 * The preview and the release are two readings of one gesture, and they have to
 * agree: a rectangle that promises a window the release then refuses teaches a
 * user that the chart is unreliable, which is a far more expensive mistake than
 * a preview that is a pixel out. So the same two tests decide both — the drag is
 * pulled back inside the plot and measured against `MINIMUM_DRAG` here exactly
 * as `zoomedDomain` does it, and the height comes from the answer
 * `zoomSelection` already worked out rather than from a second one.
 */

import { clamp } from '../../format/core/clamp.ts';

import type { PlotRect } from './chartGeometry.ts';
import type { ZoomSelection } from './zoomDomain.ts';
import { MINIMUM_DRAG } from './zoomDomain.ts';

/** A rectangle in the user units of the SVG. */
export interface SelectionRectangle {
  /** Its left edge. */
  x: number;
  /** Its top edge. */
  y: number;
  /** How wide it is. */
  width: number;
  /** How tall it is. */
  height: number;
}

/**
 * The rectangle to draw for a drag being made.
 *
 * A drag that takes the y axis with it is drawn at the height of the drag
 * itself, and one that asks for the x axis alone spans the whole plot.
 * That is the gesture announcing itself before the button is let go: the
 * rectangle changing shape as the pointer crosses the baseline is the only
 * warning a user gets that the release is about to move both axes, and it is one
 * they can still act on.
 *
 * A drag too short to zoom draws nothing at all. Below `MINIMUM_DRAG` the
 * release does nothing — most clicks made on a trackpad wobble by a pixel or two
 * — and a rectangle flashing up on every click would say that something
 * happened.
 * @param selection - The drag being made, `null` when none is.
 * @param plot - Where the plot sits inside the SVG, which the drag is confined
 * to.
 * @returns The rectangle, `null` when there is nothing to draw.
 */
export function selectionRectangle(
  selection: ZoomSelection | null,
  plot: PlotRect,
): SelectionRectangle | null {
  if (selection === null) return null;

  const { fromX, toX, fromY, toY, zoomsYAxis } = selection;
  const left = clamp(Math.min(fromX, toX), plot.left, plot.right);
  const right = clamp(Math.max(fromX, toX), plot.left, plot.right);
  const width = right - left;
  if (!(width >= MINIMUM_DRAG)) return null;

  if (!zoomsYAxis) {
    return { x: left, y: plot.top, width, height: plot.height };
  }
  const top = clamp(Math.min(fromY, toY), plot.top, plot.bottom);
  const bottom = clamp(Math.max(fromY, toY), plot.top, plot.bottom);
  return { x: left, y: top, width, height: bottom - top };
}
