/**
 * The four gestures that move the window, and the one thing the chart does hold.
 *
 * That one thing is the drag currently under the hand, and it is held here
 * because it is not a window: it is a gesture in progress, it lives for as long
 * as a button is down, and no host could store it usefully. Everything it
 * produces* leaves immediately through `onDomainChange`.
 *
 * A drag frames an energy range, shift-drag slides the window under the hand,
 * the wheel scales the counts axis and a double click hands back `null` — which
 * is how the chart says "fit everything again", the only sentence it has for it,
 * since the one thing it is ever told is a window. What each gesture works out
 * is the shared chart's `zoomDomain.ts` read under `XPS_ZOOM_RULES`, and the pan
 * is `xpsZoom.ts`; neither knows anything of React.
 */

import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartValue } from '../../chart/core/chartScale.ts';
import { chartWheelFactor } from '../../chart/core/chartViewport.ts';
import { svgPointAt } from '../../chart/core/svgPoint.ts';
import type { DragBox, ZoomSelection } from '../../chart/core/zoomDomain.ts';
import {
  MINIMUM_DRAG,
  scaledYAxis,
  zoomSelection,
  zoomedDomain,
} from '../../chart/core/zoomDomain.ts';
import { useWheelListener } from '../../chart/ui/useWheelListener.ts';
import { bindingFromAxis } from '../core/energyAxis.ts';
import type { XpsDomain } from '../core/xpsSpectrum.ts';
import type { EnergyAxis } from '../core/xpsState.ts';
import { XPS_ZOOM_RULES, pannedDomain } from '../core/xpsZoom.ts';

/** One gesture on the SVG, as React hands it over. */
type PointerHandler = (event: ReactPointerEvent<SVGSVGElement>) => void;

/** What to spread onto the SVG for it to be worked. */
export interface XpsGestureHandlers {
  onPointerDown: PointerHandler;
  onPointerMove: PointerHandler;
  onPointerUp: PointerHandler;
  onPointerCancel: PointerHandler;
  onDoubleClick: () => void;
}

export interface XpsGesturesOptions {
  /** The SVG the gestures are made on, as it was handed to its `ref`. */
  svgRef: RefObject<SVGSVGElement | null>;
  /** Where the plot sits inside that SVG, which the axes are laid over. */
  plot: PlotRect;
  /** The window on screen, which every gesture is measured against. */
  domain: XpsDomain;
  /** The energy axis as it is currently zoomed. */
  xScale: ChartScale;
  /** The counts axis as it is currently zoomed. */
  yScale: ChartScale;
  /** The axis the chart is drawn against. */
  axis: EnergyAxis;
  /**
   * The photon energy a click is converted back to binding energy with.
   * @default null
   */
  sourceEnergy?: number | null;
  /** Told the window a gesture asked for, `null` to fit everything again. */
  onDomainChange: (domain: XpsDomain | null) => void;
  /**
   * Told the binding energy of a click that was not a drag.
   * @default undefined
   */
  onPickEnergy?: (bindingEnergy: number | null) => void;
}

/** The drag being made, and how to work the chart. */
export interface XpsGestures {
  /** The drag being made, `null` when none is. */
  selection: ZoomSelection | null;
  /** Put on the SVG. */
  handlers: XpsGestureHandlers;
}

/**
 * Zoom, pan and reset a chart, holding nothing but the drag under the hand.
 *
 * A pan reports on every move rather than on release, because a window that
 * jumped to its new place only when the button came up would not be a pan at
 * all. Each move measures from where the previous one left off, so the travel
 * is never counted twice.
 * @param options - The chart, the window on screen and where to report to.
 * @returns The drag being made and the handlers that make it.
 */
