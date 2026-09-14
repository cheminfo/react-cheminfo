import { chartAxisScale } from '../core/chartAxisScale.ts';
import { chartScale } from '../core/chartScale.ts';

import type {
  ChartAxisSpec,
  ChartFrameRender,
  ChartMargins,
} from './ChartFrame.tsx';
import { chartOuterRoom, chartPlotArea } from './chartStyles.ts';

/**
 * Where a `ChartFrame` puts its plot, and how it maps data into it,
 * worked out without drawing anything.
 *
 * A figure that needs its points in pixels before it renders — to hand a hit
 * test its positions, which a hook cannot read from inside the frame's render
 * callback — calls this once and passes the result to the frame as `geometry`.
 * The frame and the figure then read one answer rather than two that could
 * drift apart.
 * @param width - Total width of the figure, in pixels.
 * @param height - Total height.
 * @param x - The horizontal axis, as the frame is given it.
 * @param y - The vertical axis.
 * @param margins - Room the caller insists on, merged over what the axes ask for.
 * @returns The plot rectangle, the two data-to-pixel mappings and the two niced axes.
 */
export function chartFrameGeometry(
  width: number,
  height: number,
  x: ChartAxisSpec,
  y: ChartAxisSpec,
  margins: Partial<ChartMargins> = {},
): ChartFrameRender {
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
  return {
    plot,
    x: chartScale(xAxis.domain[0], xAxis.domain[1], plot.left, plot.right),
    y: chartScale(yAxis.domain[0], yAxis.domain[1], plot.bottom, plot.top),
    xAxis,
    yAxis,
  };
}
