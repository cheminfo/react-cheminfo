/**
 * The style the SVG a chart is drawn on carries, and the one thing about it
 * that moves: the cursor.
 *
 * A chart drawing its own crosshair has two pointers on it — the dashed rules
 * that read the axes, and the operating system's arrow beside them — and only
 * one of the two is saying anything. The arrow is also the one in the way: it
 * is drawn down and to the right of its own hot spot, which is exactly where
 * the crosshair meets and exactly the place being read. So the arrow is hidden
 * while the crosshair is up, and it comes back the moment the pointer leaves
 * the plot, where there is no crosshair and the margins are ordinary furniture.
 *
 * `target` is why this is a function rather than a constant. Something under
 * the pointer can be opened — a ring on a peak a survey scan was fragmented at
 * — and a cursor that never changes is a chart with no way of saying so. The
 * hand wins over the hidden arrow, and the crosshair goes on being drawn under
 * it, since where you are is still worth reading while you decide to click.
 *
 * One helper for every chart in this package rather than a `svgStyle` constant
 * in each: a mass spectrum stacked under a chromatogram is two charts a reader
 * takes to be one instrument, and an arrow over one of them and nothing over
 * the other is the sort of difference that reads as a fault.
 */

import type { CSSProperties } from 'react';

/**
 * What the SVG a chart is drawn on is styled with.
 * @param tracked - Whether the chart is drawing its crosshair where the pointer
 *   is, which is true exactly while the pointer is over the plot.
 * @param target - Whether what is under the pointer can be clicked open.
 *   Defaults to `false`, which is every chart offering nothing to click.
 * @returns The style, one of three objects that never change — a fresh one per
 * pointer move would replace the `style` prop on every tremor of a hand.
 */
export function chartSurfaceStyle(
  tracked: boolean,
  target = false,
): CSSProperties {
  if (!tracked) return IDLE_SURFACE;
  return target ? TARGET_SURFACE : TRACKED_SURFACE;
}

/**
 * Everything about the surface that is not the cursor.
 *
 * `touchAction` because every gesture is a pointer gesture and a browser that
 * scrolled the page instead would take the drag with it; `userSelect` because a
 * drag across a chart is a gesture and not a selection — without it the tick
 * labels come up highlighted behind the rectangle, and stay highlighted in the
 * picture the chart is exported as.
 */
const SURFACE = {
  display: 'block',
  touchAction: 'none',
  userSelect: 'none',
} as const;

/** The pointer is off the plot: whatever cursor the page would have shown. */
const IDLE_SURFACE: CSSProperties = { ...SURFACE };

/** The chart is drawing the crosshair, so the arrow beside it is hidden. */
const TRACKED_SURFACE: CSSProperties = { ...SURFACE, cursor: 'none' };

/** Something under the pointer can be opened. */
const TARGET_SURFACE: CSSProperties = { ...SURFACE, cursor: 'pointer' };
