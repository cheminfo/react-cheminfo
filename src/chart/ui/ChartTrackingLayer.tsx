/**
 * What a band chart draws: the series, the names under the slots, and the
 * crosshair saying which slot is under the pointer. The names sit in an
 * overlay because a frame clips its children to the plot, and a name goes
 * under it.
 */

import type { CSSProperties, MouseEvent, ReactElement } from 'react';
import { useRef } from 'react';

import type { ChartAxisScale } from '../core/chartAxisScale.ts';
import type { ChartBand } from '../core/chartBand.ts';
import { chartBandCenter, chartBandIndexAt } from '../core/chartBand.ts';
import type { ChartScale } from '../core/chartScale.ts';

import { ChartAxis } from './ChartAxis.tsx';
import type { ChartPlotArea } from './ChartFrame.tsx';
import type { ChartSeries, ChartTrackEvent } from './TrackedLineChart.tsx';

/** What {@link ChartTrackingLayer} needs. */
export interface ChartTrackingLayerProps {
  /** The rectangle the data is drawn in. */
  plot: ChartPlotArea;
  /** The slots the pointer is resolved against. */
  band: ChartBand;
  /** Data to pixels, vertically, which is where a marker sits. */
  y: ChartScale;
  /** One label per slot, in the slots' order. */
  categories: readonly string[];
  /** The visible series, in the order they are drawn. */
  series: readonly ChartSeries[];
  /** The slots that are named, thinned so the names cannot overlap. */
  slotAxis: ChartAxisScale;
  /** The slot the crosshair sits on, or `null` when nothing is tracked. */
  index: number | null;
  /** Called with the slot the pointer entered, and with nothing when it leaves. */
  onTrack: (index: number | null, event: ChartTrackEvent | null) => void;
  /**
   * Called when a slot is clicked or committed with Enter.
   * @default undefined
   */
  onSelect?: (index: number) => void;
  /**
   * What the horizontal axis measures, written under the names.
   * @default undefined — the axis carries no title
   */
  title?: string;
}

/**
 * The names of the slots, the crosshair, and the transparent rectangle that
 * takes the pointer.
 *
 * The rectangle covers the whole plot rather than a hit area per point, which
 * is what lets a finger track a spectrum: a two-pixel band cannot be aimed at,
 * and the nearest slot to where the finger landed is what the reader meant. It
 * lets every event through but its own, so a floating card stays clickable.
 * @param props - See {@link ChartTrackingLayerProps}.
 * @returns The layer.
 */
export function ChartTrackingLayer(
  props: ChartTrackingLayerProps,
): ReactElement {
  const { plot, band, y, categories, series, index, onTrack, onSelect } = props;
  const { slotAxis, title } = props;
  const entered = useRef<number | null>(null);
  const slot = index ?? -1;
  const tracked = slot >= 0 && slot < band.count;
  const at = tracked ? chartBandCenter(band, slot) : 0;
  const crosshair = `M${at} ${plot.top}V${plot.bottom}`;

  function report(found: number, x: number, pointer: number): void {
    entered.current = found;
    onTrack(found, {
      index: found,
      label: categories[found] ?? '',
      x,
      y: pointer,
      values: series.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.values[found] ?? Number.NaN,
        color: item.color,
      })),
    });
  }

  function move(event: MouseEvent<SVGRectElement>): void {
    const box = event.currentTarget.getBoundingClientRect();
    const across = box.width === 0 ? 1 : plot.width / box.width;
    const down = box.height === 0 ? 1 : plot.height / box.height;
    const x = plot.left + (event.clientX - box.left) * across;
    const found = chartBandIndexAt(band, x);
    if (found === -1 || found === entered.current) return;
    const height = plot.top + (event.clientY - box.top) * down;
    report(found, chartBandCenter(band, found), height);
  }

  function leave(): void {
    if (entered.current === null) return;
    entered.current = null;
    onTrack(null, null);
  }

  function commit(): void {
    if (entered.current !== null) onSelect?.(entered.current);
  }

  function keys(event: { key: string; preventDefault: () => void }): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (tracked) onSelect?.(slot);
  }

  return (
    <svg width="100%" height="100%" style={LAYER_STYLE}>
      <ChartAxis
        orientation="bottom"
        scale={slotAxis}
        pixels={{ offset: band.offset, factor: band.step }}
        plot={plot}
        label={title}
        layer="axis"
        showGrid={false}
      />
      {tracked ? <path d={crosshair} style={CROSSHAIR_STYLE} /> : null}
      {tracked ? markers(series, slot, at, y) : null}
      <rect
        x={plot.left}
        y={plot.top}
        width={plot.width}
        height={plot.height}
        fill="transparent"
        style={SLIDER_STYLE}
        tabIndex={0}
        role="button"
        aria-label={
          tracked
            ? `Measurement ${categories[slot]}`
            : (title ?? 'Measurements')
        }
        onPointerDown={move}
        onPointerMove={move}
        onPointerLeave={leave}
        onClick={commit}
        onKeyDown={keys}
      />
    </svg>
  );
}

function markers(
  series: readonly ChartSeries[],
  slot: number,
  at: number,
  y: ChartScale,
): ReactElement {
  const dots: ReactElement[] = [];
  for (const item of series) {
    const value = item.values[slot];
    if (value === undefined || !Number.isFinite(value)) continue;
    const cy = round(y.offset + value * y.factor);
    dots.push(
      <circle key={item.id} cx={at} cy={cy} r={3.5} fill={item.color} />,
    );
  }
  return (
    <g stroke="var(--surface)" strokeWidth={1.5}>
      {dots}
    </g>
  );
}

const LAYER_STYLE = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
} as const satisfies CSSProperties;

const SLIDER_STYLE = {
  pointerEvents: 'auto',
  touchAction: 'none',
  cursor: 'crosshair',
} as const satisfies CSSProperties;

const CROSSHAIR_STYLE = {
  stroke: 'var(--border-strong)',
  strokeWidth: 1,
  strokeDasharray: '3 3',
} as const satisfies CSSProperties;

const round = (value: number): number => Math.round(value * 100) / 100;
