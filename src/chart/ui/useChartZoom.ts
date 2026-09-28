/**
 * The gestures that move the window a chart is showing.
 *
 * A drag zooms the x axis, because that is the axis a chemist reads: the
 * question is nearly always "what is between 366 and 372", never "what is
 * between forty and sixty percent". The y axis comes along only when the drag is
 * released past the baseline, a gesture that cannot be made by accident and one
 * the preview rectangle announces before the button is let go. The wheel scales
 * the y axis on its own, bringing up the small features being asked about far
 * more often than any box around them, and a double click puts the window back.
 *
 * Which of them a chart answers is `ZoomGestures`, and a viewer is free to offer
 * fewer: a drag can be the rectangle it sweeps out, and the wheel can be left to
 * the page. Neither is a preference to be toggled — it is what the measurement
 * makes worth doing, and `chartDomain.ts` says why.
 *
 * Not every gesture moves the window. A drag can be asked to report the range it
 * swept out, a press that went nowhere is a click, and a host can refuse a press
 * outright so that a handle drawn on the chart keeps the gesture aimed at it;
 * `chartGestures.ts` holds all three, and `zoomDomain.ts` holds what a gesture
 * does to a window. Neither knows anything of React, which is what lets the
 * answer to a gesture be read without a chart on screen.
 *
 * What the window is fitted *to* is handed in rather than worked out here, and
 * that is what makes one hook serve every kind of spectrum: fitting reads the
 * traces, and a mass spectrum's are two per spectrum where an infrared
 * spectrum's are one in either of two units. `useChartWindow` then holds the
 * answer each viewer hands over.
 */

import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type {
  ChartDomain,
  YAxisRules,
  ZoomGestures,
  ZoomRules,
} from '../core/chartDomain.ts';
import { DEFAULT_ZOOM_GESTURES } from '../core/chartDomain.ts';
import type { ChartScale } from '../core/chartScale.ts';
import { chartWheelFactor } from '../core/chartViewport.ts';
import type { ZoomSelection } from '../core/zoomDomain.ts';
import { scaledYAxis, zoomSelection } from '../core/zoomDomain.ts';

import type {
  ChartGestureReports,
  ChartZoomHandlers,
  Drag,
} from './chartGestures.ts';
import {
  answeredRelease,
  draggedTo,
  releaseDrag,
  startedDrag,
} from './chartGestures.ts';
import type { ChartWindowOptions } from './useChartWindow.ts';
import { useChartWindow } from './useChartWindow.ts';
import { useWheelListener } from './useWheelListener.ts';

/** The chart, what it is fitted to, and which gestures it answers. */
export interface ChartZoomOptions
  extends ChartWindowOptions, ChartGestureReports {
  /** The SVG the gestures are made on, as it was handed to its `ref`. */
  svgRef: RefObject<SVGSVGElement | null>;
  /**
   * How the y axis behaves under a gesture — where its baseline is, and whether
   * that baseline is held in the window.
   * @default a stick spectrum's: a baseline of zero, always kept
   */
  yAxis?: YAxisRules;
  /**
   * Which gestures the chart answers: what a drag asks for, and whether the
   * wheel scales the value axis at all.
   *
   * Both together rather than one at a time, because they are one decision. A
   * viewer that reads its data in more than one way — an infrared spectrum is
   * read as absorbance or as percent transmittance — settles the whole set from
   * whatever it is currently reading, and hands it over as it stands.
   * @default every gesture: a drag along the horizontal axis, and the wheel
   */
  gestures?: ZoomGestures;
}

/** The window, the drag being made in it, and how to work both. */
export interface ChartZoom {
  /** What the chart is showing. */
  domain: ChartDomain;
  /**
   * The horizontal axis, as every gesture was measured against it: **draw with
   * this rather than building one**, since a second scale beside it is a second
   * chance to get a reversed axis the wrong way round.
   */
  xScale: ChartScale;
  /** The vertical axis, likewise. */
  yScale: ChartScale;
  /** The drag being made, `null` when none is. */
  selection: ZoomSelection | null;
  /** Put the window back to everything that is drawn. */
  reset: () => void;
  /** Put on the SVG. */
  handlers: ChartZoomHandlers;
}

