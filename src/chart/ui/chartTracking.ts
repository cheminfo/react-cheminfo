/**
 * What a tracking chart reports about the pointer: where it is on the plot,
 * and every series' value at the slot it found.
 */

import type { CSSProperties, MouseEvent } from 'react';

import type { PlotRect } from '../core/chartGeometry.ts';
import type { ChartPoint } from '../core/svgPoint.ts';

import type { ChartTrackEvent } from './TrackedLineChart.tsx';

/** A series, as much of it as the tracker reports. */
export interface TrackedSeries {
  /** A stable id. */
  id: string;
  /** What it is called. */
  label: string;
  /** One value per slot. */
  values: ArrayLike<number>;
  /** Its colour. */
  color: string;
}

/**
 * Where the pointer is on the plot, from an event on a target laid over it.
 * @param event - The pointer event, on a target covering the plot.
 * @param plot - The plot, in the SVG's own units.
 * @returns The point, in the SVG's own units however the SVG is scaled.
 */
export function plotPointer(
  event: MouseEvent<Element>,
  plot: PlotRect,
): ChartPoint {
  const box = event.currentTarget.getBoundingClientRect();
  const across = box.width === 0 ? 1 : plot.width / box.width;
  const down = box.height === 0 ? 1 : plot.height / box.height;
  return {
    x: plot.left + (event.clientX - box.left) * across,
    y: plot.top + (event.clientY - box.top) * down,
  };
}

/**
 * Every series' value at one slot, in the order the series are given.
 * @param series - The series drawn.
 * @param index - The slot.
 * @returns One entry per series; a missing value is `NaN`.
 */
export function trackedValues(
  series: readonly TrackedSeries[],
  index: number,
): ChartTrackEvent['values'] {
  const values = new Array<ChartTrackEvent['values'][number]>(series.length);
  for (let position = 0; position < series.length; position++) {
    const item = series[position] as TrackedSeries;
    values[position] = {
      id: item.id,
      label: item.label,
      value: item.values[index] ?? Number.NaN,
      color: item.color,
    };
  }
  return values;
}

/**
 * The dashed rule a tracking chart draws at the slot under the pointer, on the
 * band chart and the stick chart alike. Written as a style, because a browser
 * does not resolve `var()` in a presentation attribute.
 */
export const TRACKED_RULE_STYLE = {
  stroke: 'var(--border-strong)',
  strokeWidth: 1,
  strokeDasharray: '3 3',
} as const satisfies CSSProperties;
