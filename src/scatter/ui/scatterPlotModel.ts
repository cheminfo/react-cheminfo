/**
 * What a scatter is made of before any of it is drawn: the groups it colours
 * by, the marks laid over it, and the arithmetic that turns the caller's
 * numbers into the pixels three layers and one hit test have to agree on.
 *
 * It is kept out of the component because a plot has to know its own rectangle
 * before it can hand the interaction hook a set of screen positions, and a
 * hook cannot be called from inside the frame's render callback.
 */

import { chartAxisScale } from '../../chart/core/chartAxisScale.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartScale } from '../../chart/core/chartScale.ts';
import type { ChartAxisSpec } from '../../chart/ui/ChartFrame.tsx';
import { chartOuterRoom, chartPlotArea } from '../../chart/ui/chartStyles.ts';
import type { ScreenPoints } from '../core/screenPoints.ts';

import type { ScatterPixelMark } from './scatterMarkGlyph.tsx';
import type { ScatterGroup, ScatterMarker } from './scatterPlotProps.ts';

/** Where a scatter's data lands, and the rectangle it lands in. */
export interface ScatterPlotView {
  /** The rectangle gestures are taken on, ready to spread onto a `<rect>`. */
  rect: { x: number; y: number; width: number; height: number };
  /** Data to pixels, horizontally. */
  toX: ChartScale;
  /** Data to pixels, vertically; its `factor` is negative. */
  toY: ChartScale;
  /** Every point in the frame's pixels, the space a gesture arrives in. */
  points: ScreenPoints;
}

/** The colour and the strength each group is drawn at. */
export interface ScatterGroupInk {
  /** One colour per group, in group order. */
  colors: string[];
  /** How strongly each group is drawn, in the same order. */
  opacities: number[];
}

/**
 * The plot rectangle, the two mappings, and every point in pixels.
 *
 * It repeats what `ChartFrame` works out for itself, from the same inputs and
 * through the same two functions, because the interaction needs the positions
 * before the frame has drawn anything and a hook cannot be called from inside
 * the frame's render callback. Both answers come out of `chartPlotArea`, so
 * they cannot drift apart without the frame's own tests saying so.
 * @param x - Horizontal coordinate of every point, in data units.
 * @param y - Vertical coordinate, in the same order.
 * @param width - Total width of the figure, in pixels.
 * @param height - Total height.
 * @param xAxis - How the horizontal axis was asked for.
 * @param yAxis - How the vertical one was.
 * @returns Where everything sits.
 */
export function scatterPlotGeometry(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  width: number,
  height: number,
  xAxis: ChartAxisSpec,
  yAxis: ChartAxisSpec,
): ScatterPlotView {
  const across = chartAxisScale(xAxis.domain[0], xAxis.domain[1], {
    count: xAxis.tickCount,
    nice: xAxis.nice,
  });
  const up = chartAxisScale(yAxis.domain[0], yAxis.domain[1], {
    count: yAxis.tickCount,
    nice: yAxis.nice,
  });
  const plot = chartPlotArea(
    width,
    height,
    {},
    {
      bottom: chartOuterRoom('bottom', xAxis, across),
      left: chartOuterRoom('left', yAxis, up),
    },
  );
  const toX = chartScale(
    across.domain[0],
    across.domain[1],
    plot.left,
    plot.right,
  );
  const toY = chartScale(up.domain[0], up.domain[1], plot.bottom, plot.top);
  const total = Math.min(x.length, y.length);
  const pixelX = new Float64Array(total);
  const pixelY = new Float64Array(total);
  for (let index = 0; index < total; index++) {
    pixelX[index] = toX.offset + (x[index] ?? Number.NaN) * toX.factor;
    pixelY[index] = toY.offset + (y[index] ?? Number.NaN) * toY.factor;
  }
  return {
    rect: { x: plot.left, y: plot.top, width: plot.width, height: plot.height },
    toX,
    toY,
    points: { x: pixelX, y: pixelY },
  };
}

/**
 * The colour of each group and how strongly it is drawn.
 *
 * A muted group is drawn faint rather than dropped: the reader turned it off
 * to see past it, not to change the shape of what is left, and a cloud that
 * loses points as entries are switched off is a cloud nobody can compare.
 * @param groups - The groups, in the order they are coloured and listed.
 * @param muted - The ids drawn faint.
 * @returns One colour and one opacity per group.
 */
export function scatterGroupInk(
  groups: readonly ScatterGroup[] | undefined,
  muted: ReadonlySet<string> | undefined,
): ScatterGroupInk {
  const colors: string[] = [];
  const opacities: number[] = [];
  for (const group of groups ?? []) {
    colors.push(group.color);
    opacities.push(muted?.has(group.id) === true ? MUTED_OPACITY : 1);
  }
  return { colors, opacities };
}

/**
 * The markers in pixels, which is the only space the layer that draws them
 * knows about.
 * @param markers - The marks, in data units.
 * @param toX - Data to pixels, horizontally.
 * @param toY - Data to pixels, vertically.
 * @returns The same marks, placed.
 */
export function scatterPixelMarks(
  markers: readonly ScatterMarker[] | undefined,
  toX: ChartScale,
  toY: ChartScale,
): ScatterPixelMark[] {
  const marks: ScatterPixelMark[] = [];
  for (const marker of markers ?? []) {
    marks.push({
      label: marker.label,
      color: marker.color,
      shape: marker.shape,
      x: toX.offset + marker.x * toX.factor,
      y: toY.offset + marker.y * toY.factor,
    });
  }
  return marks;
}

/**
 * What a screen reader is told when the caller says nothing.
 *
 * A figure with no label at all is hidden from a reader entirely, which for a
 * plot carrying the whole result is worse than a sentence nobody wrote by
 * hand. The axes are named the way the plot names them, so a reader hearing
 * `PC 2 against PC 1` hears the same words a sighted reader sees.
 * @param xAxis - The horizontal axis.
 * @param yAxis - The vertical axis.
 * @param count - How many points are drawn.
 * @returns The sentence.
 */
export function scatterPlotLabel(
  xAxis: ChartAxisSpec,
  yAxis: ChartAxisSpec,
  count: number,
): string {
  const across = xAxis.label ?? 'the horizontal axis';
  const up = yAxis.label ?? 'the vertical axis';
  return `A scatter plot of ${count} points, ${up} against ${across}.`;
}

/**
 * The ring being dragged. Dashed, and filled only faintly: it is a gesture in
 * progress and not anything the data says, and a solid shape over the cloud
 * would hide the very points it is about to pick.
 */
export const LASSO_STYLE = {
  fill: 'var(--accent)',
  fillOpacity: 0.08,
  stroke: 'var(--accent)',
  strokeWidth: 1.5,
  strokeDasharray: '5 4',
  pointerEvents: 'none',
} as const;

/**
 * How far past the dot itself the pointer still counts as aiming at it. A
 * scatter is aimed at with a hand, and a three-pixel dot that answers only
 * when the pointer is exactly on it reads as a plot with no hover at all.
 */
export const SCATTER_HOVER_SLACK = 8;

/**
 * Faint enough to read as switched off at a glance, dark enough that the shape
 * of the group is still there — a reader mutes a group to see past it.
 */
const MUTED_OPACITY = 0.2;
