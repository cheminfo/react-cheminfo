/**
 * What a mass chart reads under the pointer, and which peak it is asking about.
 *
 * Following the pointer at all is `useChartPointer` in the shared chart:
 * placing it in user units, refusing the margins, and reporting only when the
 * answer changed. What it *reads* there is the part that is about mass, and is
 * the whole of this file — the m/z, the intensity, and the peak within reach.
 */

import type { RefObject } from 'react';
import { useCallback, useMemo } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartValue } from '../../chart/core/chartScale.ts';
import type { ChartPoint } from '../../chart/core/svgPoint.ts';
import type { ChartPointer } from '../../chart/ui/useChartPointer.ts';
import { useChartPointer } from '../../chart/ui/useChartPointer.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';
import type { NearestPeak } from '../core/nearestPeak.ts';
import { nearestPeakMz, sameNearestPeak } from '../core/nearestPeak.ts';

/** What the axes say under the pointer, which is what a readout prints. */
export interface MassReadout {
  /** What the m/z axis reads there. */
  mz: number;
  /** What the intensity axis reads there. */
  intensity: number;
  /** The peak within reach of the pointer, `null` when none is. */
  peak: NearestPeak | null;
}

export interface MassPointerOptions {
  /** The SVG the chart is drawn on, as it was handed to its `ref`. */
  svgRef: RefObject<SVGSVGElement | null>;
  /** Where the plot sits inside that SVG. */
  plot: PlotRect;
  /** The m/z axis as it is currently zoomed. */
  xScale: ChartScale;
  /** The intensity axis as it is currently zoomed. */
  yScale: ChartScale;
  /** What the chart draws, for the peak under the pointer to be found. */
  spectra: readonly MassSpectrum[];
  /**
   * Told which peak the pointer has come to rest on, and told `null` when it
   * leaves one — called only when the answer changes, so it is safe to hang a
   * highlight that redraws half the page on it.
   * @default undefined
   */
  onPeak?: (peak: NearestPeak | null) => void;
  /**
   * Told when the pointer leaves the plot, and only then.
   *
   * `onPeak` says `null` for the gap between two sticks as well, so it cannot
   * be read as the reading being over — which is the one thing a host drawing a
   * picture of whatever is crossed has to know.
   * @default undefined
   */
  onAway?: () => void;
}

/**
 * Follow the pointer over a mass chart.
 * @param options - The chart, its axes and what it holds.
 * @returns Where the pointer is and what it reads, both `null` while it is
 * anywhere but over the plot.
 */
export function useMassPointer(
  options: MassPointerOptions,
): ChartPointer<MassReadout> {
  const { svgRef, plot, xScale, yScale, spectra, onPeak, onAway } = options;

  const read = useCallback(
    (point: ChartPoint): MassReadout => ({
      mz: chartValue(xScale, point.x),
      intensity: chartValue(yScale, point.y),
      peak: nearestPeakMz(spectra, xScale, point.x),
    }),
    [xScale, yScale, spectra],
  );

  const onReadout = useMemo(
    () =>
      onPeak === undefined && onAway === undefined
        ? undefined
        : (readout: MassReadout | null) => {
            onPeak?.(readout?.peak ?? null);
            // Only the whole reading is absent off the plot: inside it there is
            // always an m/z and an intensity, whether or not a stick is within
            // reach. So this is the leave, and the `null` peak above is not.
            if (readout === null) onAway?.();
          },
    [onPeak, onAway],
  );

  return useChartPointer({
    svgRef,
    plot,
    read,
    sameReadout: sameMassReadout,
    onReadout,
  });
}

/**
 * Whether two readings are about the same peak.
 *
 * The peak alone, and never the m/z under the crosshair: that fractional value
 * changes on every pixel the pointer moves, and comparing it would report a new
 * answer for every tremor of a hand resting on one stick.
 * @param current - What was last read.
 * @param next - What has just been read.
 * @returns Whether both are about the same peak.
 */
export function sameMassReadout(
  current: MassReadout,
  next: MassReadout,
): boolean {
  return sameNearestPeak(current.peak, next.peak);
}
