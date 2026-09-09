import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import type { ChartAxisScale } from '../core/chartAxisScale.ts';
import { chartAxisScale } from '../core/chartAxisScale.ts';
import type { ChartBand } from '../core/chartBand.ts';
import { chartBand } from '../core/chartBand.ts';
import {
  EMPTY_EXTENT,
  chartPadExtent,
  chartValuesExtent,
} from '../core/chartExtent.ts';
import { chartScale } from '../core/chartScale.ts';

import type { ChartAxisSpec } from './ChartFrame.tsx';
import { ChartFrame } from './ChartFrame.tsx';
import { ChartSeriesMarks } from './ChartSeriesMarks.tsx';
import { ChartTrackingLayer } from './ChartTrackingLayer.tsx';
import { chartOuterRoom, chartPlotArea } from './chartStyles.ts';

/** Whether a series is drawn as a line or as bars from the zero line. */
export type ChartSeriesKind = 'line' | 'bar';

/** One line or one set of bars. */
export interface ChartSeries {
  /** A stable id, used as the React key and named in the tracking callback. */
  id: string;
  /** What the legend calls it, e.g. `PC 1`. */
  label: string;
  /** One value per slot, in the slots' order. */
  values: ArrayLike<number>;
  /** Its colour, normally from `chartSeriesColor`. */
  color: string;
  /**
   * Whether it is drawn as a line or as bars.
   * @default 'line'
   */
  kind?: ChartSeriesKind;
  /**
   * Whether it is drawn at all — what a legend entry switches.
   * @default true
   */
  visible?: boolean;
  /**
   * Whether it is drawn faintly behind the rest, which is what the average
   * sample is in every loadings panel.
   * @default false
   */
  muted?: boolean;
}

/** Where the pointer is, and what stands under it. */
export interface ChartTrackEvent {
  /** Which slot, from 0. */
  index: number;
  /** What that slot is called. */
  label: string;
  /** The middle of the slot, in pixels from the wrapper's left. */
  x: number;
  /** The pointer's own vertical position, in pixels from the wrapper's top. */
  y: number;
  /** Every visible series' value there, in the order they are drawn. */
  values: ReadonlyArray<{
    /** The series' id. */
    id: string;
    /** What it is called. */
    label: string;
    /** Its value at this slot. */
    value: number;
    /** Its colour. */
    color: string;
  }>;
}

/** What {@link TrackedLineChart} needs. */
export interface TrackedLineChartProps {
  /** One label per slot along the horizontal axis. */
  categories: readonly string[];
  /** The series to draw. */
  series: readonly ChartSeries[];
  /** Total width, from `useContainerSize`. */
  width: number;
  /** Total height. */
  height: number;
  /**
   * The vertical axis. Its domain is read from the visible series when it is
   * left out, and includes zero whenever any series is drawn as bars.
   * @default undefined
   */
  y?: Partial<ChartAxisSpec>;
  /**
   * The horizontal axis title, e.g. `Measurement` or `Wavenumber (cm⁻¹)`.
   * @default undefined
   */
  xLabel?: string;
  /**
   * The slot the crosshair sits on, for a parent driving it from elsewhere —
   * a hovered row of a table beside the chart. Left out, the chart keeps its
   * own.
   * @default undefined
   */
  trackedIndex?: number | null;
  /**
   * Called as the pointer moves across the plot, and with `null` when it
   * leaves. It fires only when the slot under the pointer changes, but that is
   * still every few pixels, so a caller doing real work should hold the value
   * in a ref rather than in state.
   * @default undefined
   */
  onTrack?: (event: ChartTrackEvent | null) => void;
  /**
   * Called when a slot is clicked or committed with Enter, for a caller that
   * wants a measurement pinned rather than hovered.
   * @default undefined
   */
  onSelect?: (index: number) => void;
  /**
   * What floats over the chart, normally an `OverlayBar`.
   * @default undefined
   */
  overlay?: ReactNode;
  /**
   * What the axis writes under the slots it labels, one per slot. A number
   * line hands in rounded values here — `879 cm⁻¹` — while `categories` goes
   * on naming a slot in whatever the caller measured.
   * @default undefined — the axis writes the categories themselves
   */
  tickLabels?: readonly string[];
  /**
   * The most slot labels to write. Past it every nth is written so the labels
   * never overlap; the ticks themselves stay.
   * @default 24
   */
  maxTickLabels?: number;
  /**
   * What a screen reader is told the chart shows.
   * @default ''
   */
  label?: string;
  /**
   * Value of the `data-testid` attribute of the wrapper.
   * @default undefined
   */
  testId?: string;
}

