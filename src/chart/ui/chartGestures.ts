/**
 * A press on a chart, and what letting go of it answers.
 *
 * `useChartZoom` holds the React state — the window on screen, and the drag
 * being made across it — and this holds the arithmetic that turns a release into
 * an answer: a window to show, a range to report, a click to report, or nothing
 * at all. Keeping the two apart is what lets the answer be tested without a
 * renderer, which is how `zoomedDomain` beside it has always been read, and it
 * is why this sits next to that file rather than inside the hook.
 *
 * The three things a host can be told about are here for the same reason. Only
 * one of the four answers moves the window; the other three leave the chart
 * exactly where it was, and deciding between them in one place is what stops a
 * gesture reporting a range and a click for the same drag.
 */

import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';

import { isEditingField } from '../../panel/core/isEditingField.ts';
import type { ChartDomain, ZoomRules } from '../core/chartDomain.ts';
import type { PlotRect } from '../core/chartGeometry.ts';
import type { ChartScale } from '../core/chartScale.ts';
import { chartValue } from '../core/chartScale.ts';
import type { ChartPoint } from '../core/svgPoint.ts';
import { svgPointAt } from '../core/svgPoint.ts';
import type { DragBox } from '../core/zoomDomain.ts';
import { MINIMUM_DRAG, zoomedDomain } from '../core/zoomDomain.ts';

import { isInsidePlot } from './useChartPointer.ts';

/** One gesture on the SVG, as React hands it over. */
type PointerHandler = (event: ReactPointerEvent<SVGSVGElement>) => void;
type KeyboardHandler = (event: ReactKeyboardEvent<SVGSVGElement>) => void;

/**
 * Which keys were held as a click was let go.
 *
 * Reported rather than interpreted, because what a modifier *means* is a
 * question about the measurement and not about the gesture layer: on a mass
 * spectrum a held shift asks for the peak to be watched for, and on an infrared
 * one it will mean something else entirely. The chart says which keys were
 * down; whoever knows what is being measured decides what that asks for.
 */
export interface ChartClickModifiers {
  /** Whether shift was held. */
  shift: boolean;
  /** Whether alt — option on a Mac — was held. */
  alt: boolean;
}

/** No key held, which is what a plain click reports. */
export const NO_MODIFIERS: ChartClickModifiers = { shift: false, alt: false };

/** What to spread onto the SVG for it to be zoomed. */
export interface ChartZoomHandlers {
  onPointerDown: PointerHandler;
  onPointerMove: PointerHandler;
  onPointerUp: PointerHandler;
  onPointerCancel: PointerHandler;
  onDoubleClick: () => void;
  onKeyDown: KeyboardHandler;
  /**
   * So the chart can hold the caret, which is what lets a key reach it.
   *
   * In the tab order rather than merely focusable by a click, because the chart
   * is* the widget here: a reader who navigates by keyboard has no other way to
   * reach it, and a chart nobody can focus answers no key at all. A viewer that
   * answers none takes itself back out of the order.
   */
  tabIndex: number;
}

/** The key that fits the window to everything drawn, on every chart. */
export const FIT_KEY = 'f';

/**
 * Whether a key press asks for the window to be fitted.
 *
 * A key pressed with a modifier belongs to the browser or to the page — Ctrl+F
 * is a search, and a chart that swallowed it to fit itself would be a chart
 * people stop typing near — and a key delivered to a field is part of what is
 * being written. Compared case-insensitively, so a capital arriving from a held
 * shift still fits.
 * @param event - The key press, as React delivers it or as the DOM does.
 * @returns Whether the chart should fit its window.
 */
export function asksToFit(
  event: Pick<
    KeyboardEvent,
    'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'target'
  >,
): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  if (isEditingField(event.target)) return false;
  return event.key.toLowerCase() === FIT_KEY;
}

