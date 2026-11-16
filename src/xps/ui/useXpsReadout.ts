/**
 * What the pointer reads off the XPS chart, and what of it the rest of the
 * viewer hears: the crosshair follows every pixel, the viewer only the peak.
 */

import type { RefObject } from 'react';
import { useCallback, useRef } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartValue } from '../../chart/core/chartScale.ts';
import type { ChartPoint } from '../../chart/core/svgPoint.ts';
import type { ChartPointer } from '../../chart/ui/useChartPointer.ts';
import { useChartPointer } from '../../chart/ui/useChartPointer.ts';
import type { NearestPeak } from '../core/nearestPeak.ts';
import { nearestPeakEnergy, sameNearestPeak } from '../core/nearestPeak.ts';
import type { XpsHighlight } from '../core/xpsHighlight.ts';
import { NO_HIGHLIGHT } from '../core/xpsHighlight.ts';
import type { EnergyAxis } from '../core/xpsSettings.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';

import type { XpsReadout } from './XpsPointerTracker.tsx';

/** What {@link useXpsReadout} reads the pointer against. */
export interface XpsReadoutOptions {
  /** The chart's SVG, which the pointer is heard on. */
  svgRef: RefObject<SVGSVGElement | null>;
  /** The plot, outside which the pointer reads nothing. */
  plot: PlotRect;
  /** The spectra drawn, whose peaks the pointer is nearest to. */
  spectra: readonly XpsSpectrum[];
  /** The energy axis the chart is drawn against. */
  axis: EnergyAxis;
  /** The energy scale on screen. */
  xScale: ChartScale;
  /** The counts scale on screen. */
  yScale: ChartScale;
  /**
   * Told whenever the peak under the pointer changes.
   * @default undefined
   */
  onHighlightChange?: (highlight: XpsHighlight) => void;
}

/**
 * Follow the pointer over the chart, and tell the viewer which peak it is on.
 *
 * Only a change of peak is reported, starting from none: the pointer coming
 * onto the plot over no peak says nothing, so a guide a panel put on the chart
 * stays until the pointer actually reaches a peak.
 * @param options - See {@link XpsReadoutOptions}.
 * @returns Where the pointer is and what it reads.
 */
export function useXpsReadout(
  options: XpsReadoutOptions,
): ChartPointer<XpsReadout> {
  const { svgRef, plot, spectra, axis, xScale, yScale, onHighlightChange } =
    options;
  const read = useCallback(
    (point: ChartPoint): XpsReadout => ({
      energy: chartValue(xScale, point.x),
      counts: chartValue(yScale, point.y),
      peak: nearestPeakEnergy(spectra, axis, xScale, point.x),
    }),
    [xScale, yScale, spectra, axis],
  );
  const reportedPeak = useRef<NearestPeak | null>(null);
  const onReadout = useCallback(
    (readout: XpsReadout | null) => {
      const found = readout?.peak ?? null;
      if (sameNearestPeak(reportedPeak.current, found)) return;
      reportedPeak.current = found;
      onHighlightChange?.(
        found === null
          ? NO_HIGHLIGHT
          : {
              spectrumId: found.spectrumId,
              peakId: found.peak.id,
              componentId: null,
              bindingEnergy: found.peak.bindingEnergy,
            },
      );
    },
    [onHighlightChange],
  );
  return useChartPointer<XpsReadout>({
    svgRef,
    plot,
    read,
    sameReadout: samePeakReadout,
    onReadout,
  });
}

/**
 * Whether two readings are about the same peak, which is all the rest of the
 * viewer hears about: the energy under the crosshair changes on every pixel.
 * @param current - The reading last reported.
 * @param next - The reading now.
 * @returns Whether nothing needs reporting.
 */
function samePeakReadout(current: XpsReadout, next: XpsReadout): boolean {
  return sameNearestPeak(current.peak, next.peak);
}
