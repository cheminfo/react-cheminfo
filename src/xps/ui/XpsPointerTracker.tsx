import type { ReactElement } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartPixel } from '../../chart/core/chartScale.ts';
import { CHART_COLORS } from '../../chart/core/chartTheme.ts';
import type { ChartPoint } from '../../chart/core/svgPoint.ts';
import { ChartTracker } from '../../chart/ui/ChartTracker.tsx';
import type { NearestPeak } from '../core/nearestPeak.ts';
import { formatCounts, formatEnergy } from '../core/peakFormat.ts';

/** What the axes read under the pointer. */
export interface XpsReadout {
  /** What the energy axis reads there, in the units it is drawn in. */
  energy: number;
  /** What the counts axis reads there. */
  counts: number;
  /** The peak within reach of the pointer, `null` when none is. */
  peak: NearestPeak | null;
}

export interface XpsPointerTrackerProps {
  /** Where the pointer is, `null` whenever it is off the plot. */
  position: ChartPoint | null;
  /** What the axes read under it, `null` whenever it is off the plot. */
  readout: XpsReadout | null;
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
  /** The energy axis as it is currently zoomed, for a peak to be marked on. */
  xScale: ChartScale;
}

/**
 * The crosshair, what the axes say where it stands, and the peak it is on.
 *
 * The crosshair and its readout are the shared chart's. What is XPS's own is
 * the peak: when a picked peak falls within reach the readout says so and a
 * rule is dropped on the peak itself, in the highlight colour. That is what
 * makes the difference between "the pointer is at 284.9 eV" and "the peak here
 * was picked at 284.8 eV" — the second being the number every table beside the
 * chart is about.
 *
 * It is drawn last of everything, over the data and over the selection, and
 * takes no pointer event: a crosshair that could be hovered would be a crosshair
 * that stops the pointer it is following.
 * @param props - Component props.
 * @returns The crosshair, or nothing at all while the pointer is anywhere but
 * over the plot.
 */
export function XpsPointerTracker(
  props: XpsPointerTrackerProps,
): ReactElement | null {
  const { position, readout, plot, xScale } = props;

  if (position === null) return null;

  const peak = readout?.peak ?? null;
  const lines =
    readout === null
      ? null
      : [
          `${formatEnergy(peak === null ? readout.energy : peak.energy)} eV`,
          formatCounts(peak === null ? readout.counts : peak.peak.intensity),
        ];

  return (
    <g pointerEvents="none">
      {peak === null ? null : (
        <line
          x1={chartPixel(xScale, peak.energy)}
          y1={plot.top}
          x2={chartPixel(xScale, peak.energy)}
          y2={plot.bottom}
          style={peakRuleStyle}
        />
      )}
      <ChartTracker position={position} plot={plot} lines={lines} />
    </g>
  );
}

const peakRuleStyle = { stroke: CHART_COLORS.highlight } as const;