/** What a host asks to be told, beyond the window it is shown anyway. */
export interface ChartGestureReports {
  /**
   * What to do with the two values a `select` drag swept out, in the units of
   * the horizontal axis and stated low end first.
   *
   * The window is left exactly where it was: the gesture asked where a peak
   * begins and ends, not to look closer at it, and a chart that zoomed to the
   * boundaries as they were set would take the neighbouring peaks off the screen
   * every time. The ends are sorted before anyone is told, because a drag made
   * right to left is as ordinary as one made left to right and an axis drawn
   * right to left inverts them again — a range of `[2.9, 2.4]` minutes
   * integrates nothing.
   * @default nothing is reported, and a select drag then does nothing at all
   */
  onSelectRange?: (range: [number, number]) => void;
  /**
   * What to do with a press that went nowhere, in the units the chart is
   * measured in — an m/z, a wavenumber, a retention time and a value.
   *
   * Nowhere means nowhere on **either** axis: a press is a click when it
   * travelled less than `MINIMUM_DRAG` across and less than `MINIMUM_DRAG` down.
   * Only the horizontal travel decides whether there is a window to zoom to, so
   * a drag of one pixel across and three hundred down asks for no window — but
   * it is plainly a gesture that was made, and calling it a press that went
   * nowhere would put a scan on the chart nobody pointed at.
   *
   * A `select` drag is never reported here at all. Its answer is a range or it
   * is nothing, and a near-vertical integration drag that moved the cursor
   * instead would be answering a question the chemist did not ask.
   *
   * There is no other way to be told about a click: hovering is a different
   * question, answered continuously and by every tremor of a hand resting on the
   * chart, and choosing the scan at 2.500 minutes is a decision made by pressing.
   * Only a press let go over the plot is reported — the gestures are heard on the
   * whole SVG, so the axis titles and the tick labels are under them too, and a
   * click on the word `m/z` inverted through the scales lands at a value the
   * chart is not even drawing.
   * @default nothing is reported
   */
  onClick?: (point: ChartPoint, modifiers: ChartClickModifiers) => void;
  /**
   * Whether a press at this point of the SVG, in its own user units, begins a
   * drag at all.
   *
   * In pixels rather than in data units because that is the question being
   * asked: whatever else is drawn on the chart — an integration boundary to be
   * taken hold of, a cursor to be slid — was placed in pixels, and `isInsidePlot`
   * is here for exactly this. Refusing means the press is never captured, so it
   * reaches whatever is under it and that thing keeps the rest of the gesture;
   * captured first and refused afterwards, the handle would never see the move
   * events that drag it.
   * @default every press over the SVG begins a drag
   */
  shouldStartDrag?: (point: ChartPoint) => boolean;
}

/** A drag as it is held, tied to the pointer that started it. */
export interface Drag extends DragBox {
  /** So a second finger cannot take a drag over from the first. */
  pointerId: number;
}

/**
 * What letting go of a drag comes to, told to the host on the way.
 *
 * One reading of the gesture answers all four outcomes, so what a select drag
 * reports and what a zoom would have shown can never drift apart: the clamping
 * to the plot, the `MINIMUM_DRAG` test and the sorting after inverting are done
 * once, in `zoomedDomain`.
 * @param current - The window in force, kept on the axis that is not asked for.
 * @param released - The two corners as the button came up, in user units.
 * @param plot - Where the plot sits inside the SVG.
 * @param xScale - The x axis as the chart is currently zoomed.
 * @param yScale - The y axis, likewise.
 * @param rules - How the y axis behaves and what a drag means.
 * @param reports - What the host asked to be told.
 * @param modifiers
 * @returns The window to show, `null` when the chart stays where it is.
 */
export function answeredRelease(
  current: ChartDomain,
  released: DragBox,
  plot: PlotRect,
  xScale: ChartScale,
  yScale: ChartScale,
  rules: ZoomRules,
  reports: ChartGestureReports,
  modifiers: ChartClickModifiers = NO_MODIFIERS,
): ChartDomain | null {
  const mode = rules.drag ?? 'xAxis';
  const next = zoomedDomain(current, released, plot, xScale, yScale, rules);
  if (next === null) {
    if (mode !== 'select') {
      reportClick(released, plot, xScale, yScale, reports.onClick, modifiers);
    }
    return null;
  }
  if (mode === 'select') {
    reports.onSelectRange?.(next.x);
    return null;
  }
  return next;
}

