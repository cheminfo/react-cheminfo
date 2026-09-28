/**
 * The crosshair a chart follows the pointer with, and the lines it reads out.
 *
 * Every viewer draws the same two dashed rules and writes the same stack of
 * short lines beside them; what differs is the words, which are the one thing
 * only the viewer knows — an m/z and a height here, a retention time and a
 * summed current there. So the geometry, the dashes and the placement live
 * here, and the caller hands over the lines already written.
 *
 * The first line is the one being pointed at and is written plainly; the rest
 * are quieter, because they answer the question the first one raises rather
 * than being asked for in their own right.
 */

import type { ReactElement } from 'react';

import type { PlotRect } from '../core/chartGeometry.ts';
import {
  CHART_COLORS,
  CHART_FONT,
  LABEL_HALO,
  LABEL_QUIET,
  PEAK_LABEL,
} from '../core/chartTheme.ts';
import type { ChartPoint } from '../core/svgPoint.ts';
import { readoutPlacement } from '../core/trackerReadout.ts';

/** What the tracker is given. */
export interface ChartTrackerProps {
  /** Where the pointer is, `null` whenever it is off the plot. */
  position: ChartPoint | null;
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
  /**
   * What to write beside the crosshair, most important first, `null` where the
   * axes read nothing under the pointer.
   * @default null
   */
  lines?: readonly string[] | null;
}

/**
 * Draw the crosshair and its readout.
 * @param props - The pointer, the plot and the lines to write.
 * @returns The crosshair, or nothing while the pointer is off the plot.
 */
export function ChartTracker(props: ChartTrackerProps): ReactElement | null {
  const { position, plot, lines = null } = props;
  if (position === null) return null;

  const place = readoutPlacement(position, plot);

  return (
    <g pointerEvents="none">
      <line
        x1={position.x}
        y1={plot.top}
        x2={position.x}
        y2={plot.bottom}
        strokeDasharray={TRACKER_DASH}
        style={crosshairStyle}
      />
      <line
        x1={plot.left}
        y1={position.y}
        x2={plot.right}
        y2={position.y}
        strokeDasharray={TRACKER_DASH}
        style={crosshairStyle}
      />
      {lines === null || lines.length === 0 ? null : (
        <text textAnchor={place.anchor} style={readoutStyle}>
          {lines.map((line, at) => (
            <tspan
              key={line}
              x={place.x}
              y={place.y + at * PEAK_LABEL.lineHeight}
              fillOpacity={at === 0 ? undefined : LABEL_QUIET}
            >
              {line}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
}

/** What the crosshair is dashed with, so it is never read as a trace. */
const TRACKER_DASH = '3 3';

const crosshairStyle = { stroke: CHART_COLORS.tracker } as const;

const readoutStyle = {
  fill: CHART_COLORS.trackerText,
  fontSize: CHART_FONT.readout,
  // Haloed like every other label written onto the plot, and it needs it more
  // than any of them: the pointer is put wherever the question is, which is over
  // the trace rather than beside it.
  ...LABEL_HALO,
} as const;
