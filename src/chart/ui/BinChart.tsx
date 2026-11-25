import type { ReactElement, ReactNode } from 'react';

import type { OverlayReadoutRow } from '../../overlay/ui/OverlayReadout.tsx';
import { OverlayReadout } from '../../overlay/ui/OverlayReadout.tsx';
import type { BinScale, BinSeries } from '../core/binSteps.ts';
import {
  BIN_LOG_FLOOR,
  binAt,
  binSteps,
  binsInWindow,
} from '../core/binSteps.ts';
import { chartPixel, chartValue } from '../core/chartScale.ts';
import { areaPath } from '../core/tracePath.ts';

import type {
  ChartAxisSpec,
  ChartFrameRender,
  ChartMargins,
} from './ChartFrame.tsx';
import { ChartFrame } from './ChartFrame.tsx';
import { SelectionRect } from './SelectionRect.tsx';
import { chartFrameGeometry } from './chartFrameGeometry.ts';
import { useBinGestures } from './useBinGestures.ts';

/** What the card of the bin under the pointer says. */
export interface BinReadout {
  /** Its title: the values the bin holds. */
  title: string;
  /** Its rows: the count, and anything else the host knows of the bin. */
  rows: readonly OverlayReadoutRow[];
}

/** What {@link BinChart} draws. */
export interface BinChartProps {
  /** The histogram: its edges and its counts. */
  series: BinSeries;
  /** Width, CSS pixels. */
  width: number;
  /** Height, CSS pixels. */
  height: number;
  /** The horizontal axis: its title and how its ticks are written. */
  x: Omit<ChartAxisSpec, 'domain'>;
  /**
   * The vertical axis, the counts.
   * @default {}
   */
  y?: Omit<ChartAxisSpec, 'domain'>;
  /**
   * The counts read linearly, or on a log scale so rare values show.
   * @default 'linear'
   */
  scale?: BinScale;
  /**
   * The part of the horizontal axis shown.
   * @default the bins' whole range
   */
  window?: readonly [number, number];
  /**
   * The narrowest window a zoom reaches, in the axis's units.
   * @default 0
   */
  narrowest?: number;
  /**
   * Called with the window a drag, Ctrl or ⌘ with the wheel, or a double
   * click asks for.
   * @default undefined — the window stays as it is
   */
  onWindowChange?: (window: [number, number]) => void;
  /**
   * Called with a range dragged across the bins, low end first: a drag then
   * selects rather than zooms.
   * @default undefined — a drag zooms, when the window can be zoomed
   */
  onSelectRange?: (range: [number, number]) => void;
  /**
   * A range shaded across the plot: the one selected.
   * @default null
   */
  shaded?: readonly [number, number] | null;
  /**
   * What the card of the bin under the pointer says.
   * @default undefined — no card
   */
  readout?: (bin: number) => BinReadout | null;
  /**
   * Called with the bin under the pointer, -1 when it leaves the bins.
   * @default undefined
   */
  onHoverBin?: (bin: number) => void;
  /**
   * Called with the value a press or a drag across the plot points at, kept
   * inside the window: a drag then picks a value — a threshold over its
   * histogram — rather than zooming or selecting.
   * @default undefined — a drag zooms or selects
   */
  onPickValue?: (value: number) => void;
  /**
   * Called when the pointer that picked a value is let go.
   * @default undefined
   */
  onPickEnd?: () => void;
  /**
   * Room left around the plot, merged over the frame's defaults: a strip
   * that writes no count keeps no margin for one.
   * @default {}
   */
  margins?: Partial<ChartMargins>;
  /**
   * Marks drawn over the bins, clipped to the plot: bins lit or selected.
   * @default undefined
   */
  marks?: (frame: ChartFrameRender) => ReactNode;
  /**
   * The ink of the bins: the accent, or the family's greys.
   * @default 'muted'
   */
  tone?: 'accent' | 'muted';
  /**
   * Whether the chart scales down with the box it is placed in: a still
   * chart in a document read on a phone.
   * @default false
   */
  scalable?: boolean;
  /**
   * What a screen reader is told the chart shows.
   * @default '' — the chart is hidden from a screen reader
   */
  label?: string;
  /**
   * Value of the wrapper's `data-testid`.
   * @default undefined
   */
  testId?: string;
}