/**
 * The drag a press begins, `null` for a press that begins none.
 *
 * The host is asked before the pointer is captured rather than after it: a press
 * taken from whatever it landed on cannot be handed back mid-gesture, so an
 * integration boundary or a cursor drawn on the chart would never see the moves
 * that drag it.
 * @param event - The press.
 * @param svg - The SVG it was made on, which is what places it in user units.
 * @param shouldStartDrag - Whether the host lets the chart have it, absent when
 * every press over the SVG is the chart's.
 * @returns The drag, `null` when the press was not the chart's to take or the
 * SVG cannot place the pointer.
 */
export function startedDrag(
  event: ReactPointerEvent<SVGSVGElement>,
  svg: SVGSVGElement | null,
  shouldStartDrag: ((point: ChartPoint) => boolean) | undefined,
): Drag | null {
  if (event.button !== LEFT_BUTTON) return null;
  const point = svgPointAt(svg, event.clientX, event.clientY);
  if (point === null) return null;
  if (shouldStartDrag !== undefined && !shouldStartDrag(point)) return null;
  // Captured so a drag running off the plot — which is how the y axis is asked
  // for — keeps being reported.
  event.currentTarget.setPointerCapture(event.pointerId);
  return {
    pointerId: event.pointerId,
    fromX: point.x,
    fromY: point.y,
    toX: point.x,
    toY: point.y,
  };
}

/**
 * Where a drag has got to, when the event belongs to it.
 * @param drag - The drag being made, `null` when none is.
 * @param event - The pointer event just received.
 * @param svg - The SVG the gesture is made on.
 * @returns The drag with its far corner moved, `null` when the event is not
 * part of it or the SVG cannot place the pointer.
 */
export function draggedTo(
  drag: Drag | null,
  event: ReactPointerEvent<SVGSVGElement>,
  svg: SVGSVGElement | null,
): Drag | null {
  if (drag?.pointerId !== event.pointerId) return null;
  const point = svgPointAt(svg, event.clientX, event.clientY);
  if (point === null) return null;
  return { ...drag, toX: point.x, toY: point.y };
}

/**
 * Give the pointer back, so the next gesture reaches whatever it is aimed at.
 * @param event - The event ending the drag.
 */
export function releaseDrag(event: ReactPointerEvent<SVGSVGElement>): void {
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
}

/**
 * Tell a host where a press that went nowhere landed, in the units the chart is
 * measured in.
 *
 * The travel is measured as the hand made it, before any clamping to the plot: a
 * gesture that ran out over the tick labels travelled however far it travelled,
 * and one begun outside the plot is refused by `isInsidePlot` rather than by
 * arithmetic that pretends it stopped at the edge.
 * @param released - The gesture as it was let go, in user units of the SVG.
 * @param plot - Where the plot sits inside that SVG, which a click has to be
 * over for the values it inverts to be ones the chart is drawing.
 * @param xScale - The horizontal axis as the chart is currently zoomed.
 * @param yScale - The vertical axis, likewise.
 * @param onClick - What the host asked to be told, absent when it asked for
 * nothing.
 * @param modifiers - Which keys were held as the button came up.
 */
function reportClick(
  released: DragBox,
  plot: PlotRect,
  xScale: ChartScale,
  yScale: ChartScale,
  onClick:
    ((point: ChartPoint, modifiers: ChartClickModifiers) => void) | undefined,
  modifiers: ChartClickModifiers,
): void {
  if (onClick === undefined) return;
  if (Math.abs(released.toX - released.fromX) >= MINIMUM_DRAG) return;
  if (Math.abs(released.toY - released.fromY) >= MINIMUM_DRAG) return;
  // Where the button came up rather than where it went down: the two are within
  // `MINIMUM_DRAG` of each other, and the release is where the user was looking.
  const point = { x: released.toX, y: released.toY };
  if (!isInsidePlot(plot, point)) return;
  onClick(
    { x: chartValue(xScale, point.x), y: chartValue(yScale, point.y) },
    modifiers,
  );
}

/** Which button drags a box; the others belong to menus and to panning. */
const LEFT_BUTTON = 0;
