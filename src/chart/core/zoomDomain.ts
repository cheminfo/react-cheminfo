/**
 * The window a gesture asks for, where each viewer's own fitting holds the one
 * the data asks for.
 *
 * Nothing here touches React or the DOM: a drag arrives as two corners in the
 * user units of the SVG, a wheel as a factor, and each leaves as a window — so
 * what a gesture does to a chart can be read, and tested, without one being on
 * screen.
 */

import { clamp } from '../../format/core/clamp.ts';

import type { ChartDomain, ZoomRules } from './chartDomain.ts';
import { DEFAULT_Y_AXIS_RULES } from './chartDomain.ts';
import type { PlotRect } from './chartGeometry.ts';
import type { ChartScale } from './chartScale.ts';
import { chartPixel, chartValue } from './chartScale.ts';

/**
 * How far the pointer has to travel before a press counts as a gesture rather
 * than as a click, in user units of the SVG.
 *
 * Across the x axis it is what decides whether there is a window at all: below
 * this the gesture is a click that happened to wobble — which is most clicks
 * made on a trackpad — and zooming to it would leave a window a fraction of a
 * data unit wide, from which the only way back is the double click nobody knows
 * about yet. `chartGestures.ts` asks the same question of the vertical travel
 * before it calls a release a click, since a drag of one pixel across and three
 * hundred down went somewhere.
 */
export const MINIMUM_DRAG = 4;

/** The two corners of a drag, in the user units of the SVG. */
export interface DragBox {
  /** Where the press landed, horizontally. */
  fromX: number;
  /** Where it landed vertically. */
  fromY: number;
  /** Where the pointer is now, horizontally. */
  toX: number;
  /** Where it is vertically. */
  toY: number;
}

/** The drag as it is being made, for the preview rectangle to be drawn from. */
export interface ZoomSelection extends DragBox {
  /**
   * Whether letting go here would take the y axis with it, which is what the
   * rectangle changes shape to say.
   */
  zoomsYAxis: boolean;
}

/**
 * The drag as the preview rectangle needs it.
 *
 * The answer the rectangle changes shape on is worked out once, here, rather
 * than by the rectangle itself — so what the preview promises and what letting
 * go actually does are the same test rather than two that have to agree.
 *
 * A `select` drag is therefore always a band, however far past the baseline it
 * strays: its answer is two numbers on one axis, so a preview that grew into a
 * rectangle would promise a height nobody is ever told about.
 * @param drag - The drag being made, `null` when none is.
 * @param yScale - The y axis as it is currently zoomed.
 * @param rules - How the y axis behaves and what a drag means, defaulting to a
 * stick spectrum read by dragging its horizontal axis.
 * @returns The selection to draw, `null` when there is no drag.
 */
export function zoomSelection(
  drag: DragBox | null,
  yScale: ChartScale,
  rules: ZoomRules = {},
): ZoomSelection | null {
  if (drag === null) return null;
  const {
    baseline = DEFAULT_Y_AXIS_RULES.baseline,
    pointsDown = DEFAULT_Y_AXIS_RULES.pointsDown,
    drag: mode = 'xAxis',
  } = rules;
  return {
    fromX: drag.fromX,
    fromY: drag.fromY,
    toX: drag.toX,
    toY: drag.toY,
    // The box tool takes the height always, so the preview is a rectangle from
    // the first pixel of the gesture rather than a full-height band that
    // suddenly becomes one; a select drag never takes it at all.
    zoomsYAxis:
      mode === 'box' ||
      (mode !== 'select' &&
        releasedBeyondBaseline(drag.toY, yScale, baseline, pointsDown)),
  };
}

/**
 * Whether a drag let go here asks for the y axis as well.
 *
 * The baseline, not the bottom of the plot: on a mirrored chart zero runs across
 * the middle, so a drag that dips into the reflected half has crossed it, and on
 * an ordinary chart the same test means the pointer went below the axis and out
 * into the margin. One rule, two gestures that both read as "and take the height
 * with you".
 *
 * **Which way "past" points depends on which side of the baseline the data is
 * on**, which is what `pointsDown` says. Features that stand up out of a
 * baseline at the foot of the plot — mass sticks, absorbance bands — are passed
 * by going below it. Percent transmittance hangs down from 100, which sits near
 * the top of the plot, so there the gesture is a drag released *above* the
 * baseline; asking the other question would answer yes almost everywhere in the
 * plot and make every ordinary drag take the value axis with it.
 * @param pointerY - Where the pointer is, in user units of the SVG.
 * @param yScale - The y axis as it is currently zoomed.
 * @param baseline - The value the gesture is judged against. Defaults to `0`.
 * @param pointsDown - Whether the data hangs below the baseline. Defaults to
 * `false`.
 * @returns Whether the y axis comes along.
 */
export function releasedBeyondBaseline(
  pointerY: number,
  yScale: ChartScale,
  baseline = DEFAULT_Y_AXIS_RULES.baseline,
  pointsDown = DEFAULT_Y_AXIS_RULES.pointsDown,
): boolean {
  const atBaseline = chartPixel(yScale, baseline);
  // SVG counts pixels downwards, so "above the baseline" is the smaller pixel.
  return pointsDown ? pointerY < atBaseline : pointerY > atBaseline;
}

