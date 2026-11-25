import type { PointerEvent as ReactPointerEvent } from 'react';
import { useRef, useState } from 'react';

import { atLeastSpan } from '../core/binSteps.ts';
import type { ZoomRules } from '../core/chartDomain.ts';
import { chartValue } from '../core/chartScale.ts';
import { chartWheelFactor, chartZoomDomain } from '../core/chartViewport.ts';
import type { ChartPoint } from '../core/svgPoint.ts';
import { svgPointAt } from '../core/svgPoint.ts';
import type { ZoomSelection } from '../core/zoomDomain.ts';
import { zoomSelection } from '../core/zoomDomain.ts';

import type { ChartFrameRender, ChartFrameSvgProps } from './ChartFrame.tsx';
import type { Drag } from './chartGestures.ts';
import {
  answeredRelease,
  draggedTo,
  releaseDrag,
  startedDrag,
} from './chartGestures.ts';
import { isInsidePlot } from './useChartPointer.ts';
import { useWheelListener } from './useWheelListener.ts';

/** What {@link useBinGestures} works with. */
export interface BinGestureOptions {
  /** The frame the bins are drawn in, its axes as drawn now. */
  frame: ChartFrameRender;
  /** The bins' whole range along the horizontal axis. */
  full: readonly [number, number];
  /** The part of it shown. */
  window: readonly [number, number];
  /** The narrowest window a zoom reaches. */
  narrowest: number;
  /** Called with a window a gesture asks for; without it nothing zooms. */
  onWindowChange: ((window: [number, number]) => void) | undefined;
  /** Called with a range dragged across the bins; with it a drag selects instead of zooming. */
  onSelectRange: ((range: [number, number]) => void) | undefined;
  /** Called with the value under the pointer resting over the plot, `null` once it leaves it. */
  onHover: ((value: number | null) => void) | undefined;
  /**
   * Called with the value a press or a drag across the plot points at, kept
   * inside the window — a press over the axis's numbers under the plot
   * included, the value being read along x alone; with it a drag picks a
   * value instead of zooming or selecting.
   */
  onPickValue: ((value: number) => void) | undefined;
  /** Called when the pointer that picked a value is let go. */
  onPickEnd: (() => void) | undefined;
}

/** What {@link useBinGestures} gives the chart. */
export interface BinGestures {
  /** What the frame's SVG takes. */
  svgProps: ChartFrameSvgProps;
  /** The range being dragged, for `SelectionRect`; `null` when none is. */
  selection: ZoomSelection | null;
  /** Where the pointer rests over the plot, SVG pixels; `null` off it or while it drags. */
  pointer: ChartPoint | null;
}

/**
 * The gestures of a bin chart, made of the family's chart gestures: a drag
 * across the plot zooms its horizontal axis to the range swept — or reports
 * that range, for a chart that selects with it, or the value under the
 * pointer all along, for a chart that picks one — Ctrl or ⌘ with the wheel
 * zooms about the value under the pointer (the plain wheel still scrolls the
 * page), and a double click shows the whole range again; the pointer resting
 * over the plot is reported for a readout.
 * @param options - See {@link BinGestureOptions}.
 * @returns The SVG's props, the drag and the pointer.
 */