/**
 * A chart of one or more series over a shared list of measurements, with a
 * crosshair that reports what stands under the pointer.
 *
 * The horizontal axis is a band rather than a number line, so finding the slot
 * under the pointer is one division instead of a search, and the same
 * component draws a spectrum as a line and a table's columns as bars.
 * @param props - See {@link TrackedLineChartProps}.
 * @returns The chart.
 */
export function TrackedLineChart(props: TrackedLineChartProps): ReactElement {
  const { categories, series, width, height, y, trackedIndex, xLabel } = props;
  const { onTrack, onSelect, overlay, label, testId, maxTickLabels } = props;
  const { tickLabels = categories } = props;
  const [ownIndex, setOwnIndex] = useState<number | null>(null);
  const drawn = series
    .filter((item) => item.visible !== false)
    .toSorted((a, b) => Number(b.muted === true) - Number(a.muted === true));
  const slots = Math.max(1, categories.length);
  const domain = y?.domain ?? seriesDomain(drawn, categories.length);
  const nicing = { count: y?.tickCount, nice: y?.nice };
  const ticks = chartAxisScale(domain[0], domain[1], nicing);
  const under: ChartAxisSpec = { domain: [0, slots], label: xLabel };
  const margins = {
    bottom: chartOuterRoom('bottom', under, { ...ticks, exponent: 0 }),
    left: chartOuterRoom('left', { ...y, domain }, ticks),
  };
  const plot = chartPlotArea(width, height, margins, margins);
  const band = chartBand(categories.length, plot.left, plot.right);
  const [low, high] = ticks.domain;

  function track(slot: number | null, event: ChartTrackEvent | null): void {
    if (trackedIndex === undefined) setOwnIndex(slot);
    onTrack?.(event);
  }

  return (
    <ChartFrame
      width={width}
      height={height}
      margins={margins}
      label={label}
      testId={testId}
      x={{ domain: [0, slots], showTicks: false, showGrid: false, nice: false }}
      y={{ ...y, domain }}
      overlay={
        <>
          <ChartTrackingLayer
            plot={plot}
            band={band}
            y={chartScale(low, high, plot.bottom, plot.top)}
            categories={categories}
            series={drawn}
            index={trackedIndex === undefined ? ownIndex : trackedIndex}
            slotAxis={slotTicks(tickLabels, band, maxTickLabels ?? 24)}
            title={xLabel}
            onTrack={track}
            onSelect={onSelect}
          />
          {overlay}
        </>
      }
    >
      {(frame) => {
        // Only the bars share a slot; a line is drawn across the whole of it.
        let bars = 0;
        for (const item of drawn) if (item.kind === 'bar') bars++;
        let lane = 0;
        return drawn.map((item) => (
          <ChartSeriesMarks
            key={item.id}
            item={item}
            band={band}
            y={frame.y}
            lane={
              item.kind === 'bar'
                ? { index: lane++, count: bars }
                : { index: 0, count: 1 }
            }
          />
        ));
      }}
    </ChartFrame>
  );
}

function seriesDomain(drawn: readonly ChartSeries[], slots: number) {
  let extent = EMPTY_EXTENT;
  let grounded = false;
  for (const item of drawn) {
    if (item.kind === 'bar') grounded = true;
    extent = chartValuesExtent(item.values, { limit: slots, into: extent });
  }
  const range = chartPadExtent(extent);
  if (!grounded) return [range.min, range.max] as const;
  return [Math.min(range.min, 0), Math.max(range.max, 0)] as const;
}

function slotTicks(
  categories: readonly string[],
  band: ChartBand,
  maxLabels: number,
): ChartAxisScale {
  let longest = 1;
  for (const text of categories) longest = Math.max(longest, text.length);
  const room = Math.max(1, band.step);
  const wide = Math.ceil((longest * LABEL_ROOM + LABEL_GAP) / room);
  const many = Math.ceil(categories.length / Math.max(1, maxLabels));
  const stride = Math.max(1, wide, many);
  const values: number[] = [];
  const labels: string[] = [];
  for (let index = 0; index < categories.length; index += stride) {
    values.push(index + 0.5);
    labels.push(categories[index] ?? '');
  }
  const domain = [0, Math.max(1, band.count)] as const;
  return { domain, values, labels, step: stride, decimals: 0, exponent: 0 };
}

const LABEL_ROOM = 6.5;
const LABEL_GAP = 10;