/**
 * The window a drag asks for, or `null` when it asks for nothing.
 *
 * Both corners are pulled back inside the plot before they are read, so a drag
 * that ran out over the axis labels — which is how the y axis is asked for in
 * the first place — zooms to the edge of the data rather than to whatever lies
 * under the margin.
 *
 * Whether the baseline is kept in the window is the one thing that differs
 * between viewers, and `YAxisRules` is where they say so. A stick spectrum keeps
 * it: sticks are drawn from it, and a window starting at a tenth of the base
 * peak would cut every one of them off at the ankles. A continuous trace does
 * not: a band dragged out between two absorbances is asked about between those
 * two absorbances.
 * @param current - The window in force, kept on the axis that is not asked for.
 * @param drag - The two corners, in user units of the SVG.
 * @param plot - Where the plot sits inside the SVG.
 * @param xScale - The x axis as it is currently zoomed.
 * @param yScale - The y axis as it is currently zoomed.
 * @param rules - How the y axis behaves and what a drag means, defaulting to a
 * stick spectrum read by dragging its horizontal axis.
 * @returns The window to show, `null` when the drag was too short to be one.
 */
export function zoomedDomain(
  current: ChartDomain,
  drag: DragBox,
  plot: PlotRect,
  xScale: ChartScale,
  yScale: ChartScale,
  rules: ZoomRules = {},
): ChartDomain | null {
  const {
    baseline = DEFAULT_Y_AXIS_RULES.baseline,
    keepBaseline = DEFAULT_Y_AXIS_RULES.keepBaseline,
    pointsDown = DEFAULT_Y_AXIS_RULES.pointsDown,
    drag: mode = 'xAxis',
  } = rules;
  const fromX = clamp(drag.fromX, plot.left, plot.right);
  const toX = clamp(drag.toX, plot.left, plot.right);
  if (Math.abs(toX - fromX) < MINIMUM_DRAG) return null;
  // Sorted after inverting, not before: an axis drawn right to left — an
  // infrared spectrum runs from 4000 down to 400 — maps the leftmost pixel to
  // the *highest* value, so taking the left edge as the lower bound would hand
  // back a window whose ends are the wrong way round, and every scale built
  // from it would draw the trace mirrored.
  const firstX = chartValue(xScale, fromX);
  const secondX = chartValue(xScale, toX);
  const x: [number, number] = [
    Math.min(firstX, secondX),
    Math.max(firstX, secondX),
  ];
  // The box tool is asked for the rectangle it was given, wherever it was let
  // go; the reading gesture takes the height only when it crossed the baseline.
  if (
    mode !== 'box' &&
    !releasedBeyondBaseline(drag.toY, yScale, baseline, pointsDown)
  ) {
    return { x, y: current.y };
  }

  const fromY = chartValue(yScale, clamp(drag.fromY, plot.top, plot.bottom));
  const toY = chartValue(yScale, clamp(drag.toY, plot.top, plot.bottom));
  // Both ends, so a baseline the data runs *down* from — 100 percent
  // transmittance — is kept as surely as one it stands on. The box tool holds no
  // baseline at all: a rectangle dragged round a feature is a promise about
  // exactly that rectangle, and a viewer whose axis rules keep its baseline
  // would otherwise see the tool quietly return a taller window than the one
  // drawn.
  const holdBaseline = keepBaseline && mode !== 'box';
  const bottom = holdBaseline
    ? Math.min(baseline, fromY, toY)
    : Math.min(fromY, toY);
  const top = holdBaseline
    ? Math.max(baseline, fromY, toY)
    : Math.max(fromY, toY);
  return top > bottom ? { x, y: [bottom, top] } : { x, y: current.y };
}

/**
 * The window one turn of the wheel asks for.
 *
 * Both bounds are scaled about the baseline rather than about the middle of the
 * window. On a stick spectrum that keeps the foot the sticks are drawn from on
 * the axis, and keeps a mirrored chart symmetric — scaling about the middle
 * would send the two halves apart at different rates, so a peak of one height
 * would mean two different intensities. On an axis running downwards from a
 * baseline, such as percent transmittance from 100, it is what stretches the
 * bands instead of walking the whole trace off the plot.
 * @param current - The window in force.
 * @param factor - What one wheel event is worth, above one to zoom out.
 * @param baseline - The value to scale about. Defaults to `0`.
 * @returns The window to show, `current` itself when the factor is not one a
 * window survives.
 */
export function scaledYAxis(
  current: ChartDomain,
  factor: number,
  baseline = DEFAULT_Y_AXIS_RULES.baseline,
): ChartDomain {
  if (!Number.isFinite(factor) || factor <= 0) return current;
  const y: [number, number] = [
    baseline + (current.y[0] - baseline) * factor,
    baseline + (current.y[1] - baseline) * factor,
  ];
  return y[1] > y[0] ? { x: current.x, y } : current;
}