/**
 * A histogram as the family draws one: its bins as one stepped area on a
 * `ChartFrame`, counts linear or log, a window of the horizontal axis zoomed
 * by a drag, Ctrl or ⌘ with the wheel and a double click (`useBinGestures`)
 * — only the bins inside it drawn, the counts' axis fitted to them —, a
 * range selected by a drag instead when the host asks for one, and a card
 * for the bin under the pointer.
 * @param props - See {@link BinChartProps}.
 * @returns The chart.
 */
export function BinChart(props: BinChartProps): ReactElement {
  const { series, width, height, x, y = {}, scale = 'linear' } = props;
  const { narrowest = 0, shaded = null, tone = 'muted', label = '' } = props;
  const { onWindowChange, onSelectRange, readout, onHoverBin } = props;
  const { onPickValue, onPickEnd, marks, testId, margins = {} } = props;
  const { scalable = false } = props;
  const { edges } = series;
  const full: [number, number] = [edges[0] as number, edges.at(-1) as number];
  const window = props.window ?? full;
  const steps = binSteps(series, binsInWindow(edges, window), scale);
  const frame = chartFrameGeometry(
    width,
    height,
    { ...x, domain: window, nice: x.nice ?? false },
    {
      ...y,
      domain: [scale === 'log' ? BIN_LOG_FLOOR : 0, steps.peak],
      nice: y.nice ?? true,
    },
    margins,
  );
  const gestures = useBinGestures({
    frame,
    full,
    window,
    narrowest,
    onWindowChange,
    onSelectRange,
    onHover:
      onHoverBin === undefined
        ? undefined
        : (value) => onHoverBin(value === null ? -1 : binAt(edges, value)),
    onPickValue,
    onPickEnd,
  });
  const at = gestures.pointer;
  const bin = at === null ? -1 : binAt(edges, chartValue(frame.x, at.x));
  const card = bin < 0 || readout === undefined ? null : readout(bin);
  const ink = tone === 'accent' ? INK.accent : INK.muted;
  return (
    <ChartFrame
      width={width}
      height={height}
      x={{ ...x, domain: window }}
      y={{ ...y, domain: frame.yAxis.domain }}
      geometry={frame}
      margins={margins}
      svgProps={gestures.svgProps}
      label={label}
      testId={testId}
      scalable={scalable}
      overlay={
        card === null || at === null ? undefined : (
          <OverlayReadout
            x={at.x}
            y={at.y}
            boxWidth={width}
            boxHeight={height}
            title={card.title}
            rows={card.rows}
            testId="bin-chart-card"
          />
        )
      }
    >
      {(drawn) => (
        <>
          <path
            d={areaPath(steps.x, steps.y, drawn.x, drawn.y)}
            fill={ink.fill}
            fillOpacity={ink.fillOpacity}
            stroke={ink.stroke}
            strokeWidth={1}
          />
          {marks?.(drawn)}
          {shaded === null ? null : (
            <rect
              x={chartPixel(drawn.x, Math.min(shaded[0], shaded[1]))}
              width={Math.abs(
                chartPixel(drawn.x, shaded[1]) - chartPixel(drawn.x, shaded[0]),
              )}
              y={drawn.plot.top}
              height={drawn.plot.height}
              fill="var(--accent)"
              fillOpacity={0.15}
              stroke="var(--accent)"
            />
          )}
          <SelectionRect selection={gestures.selection} plot={drawn.plot} />
        </>
      )}
    </ChartFrame>
  );
}

/** The bins' ink: the accent for a chart that is the panel's subject, the greys for one that is read beside a table. */
const INK = {
  accent: { fill: 'var(--accent)', fillOpacity: 0.35, stroke: 'var(--accent)' },
  muted: {
    fill: 'var(--text-faint)',
    fillOpacity: 0.5,
    stroke: 'var(--text-muted)',
  },
} as const;
