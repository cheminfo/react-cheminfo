import type { RefObject } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { chartAxisScale } from '../../chart/core/chartAxisScale.ts';
import type { ChartViewport } from '../../chart/core/chartViewport.ts';
import { chartZoomViewport } from '../../chart/core/chartViewport.ts';
import type { ChartAxisSpec } from '../../chart/ui/ChartFrame.tsx';
import { useWheelZoom } from '../../chart/ui/useWheelZoom.ts';
import { pointsWithinBounds } from '../core/screenPoints.ts';

import type { ScatterPlotView } from './scatterPlotModel.ts';
import { scatterPlotGeometry } from './scatterPlotModel.ts';

/** What {@link useScatterFrame} needs. */
export interface ScatterFrameOptions {
  /** Horizontal coordinate of every point, in data units. */
  x: ArrayLike<number>;
  /** Vertical coordinate, in the same order. */
  y: ArrayLike<number>;
  /** Total width of the figure, in pixels. */
  width: number;
  /** Total height. */
  height: number;
  /** The horizontal axis, covering everything there is to show. */
  xAxis: ChartAxisSpec;
  /** The vertical axis. */
  yAxis: ChartAxisSpec;
  /**
   * The frame showing, when the caller owns it; `null` shows the whole of both
   * axes. Present, it wins on every render, the same way `selected` does.
   * @default undefined — the hook keeps the frame itself
   */
  viewport?: ChartViewport | null;
  /**
   * Called with the frame a gesture asks for, and with `null` when it has
   * reached back out to the whole of the data.
   * @default undefined
   */
  onViewportChange?: (viewport: ChartViewport | null) => void;
  /**
   * Whether the wheel zooms, once the pointer has rested over the plot.
   * @default false
   */
  wheelZoom?: boolean;
  /**
   * How long it has to rest first, in milliseconds.
   * @default CHART_WHEEL_DWELL
   */
  wheelZoomDelay?: number;
}

/** Where a scatter's data lands, and the frame it landed in. */
export interface ScatterFrame extends ScatterPlotView {
  /** The horizontal axis as it should be drawn, zoom included. */
  xAxis: ChartAxisSpec;
  /** The vertical one. */
  yAxis: ChartAxisSpec;
  /** The frame showing, or `null` when the whole of both axes is. */
  viewport: ChartViewport | null;
  /**
   * One entry per point, a zero for a point outside the frame, or `undefined`
   * when every point is inside it — which is what an unzoomed plot hands the
   * hit tests, so that the common case allocates nothing.
   */
  inside: Uint8Array | undefined;
  /** Goes on the surface the gestures land on, which is what the wheel is caught over. */
  ref: RefObject<SVGRectElement | null>;
  /** Put the frame back around everything — what a double click does. */
  reset: () => void;
}

/**
 * The rectangle a scatter draws in, the mapping into it, and the zoom that
 * chose it.
 *
 * A zoom is a domain and never a transform: the frame is handed a narrower
 * range and the points, the outlines, the ticks and the hit tests are computed
 * from it exactly as they are computed unzoomed. Nothing downstream is told a
 * zoom happened, and nothing has to be.
 *
 * Two details are what make it feel right rather than merely work. The niced
 * domain is what a zoom starts from and returns to, so a wheel turned back out
 * lands on the chart the reader began with rather than a frame three percent
 * inside it. And a zoomed axis stops being niced: rounding a frame outward to
 * whole ticks would move the value the pointer is anchored on, and the reader
 * would feel the picture slip away from where they aimed it.
 * @param options - See {@link ScatterFrameOptions}.
 * @returns The frame. See {@link ScatterFrame}.
 */
export function useScatterFrame(options: ScatterFrameOptions): ScatterFrame {
  const { x, y, width, height, xAxis, yAxis } = options;
  const { viewport, onViewportChange, wheelZoom = false } = options;
  const { wheelZoomDelay } = options;

  const [own, setOwn] = useState<ChartViewport | null>(null);
  const shown = viewport === undefined ? own : viewport;

  const full = useMemo<ChartViewport>(
    () => ({ x: nicedDomain(xAxis), y: nicedDomain(yAxis) }),
    [xAxis, yAxis],
  );
  const axes = useMemo(
    () =>
      shown === null
        ? { x: xAxis, y: yAxis }
        : {
            x: { ...xAxis, domain: shown.x, nice: false },
            y: { ...yAxis, domain: shown.y, nice: false },
          },
    [shown, xAxis, yAxis],
  );
  const view = useMemo(
    () => scatterPlotGeometry(x, y, width, height, axes.x, axes.y),
    [x, y, width, height, axes],
  );

  const change = useCallback(
    (next: ChartViewport | null) => {
      if (viewport === undefined) setOwn(next);
      onViewportChange?.(next);
    },
    [onViewportChange, viewport],
  );

  const reset = useCallback(() => {
    if (shown !== null) change(null);
  }, [change, shown]);

  const zoom = useWheelZoom<SVGRectElement>({
    enabled: wheelZoom,
    delay: wheelZoomDelay,
    onZoom: (alongX, alongY, factor) => {
      const frame = shown ?? full;
      change(
        chartZoomViewport(
          full,
          shown,
          along(frame.x, alongX),
          // The vertical axis grows upward while the pointer's share grows
          // downward, so the share is read from the top of the frame.
          along(frame.y, 1 - alongY),
          factor,
        ),
      );
    },
  });

  const inside = useMemo(() => {
    if (shown === null) return undefined;
    const { points, rect } = view;
    return pointsWithinBounds(points, {
      minX: rect.x,
      minY: rect.y,
      maxX: rect.x + rect.width,
      maxY: rect.y + rect.height,
    });
  }, [shown, view]);

  return {
    ...view,
    xAxis: axes.x,
    yAxis: axes.y,
    viewport: shown,
    inside,
    ref: zoom.ref,
    reset,
  };
}

/**
 * The range an axis actually covers once it has been niced, which is the range
 * a zoom has to measure itself against.
 * @param axis - The axis as the caller asked for it.
 * @returns The domain the frame will draw.
 */
function nicedDomain(axis: ChartAxisSpec): readonly [number, number] {
  return chartAxisScale(axis.domain[0], axis.domain[1], {
    count: axis.tickCount,
    nice: axis.nice,
  }).domain;
}

/**
 * The value a share of the way along a range stands for.
 * @param domain - The range.
 * @param share - How far along, from 0 to 1.
 * @returns The value.
 */
function along(domain: readonly [number, number], share: number): number {
  return domain[0] + share * (domain[1] - domain[0]);
}
