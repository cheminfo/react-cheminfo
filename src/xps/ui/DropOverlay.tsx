import type { ReactElement } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import { XPS_CHART_COLORS, XPS_CHART_FONT } from '../core/xpsChartTheme.ts';

export interface DropOverlayProps {
  /**
   * Whether a file is being dragged over the chart.
   * @default false
   */
  isOver?: boolean;
  /**
   * Whether a dropped file is still being read. A VAMAS file of forty-eight
   * blocks takes long enough that a chart left unchanged reads as a drop that
   * did not land.
   * @default false
   */
  isReading?: boolean;
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
}

/**
 * What the chart says while a file is over it or being read.
 *
 * Drawn as the topmost band and over everything, because it is about the chart
 * as a whole rather than about anything drawn in it. The wash is faint enough
 * that whatever is already loaded stays readable underneath — a reader dropping
 * a second file wants to see the first while they do it.
 *
 * Nothing here takes a pointer event, which matters more than usual: an overlay
 * that swallowed the drag would fire `dragleave` the instant it appeared, so the
 * chart would flicker between inviting the drop and not, and the drop itself
 * would land on the overlay rather than on whatever is listening for it.
 * @param props - Component props.
 * @returns The overlay, or nothing when there is neither a drag nor a read.
 */
export function DropOverlay(props: DropOverlayProps): ReactElement | null {
  const { isOver = false, isReading = false, plot } = props;
  if (!isOver && !isReading) return null;

  return (
    <g pointerEvents="none">
      <rect
        x={plot.left}
        y={plot.top}
        width={plot.width}
        height={plot.height}
        strokeWidth={BORDER_WIDTH}
        strokeDasharray={BORDER_DASH}
        style={overlayStyle}
      />
      <text
        x={plot.left + plot.width / 2}
        y={plot.top + plot.height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        style={captionStyle}
      >
        {isReading ? 'Reading…' : 'Drop a VAMAS, JCAMP or text file'}
      </text>
    </g>
  );
}

/** How thick the border inviting the drop is. */
const BORDER_WIDTH = 2;

/** What it is dashed with, which is what says a drop is expected. */
const BORDER_DASH = '8 5';

const overlayStyle = {
  fill: XPS_CHART_COLORS.dropOverlay,
  stroke: XPS_CHART_COLORS.dropBorder,
} as const;

const captionStyle = {
  fill: XPS_CHART_COLORS.dropBorder,
  fontSize: XPS_CHART_FONT.overlay,
} as const;