export function useBinGestures(options: BinGestureOptions): BinGestures {
  const { frame, full, window, narrowest, onWindowChange, onSelectRange } =
    options;
  const { onHover, onPickValue, onPickEnd } = options;
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [pointer, setPointer] = useState<ChartPoint | null>(null);
  const { plot, x: xScale, y: yScale, yAxis } = frame;
  const counts: [number, number] = [yAxis.domain[0], yAxis.domain[1]];
  const rules: ZoomRules = {
    drag: onSelectRange === undefined ? 'xAxis' : 'select',
    baseline: counts[0],
    keepBaseline: true,
  };
  const zoomTo = (next: readonly [number, number]) =>
    onWindowChange?.(atLeastSpan(next, narrowest, full));

  useWheelListener(svg, (event) => {
    if (onWindowChange === undefined) return;
    if (!event.ctrlKey && !event.metaKey) return;
    const factor = chartWheelFactor(event.deltaY, event.deltaMode);
    if (factor === 1) return;
    event.preventDefault();
    const point = svgPointAt(svg.current, event.clientX, event.clientY);
    const anchor =
      point === null
        ? (window[0] + window[1]) / 2
        : chartValue(xScale, point.x);
    zoomTo(chartZoomDomain(full, window, anchor, factor));
  });

  const hover = (event: ReactPointerEvent<SVGSVGElement>) => {
    const point = svgPointAt(svg.current, event.clientX, event.clientY);
    const over = point !== null && isInsidePlot(plot, point) ? point : null;
    setPointer(over);
    onHover?.(over === null ? null : chartValue(xScale, over.x));
  };
  const picked = (to: number) =>
    onPickValue?.(
      Math.min(window[1], Math.max(window[0], chartValue(xScale, to))),
    );
  // A chart that picks one value reads it along x alone, so a press on the
  // strip under its plot, over the axis's numbers, picks too.
  const takesPress = (point: ChartPoint) =>
    onPickValue === undefined
      ? isInsidePlot(plot, point)
      : point.x >= plot.left && point.x <= plot.right;
  const press = (event: ReactPointerEvent<SVGSVGElement>) => {
    const started = startedDrag(event, svg.current, takesPress);
    if (started === null) return;
    setPointer(null);
    setDrag(started);
    picked(started.fromX);
  };
  const release = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (drag?.pointerId !== event.pointerId) return;
    releaseDrag(event);
    setDrag(null);
    if (onPickValue !== undefined) {
      onPickEnd?.();
      return;
    }
    const released = draggedTo(drag, event, svg.current) ?? drag;
    const next = answeredRelease(
      { x: [window[0], window[1]], y: counts },
      released,
      plot,
      xScale,
      yScale,
      rules,
      onSelectRange === undefined ? {} : { onSelectRange },
    );
    if (next !== null) zoomTo(next.x);
  };
  const cancel = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (drag?.pointerId !== event.pointerId) return;
    releaseDrag(event);
    setDrag(null);
    if (onPickValue !== undefined) onPickEnd?.();
  };
  const dragging =
    onSelectRange !== undefined ||
    onWindowChange !== undefined ||
    onPickValue !== undefined;
  const svgProps: ChartFrameSvgProps = {
    ref: svg,
    cursor: picking(onPickValue, dragging),
    onPointerMove: (event) => {
      const moved = draggedTo(drag, event, svg.current);
      if (moved === null) {
        hover(event);
      } else {
        setDrag(moved);
        picked(moved.toX);
      }
    },
    onPointerLeave: () => {
      setPointer(null);
      onHover?.(null);
    },
    ...(dragging
      ? {
          onPointerDown: press,
          onPointerUp: release,
          onPointerCancel: cancel,
          onLostPointerCapture: cancel,
        }
      : {}),
    ...(onWindowChange === undefined
      ? {}
      : { onDoubleClick: () => onWindowChange([full[0], full[1]]) }),
  };
  return {
    svgProps,
    selection:
      onPickValue === undefined ? zoomSelection(drag, yScale, rules) : null,
    pointer: drag === null ? pointer : null,
  };
}

/**
 * The cursor over a bin chart: a value picked along the axis, a range swept,
 * or nothing to drag.
 * @param onPickValue - What a picked value is handed to, when the chart picks one.
 * @param dragging - Whether a drag does anything.
 * @returns The cursor.
 */
function picking(
  onPickValue: ((value: number) => void) | undefined,
  dragging: boolean,
): 'ew-resize' | 'crosshair' | undefined {
  if (onPickValue !== undefined) return 'ew-resize';
  return dragging ? 'crosshair' : undefined;
}
