import type { ReactElement, ReactNode } from 'react';
import { useId } from 'react';

import { OverlayLayer } from '../../overlay/ui/OverlayLayer.tsx';
import type { ChartAxisScale } from '../core/chartAxisScale.ts';
import { chartAxisScale } from '../core/chartAxisScale.ts';
import type { ChartScale } from '../core/chartScale.ts';
import { chartScale } from '../core/chartScale.ts';

import { ChartAxis } from './ChartAxis.tsx';
import {
  CHART_SVG_STYLE,
  chartFrameStyle,
  chartOuterRoom,
  chartPlotArea,
} from './chartStyles.ts';

/** How one axis of a {@link ChartFrame} is drawn. */
export interface ChartAxisSpec {
  /** The data range the axis covers, before nicing. */
  domain: readonly [number, number];
  /**
   * The axis title, already carrying its share — build it with
   * `chartAxisTitle`. Any power of ten the labels were divided by is appended
   * by the frame itself.
   * @default undefined — the axis carries no title and its margin shrinks
   */
  label?: string;
  /**
   * Roughly how many ticks to aim for.
   * @default 5
   */
  tickCount?: number;
  /**
   * Whether to rule the plot at every tick.
   * @default true
   */
  showGrid?: boolean;
  /**
   * Whether the tick marks and their labels are drawn. An inner cell of a pair
   * grid turns them off and keeps the grid.
   * @default true
   */
  showTicks?: boolean;
  /**
   * Whether the domain is widened outward to whole tick steps.
   * @default true
   */
  nice?: boolean;
}

/** The rectangle the data is drawn in, in SVG pixels. */
export interface ChartPlotArea {
  /** Left edge. */
  left: number;
  /** Top edge. */
  top: number;
  /** Right edge. */
  right: number;
  /** Bottom edge. */
  bottom: number;
  /** Width. */
  width: number;
  /** Height. */
  height: number;
}

/** Room left around the plot, in pixels. */
export interface ChartMargins {
  /** Above the plot. */
  top: number;
  /** To the right of it. */
  right: number;
  /** Below it, where the horizontal axis is written. */
  bottom: number;
  /** To its left, where the vertical axis is written. */
  left: number;
}

/** What a {@link ChartFrame} hands the function that draws inside it. */
export interface ChartFrameRender {
  /** The rectangle to draw in. */
  plot: ChartPlotArea;
  /** Data to pixels, horizontally. */
  x: ChartScale;
  /** Data to pixels, vertically; its `factor` is negative. */
  y: ChartScale;
  /** The horizontal axis as it was niced. */
  xAxis: ChartAxisScale;
  /** The vertical axis as it was niced. */
  yAxis: ChartAxisScale;
}

/** What {@link ChartFrame} needs. */
export interface ChartFrameProps {
  /** Total width, in pixels, normally from `useContainerSize`. */
  width: number;
  /** Total height. */
  height: number;
  /** The horizontal axis. */
  x: ChartAxisSpec;
  /** The vertical axis. */
  y: ChartAxisSpec;
  /**
   * What is drawn inside the plot, clipped to it: marks, outlines, a tracking
   * rectangle, in the order they should stack.
   */
  children: (frame: ChartFrameRender) => ReactNode;
  /**
   * What floats over the chart in HTML rather than SVG — an `OverlayBar`, a
   * legend, a readout. It is wrapped in an `OverlayLayer`, so it is not
   * clipped, not scaled, and lets every pointer event through except on the
   * cards themselves.
   * @default undefined
   */
  overlay?: ReactNode;
  /**
   * Whether the figure is repainting, which the overlay reads to drop its
   * backdrop blur for a flat fill while a lasso is being dragged.
   * @default false
   */
  busy?: boolean;
  /**
   * What a screen reader is told the chart shows. Without it the chart is
   * decoration and is hidden from the reader.
   * @default '' — the chart is hidden from a screen reader
   */
  label?: string;
  /**
   * Room left around the plot, merged over the defaults — which already shrink
   * when an axis carries no title.
   * @default {}
   */
  margins?: Partial<ChartMargins>;
  /**
   * Value of the `data-testid` attribute of the wrapper, for the end-to-end
   * tests.
   * @default undefined
   */
  testId?: string;
}

/**
 * The frame every chart in the family is drawn in: a plot rectangle, two
 * niced axes, a clip, and a layer of floating chrome over the top.
 *
 * The grid goes down before the caller's marks and the axes go over them, so
 * a rule never crosses a point and a tick is never buried under one. The clip
 * is keyed on a generated id: two frames on a page would otherwise share one,
 * and the second would silently steal the first's.
 * @param props - See {@link ChartFrameProps}.
 * @returns The chart.
 */
export function ChartFrame(props: ChartFrameProps): ReactElement {
  const {
    width,
    height,
    x,
    y,
    children,
    overlay,
    busy = false,
    label = '',
    margins = {},
    testId,
  } = props;
  const clipId = useId();

  const xAxis = chartAxisScale(x.domain[0], x.domain[1], {
    count: x.tickCount,
    nice: x.nice,
  });
  const yAxis = chartAxisScale(y.domain[0], y.domain[1], {
    count: y.tickCount,
    nice: y.nice,
  });

  const plot = chartPlotArea(width, height, margins, {
    bottom: chartOuterRoom('bottom', x, xAxis),
    left: chartOuterRoom('left', y, yAxis),
  });

  const horizontal = {
    orientation: 'bottom',
    scale: xAxis,
    pixels: chartScale(xAxis.domain[0], xAxis.domain[1], plot.left, plot.right),
    plot,
    label: x.label,
    showGrid: x.showGrid,
    showTicks: x.showTicks ?? true,
  } as const;
  const vertical = {
    orientation: 'left',
    scale: yAxis,
    pixels: chartScale(yAxis.domain[0], yAxis.domain[1], plot.bottom, plot.top),
    plot,
    label: y.label,
    showGrid: y.showGrid,
    showTicks: y.showTicks ?? true,
  } as const;
  const frame: ChartFrameRender = {
    plot,
    x: horizontal.pixels,
    y: vertical.pixels,
    xAxis,
    yAxis,
  };

  return (
    <div
      className="chart-frame"
      style={chartFrameStyle(width, height)}
      data-testid={testId}
    >
      <svg
        width={Math.max(0, width)}
        height={Math.max(0, height)}
        style={CHART_SVG_STYLE}
        role={label === '' ? undefined : 'img'}
        aria-label={label === '' ? undefined : label}
        aria-hidden={label === '' ? true : undefined}
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x={plot.left}
              y={plot.top}
              width={plot.width}
              height={plot.height}
            />
          </clipPath>
        </defs>
        <ChartAxis {...horizontal} layer="grid" />
        <ChartAxis {...vertical} layer="grid" />
        <g clipPath={`url(#${clipId})`}>{children(frame)}</g>
        <ChartAxis {...horizontal} layer="axis" />
        <ChartAxis {...vertical} layer="axis" />
      </svg>
      {overlay === undefined ? null : (
        <OverlayLayer width={width} busy={busy}>
          {overlay}
        </OverlayLayer>
      )}
    </div>
  );
}
