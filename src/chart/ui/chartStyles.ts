/**
 * Every rule the frame and its axes are drawn with.
 *
 * A frame is the one part of a figure the reader is not meant to notice, so
 * the whole domain's visual decision fits in this file: three weights of line
 * and one colour of text. Grid rules take the faintest border token, the rule
 * at zero takes the strong one held back, and the axis line takes it outright
 * — a ramp the eye reads as depth rather than as three unrelated greys.
 *
 * The room numbers live here too. They are what makes a chart with no titles
 * give its plot back the forty pixels it was reserving for words nobody asked
 * for, and keeping them beside the type sizes is what keeps the two in step.
 */

import type { CSSProperties } from 'react';

import type { ChartAxisScale } from '../core/chartAxisScale.ts';

import type {
  ChartAxisSpec,
  ChartMargins,
  ChartPlotArea,
} from './ChartFrame.tsx';

/** Room kept around the plot before either axis asks for any of its own. */
export const CHART_BASE_MARGINS = {
  top: 10,
  right: 12,
  bottom: 8,
  left: 10,
} as const;

/** Room a set of tick marks and their labels needs, outside the plot. */
export const CHART_TICK_ROOM = { bottom: 22, left: 32 } as const;

/** Room an axis title needs, beyond whatever its ticks already took. */
export const CHART_TITLE_ROOM = { bottom: 18, left: 16 } as const;

/** How far a tick mark reaches out of the plot, in pixels. */
export const CHART_TICK_LENGTH = 4;

/** Baseline of a horizontal tick label, below the bottom of the plot. */
export const CHART_TICK_LABEL_OFFSET = 15;

/** How far a vertical tick label ends before the left of the plot. */
export const CHART_TICK_LABEL_INSET = 8;

/** Baseline of an axis title, past the room its ticks took. */
export const CHART_TITLE_OFFSET = 13;

/**
 * How much room one edge of the plot gives up.
 *
 * An inner cell of a pair grid keeps its grid and drops its ticks, and a
 * figure that names its axes in a caption drops its titles; both get the
 * pixels back rather than framing the plot with empty margin. An axis whose
 * labels were divided by a power of ten always keeps its title room even
 * unnamed, because without the factor written down the labels read as the
 * wrong number entirely.
 * @param side - Which edge, since a column of numbers is wider than a row.
 * @param spec - How the axis on that edge was asked for.
 * @param scale - The axis as it was niced, for the power of ten it lifted.
 * @returns The margin, in pixels.
 */
export function chartOuterRoom(
  side: 'bottom' | 'left',
  spec: ChartAxisSpec,
  scale: ChartAxisScale,
): number {
  const { label, showTicks = true } = spec;
  const named = (label !== undefined && label !== '') || scale.exponent !== 0;
  const ticks = showTicks ? CHART_TICK_ROOM[side] : 0;
  return (
    CHART_BASE_MARGINS[side] + ticks + (named ? CHART_TITLE_ROOM[side] : 0)
  );
}

/**
 * The rectangle the data is drawn in.
 *
 * Both sides are clamped rather than trusted. A chart in a collapsed panel is
 * measured at nothing before it is measured properly, and a plot of minus
 * eighty pixels would reach the DOM as an invalid `rect` and take the figure
 * down with it.
 * @param width - Total width of the figure, in pixels.
 * @param height - Total height.
 * @param margins - What the caller insists on, over the rest.
 * @param outer - What the two written edges asked for, from
 * {@link chartOuterRoom}.
 * @param outer.bottom - Room the horizontal axis asked for below the plot.
 * @param outer.left - Room the vertical axis asked for beside it.
 * @returns The plot rectangle.
 */
export function chartPlotArea(
  width: number,
  height: number,
  margins: Partial<ChartMargins>,
  outer: { bottom: number; left: number },
): ChartPlotArea {
  const top = margins.top ?? CHART_BASE_MARGINS.top;
  const right = margins.right ?? CHART_BASE_MARGINS.right;
  const left = margins.left ?? outer.left;
  const plotWidth = Math.max(0, width - left - right);
  const plotHeight = Math.max(
    0,
    height - top - (margins.bottom ?? outer.bottom),
  );
  return {
    left,
    top,
    right: left + plotWidth,
    bottom: top + plotHeight,
    width: plotWidth,
    height: plotHeight,
  };
}

/**
 * The block a figure occupies, which the floating chrome is positioned
 * against.
 * @param width - Total width, in pixels.
 * @param height - Total height.
 * @returns The wrapper's rules.
 */
export function chartFrameStyle(width: number, height: number): CSSProperties {
  return {
    position: 'relative',
    width: Math.max(0, width),
    height: Math.max(0, height),
  };
}

/**
 * The drawing surface, which fills the block exactly.
 *
 * It paints outside its own box on purpose: an axis title sitting on the last
 * pixel of the margin would otherwise lose its descenders to the viewport
 * edge, and a clipped `y` is a typographic bug nobody can explain.
 */
export const CHART_SVG_STYLE = {
  display: 'block',
  overflow: 'visible',
} as const satisfies CSSProperties;

/** A rule across the plot at one tick, drawn under everything. */
export const CHART_GRID_STYLE = {
  stroke: 'var(--border)',
  strokeWidth: 1,
  shapeRendering: 'crispEdges',
} as const satisfies CSSProperties;

/**
 * The rule at zero, which is what separates a positive loading from a
 * negative one at a glance and so outweighs the grid without becoming an axis.
 */
export const CHART_ZERO_RULE_STYLE = {
  stroke: 'var(--border-strong)',
  strokeWidth: 1,
  strokeOpacity: 0.6,
  shapeRendering: 'crispEdges',
} as const satisfies CSSProperties;

/** The line along the edge the axis is written on. */
export const CHART_AXIS_LINE_STYLE = {
  stroke: 'var(--border-strong)',
  strokeWidth: 1,
  shapeRendering: 'crispEdges',
} as const satisfies CSSProperties;

/** The stub outside the plot that ties a label to its value. */
export const CHART_TICK_MARK_STYLE = {
  stroke: 'var(--border-strong)',
  strokeWidth: 1,
  shapeRendering: 'crispEdges',
} as const satisfies CSSProperties;

/**
 * One tick written out. The figures are tabular so that a column of them on a
 * vertical axis lines up on the decimal point instead of wandering.
 */
export const CHART_TICK_LABEL_STYLE = {
  fill: 'var(--text-muted)',
  fontSize: 11,
  fontVariantNumeric: 'tabular-nums',
  userSelect: 'none',
} as const satisfies CSSProperties;

/** What the axis measures, and any power of ten its labels were divided by. */
export const CHART_AXIS_TITLE_STYLE = {
  fill: 'var(--text-muted)',
  fontSize: 12,
  fontWeight: 500,
  userSelect: 'none',
} as const satisfies CSSProperties;