export function useXpsGestures(options: XpsGesturesOptions): XpsGestures {
  const {
    svgRef,
    plot,
    domain,
    xScale,
    yScale,
    axis,
    sourceEnergy = null,
    onDomainChange,
    onPickEnergy,
  } = options;

  const [drag, setDrag] = useState<Drag | null>(null);

  const onWheel = useCallback(
    (event: WheelEvent) => {
      const factor = chartWheelFactor(
        event.deltaY,
        event.deltaMode,
        WHEEL_ZOOM_RATE,
      );
      if (factor === 1) return;
      // Heard non-passively for exactly this: without the refusal the chart
      // scales and the page scrolls out from under it at the same time.
      event.preventDefault();
      onDomainChange(scaledYAxis(domain, factor));
    },
    [domain, onDomainChange],
  );
  useWheelListener(svgRef, onWheel);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (event.button !== LEFT_BUTTON) return;
      const point = svgPointAt(svgRef.current, event.clientX, event.clientY);
      if (point === null) return;
      // Captured so a drag running off the plot keeps being reported, which is
      // how a window is framed right up to the edge of the data.
      event.currentTarget.setPointerCapture(event.pointerId);
      setDrag({
        pointerId: event.pointerId,
        panning: event.shiftKey,
        moved: 0,
        fromX: point.x,
        fromY: point.y,
        toX: point.x,
        toY: point.y,
      });
    },
    [svgRef],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (drag?.pointerId !== event.pointerId) return;
      const point = svgPointAt(svgRef.current, event.clientX, event.clientY);
      if (point === null) return;
      const moved = drag.moved + Math.abs(point.x - drag.toX);
      if (!drag.panning) {
        setDrag({ ...drag, moved, toX: point.x, toY: point.y });
        return;
      }
      onDomainChange(pannedDomain(domain, drag.toX, point.x, xScale));
      // The origin travels with the hand, so the next move measures the step it
      // made rather than the whole gesture over again.
      setDrag({
        ...drag,
        moved,
        fromX: point.x,
        fromY: point.y,
        toX: point.x,
        toY: point.y,
      });
    },
    [drag, svgRef, domain, xScale, onDomainChange],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (drag?.pointerId !== event.pointerId) return;
      release(event);
      setDrag(null);
      if (drag.panning) return;

      const point = svgPointAt(svgRef.current, event.clientX, event.clientY);
      const released = point === null ? drag : { ...drag, toX: point.x };
      const next = zoomedDomain(
        domain,
        released,
        plot,
        xScale,
        yScale,
        XPS_ZOOM_RULES,
      );
      if (next !== null) {
        onDomainChange(next);
        return;
      }
      // Short of a zoom the press was a click, and a click is a question about
      // the energy under it — but only when the hand stayed still enough that it
      // was not an abandoned drag.
      if (drag.moved >= MINIMUM_DRAG) return;
      const energy = chartValue(xScale, released.toX);
      onPickEnergy?.(
        Number.isFinite(energy)
          ? bindingFromAxis(energy, sourceEnergy, axis)
          : null,
      );
    },
    [
      drag,
      svgRef,
      domain,
      plot,
      xScale,
      yScale,
      axis,
      sourceEnergy,
      onDomainChange,
      onPickEnergy,
    ],
  );

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      if (drag?.pointerId !== event.pointerId) return;
      release(event);
      setDrag(null);
    },
    [drag],
  );

  const onDoubleClick = useCallback(() => {
    onDomainChange(null);
  }, [onDomainChange]);

  // A pan draws no rectangle: the axis is already following the hand.
  const selection = useMemo(
    () =>
      drag === null || drag.panning
        ? null
        : zoomSelection(drag, yScale, XPS_ZOOM_RULES),
    [drag, yScale],
  );

  return {
    selection,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onDoubleClick,
    },
  };
}

/**
 * How much of a zoom one pixel of wheel travel is, as an exponent: a notch of a
 * mouse wheel, about a hundred pixels, scales the counts by a fifth.
 */
const WHEEL_ZOOM_RATE = 0.002;

/** Which button drags; the others belong to menus. */
const LEFT_BUTTON = 0;

/** A drag as it is held, tied to the pointer that started it. */
interface Drag extends DragBox {
  /** So a second finger cannot take a drag over from the first. */
  pointerId: number;
  /** Whether shift was down when it started, which makes it a pan. */
  panning: boolean;
  /** How far the hand has travelled in all, which tells a click from a drag. */
  moved: number;
}

/**
 * Give the pointer back, so the next gesture reaches whatever it is aimed at.
 * @param event - The event ending the drag.
 */
function release(event: ReactPointerEvent<SVGSVGElement>): void {
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
}