/**
 * Zoom a chart by dragging it, by the wheel and by double clicking it.
 *
 * Which window is on screen — the fit, the one a gesture arrived at, or the one
 * a host imposes — is `useChartWindow`. What is here is what a gesture *is*: the
 * drag as it is made, the rules it is read under, and the answer it comes to.
 * @param options - The chart, the fit and how its y axis behaves.
 * @returns The window and the gestures that move it.
 */
export function useChartZoom(options: ChartZoomOptions): ChartZoom {
  const {
    fitted,
    fitKey,
    yFitKey,
    svgRef,
    plot,
    yAxis,
    gestures,
    reverseX = false,
    domain: imposed = null,
    onSelectRange,
    onClick,
    shouldStartDrag,
  } = options;

  const { domain, xScale, yScale, show, reset } = useChartWindow({
    fitted,
    fitKey,
    ...(yFitKey === undefined ? {} : { yFitKey }),
    plot,
    domain: imposed,
    reverseX,
  });

  // Taken apart field by field rather than depending on the object, so a viewer
  // rebuilding an equal `yAxis` or `gestures` on every render does not rebuild
  // the rules and every callback hanging off them. Every field has to be listed
  // here: one left out silently falls back to its default, which is how a
  // transmittance chart came to answer a mass spectrum's question about its own
  // baseline.
  const baseline = yAxis?.baseline;
  const keepBaseline = yAxis?.keepBaseline;
  const pointsDown = yAxis?.pointsDown;
  const dragMode = gestures?.drag ?? DEFAULT_ZOOM_GESTURES.drag;
  const wheel = gestures?.wheel ?? DEFAULT_ZOOM_GESTURES.wheel;
  const rules = useMemo<ZoomRules>(
    () => ({ baseline, keepBaseline, pointsDown, drag: dragMode }),
    [baseline, keepBaseline, pointsDown, dragMode],
  );

  const [drag, setDrag] = useState<Drag | null>(null);

  const onWheel = useCallback(
    (event: WheelEvent) => {
      // Refused before the event is touched, so a chart that does not answer the
      // wheel scrolls the page under the pointer exactly as the rest of it does.
      // Swallowing the gesture and doing nothing with it would be the one
      // outcome nobody asked for.
      if (!wheel) return;
      const factor = chartWheelFactor(event.deltaY, event.deltaMode);
      if (factor === 1) return;
      // Heard non-passively for exactly this: without the refusal the chart
      // zooms and the page scrolls out from under it at the same time.
      event.preventDefault();
      show(scaledYAxis(domain, factor, rules.baseline));
    },
    [domain, rules.baseline, wheel, show],
  );
  useWheelListener(svgRef, onWheel);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const started = startedDrag(event, svgRef.current, shouldStartDrag);
      if (started !== null) setDrag(started);
    },
    [svgRef, shouldStartDrag],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const moved = draggedTo(drag, event, svgRef.current);
      if (moved !== null) setDrag(moved);
    },
    [drag, svgRef],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (drag?.pointerId !== event.pointerId) return;
      releaseDrag(event);
      setDrag(null);
      const released = draggedTo(drag, event, svgRef.current) ?? drag;
      const next = answeredRelease(
        domain,
        released,
        plot,
        xScale,
        yScale,
        rules,
        { onSelectRange, onClick },
        // Read off the release rather than off the press, because that is where
        // the reader was looking and what `reportClick` already inverts.
        { shift: event.shiftKey, alt: event.altKey },
      );
      if (next !== null) show(next);
    },
    [
      drag,
      domain,
      plot,
      xScale,
      yScale,
      svgRef,
      rules,
      onSelectRange,
      onClick,
      show,
    ],
  );

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (drag?.pointerId !== event.pointerId) return;
      releaseDrag(event);
      setDrag(null);
    },
    [drag],
  );

  const selection = useMemo(
    () => zoomSelection(drag, yScale, rules),
    [drag, yScale, rules],
  );

  return {
    domain,
    xScale,
    yScale,
    selection,
    reset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onDoubleClick: reset,
    },
  };
}

export { type ChartZoomHandlers } from './chartGestures.ts';
