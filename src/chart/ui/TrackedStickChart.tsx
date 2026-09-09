/**
 * A peak list drawn as the sticks it is, on a real number line.
 *
 * `TrackedLineChart` lays every measurement in a slot of its own and joins
 * them, which is right for a spectrum that was sampled on a grid and wrong for
 * one that was picked off it. A peak list has gaps, and the gaps are a
 * measurement: an empty stretch between m/z 526 and 725 drawn as wide as the
 * step from 206 to 252 says the run is crowded where it is bare, and a line
 * across it claims a signal at every mass in between. So the horizontal axis
 * here is the frame's own — niced ticks over the values themselves — and a
 * measurement is a stick standing where it was measured.
 *
 * A series is one `<path>` whatever its length. Ten thousand peaks are ten
 * thousand move-and-line pairs in one `d`, which paints as one node; ten
 * thousand elements would not survive the pointer. The same reasoning as the
 * pair grid's dots, and the reason a peak list of any size can be drawn here.
 *
 * The pointer is answered from one transparent rectangle over the plot rather
 * than from a hit area per stick, so a finger lands on the nearest peak rather
 * than having to hit a one-pixel line. Nearest is found by bisecting the
 * positions, which is what makes it independent of how many there are.
 */

import type { CSSProperties, MouseEvent, ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import type { ChartAxisSpec, ChartFrameRender } from './ChartFrame.tsx';
import { ChartFrame } from './ChartFrame.tsx';
import type { ChartTrackEvent } from './TrackedLineChart.tsx';
import type { ChartStickSeries } from './stickChartModel.ts';
import {
  nearestPosition,
  seriesDomain,
  spanOf,
  stickPath,
  valueAt,
} from './stickChartModel.ts';

export type { ChartStickSeries } from './stickChartModel.ts';

/** What {@link TrackedStickChart} needs. */
export interface TrackedStickChartProps {
  /**
   * Where each measurement sits, ascending, in the series' own order. It must
   * ascend: the peak under the pointer is found by bisecting it.
   */
  positions: readonly number[];
  /** One label per measurement, for the readout. */
  categories: readonly string[];
  /** The series to draw. */
  series: readonly ChartStickSeries[];
  /** Total width, from `useContainerSize`. */
  width: number;
  /** Total height. */
  height: number;
  /**
   * The vertical axis. Its domain is read from the visible series when it is
   * left out, and always includes zero, since a stick is read from there.
   * @default undefined
   */
  y?: Partial<ChartAxisSpec>;
  /**
   * The horizontal axis title, e.g. `m/z`.
   * @default undefined
   */
  xLabel?: string;
  /**
   * Which measurement the crosshair sits on. Present, the caller owns it,
   * which is how a stack of panels shows one rule across all of them.
   * @default undefined — the chart keeps its own
   */
  trackedIndex?: number | null;
  /**
   * Called with the measurement the pointer entered, and with `null` when it
   * leaves.
   * @default undefined
   */
  onTrack?: (event: ChartTrackEvent | null) => void;
  /**
   * What a screen reader is told the chart shows.
   * @default '' — the chart is hidden from a screen reader
   */
  label?: string;
  /**
   * What floats over the chart in HTML.
   * @default undefined
   */
  overlay?: ReactNode;
  /**
   * Value of the `data-testid` attribute of the wrapper.
   * @default undefined
   */
  testId?: string;
}

/**
 * Draw a peak list, and say which peak the pointer is on.
 * @param props - See {@link TrackedStickChartProps}.
 * @returns The chart.
 */
export function TrackedStickChart(props: TrackedStickChartProps): ReactElement {
  const { positions, categories, series, width, height, y, xLabel } = props;
  const { onTrack, label, overlay, testId, trackedIndex } = props;
  const [ownIndex, setOwnIndex] = useState<number | null>(null);
  const held = trackedIndex === undefined ? ownIndex : trackedIndex;

  const drawn = series
    .filter((item) => item.visible !== false)
    .toSorted((a, b) => Number(b.muted === true) - Number(a.muted === true));
  const across = spanOf(positions);
  const domain = y?.domain ?? seriesDomain(drawn, positions.length);

  function report(frame: ChartFrameRender, event: MouseEvent<SVGRectElement>) {
    const { plot, x } = frame;
    const box = event.currentTarget.getBoundingClientRect();
    const scaleX = box.width === 0 ? 1 : plot.width / box.width;
    const scaleY = box.height === 0 ? 1 : plot.height / box.height;
    const pixel = plot.left + (event.clientX - box.left) * scaleX;
    const found = nearestPosition(positions, valueAt(x, pixel));
    if (found === -1) return;
    if (trackedIndex === undefined) setOwnIndex(found);
    onTrack?.({
      index: found,
      label: categories[found] ?? '',
      x: x.offset + (positions[found] as number) * x.factor,
      y: plot.top + (event.clientY - box.top) * scaleY,
      values: drawn.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.values[found] ?? Number.NaN,
        color: item.color,
      })),
    });
  }

  function leave(): void {
    if (trackedIndex === undefined) setOwnIndex(null);
    onTrack?.(null);
  }

  return (
    <ChartFrame
      width={width}
      height={height}
      label={label}
      testId={testId}
      overlay={overlay}
      x={{ domain: across, label: xLabel, showGrid: false }}
      y={{ ...y, domain }}
    >
      {(frame) => (
        <>
          {drawn.map((item) => (
            <path
              key={item.id}
              data-series={item.id}
              d={stickPath(item, positions, frame)}
              fill="none"
              stroke={item.color}
              strokeWidth={item.muted === true ? 1 : 1.5}
              strokeOpacity={item.muted === true ? 0.55 : 1}
              strokeLinecap="butt"
            />
          ))}
          {held === null || positions[held] === undefined ? null : (
            <path
              data-chart-rule="tracked"
              d={`M${frame.x.offset + positions[held] * frame.x.factor} ${frame.plot.top}V${frame.plot.bottom}`}
              stroke="var(--text-faint)"
              strokeDasharray="3 3"
              shapeRendering="crispEdges"
            />
          )}
          <rect
            x={frame.plot.left}
            y={frame.plot.top}
            width={frame.plot.width}
            height={frame.plot.height}
            fill="transparent"
            style={SURFACE_STYLE}
            aria-label={xLabel}
            onMouseMove={(event) => {
              report(frame, event);
            }}
            onMouseLeave={leave}
          />
        </>
      )}
    </ChartFrame>
  );
}

const SURFACE_STYLE = {
  pointerEvents: 'auto',
  touchAction: 'none',
  cursor: 'crosshair',
} as const satisfies CSSProperties;
