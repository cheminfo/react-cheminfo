/**
 * What an infrared chart reads under the pointer, and which band it is asking
 * about.
 *
 * Following the pointer at all is `useChartPointer` in the shared chart.
 * What it *reads* there is the part that is about infrared, and is the whole of
 * this file — the wavenumber, the value in whichever axis is drawn, and the band
 * within reach.
 */

import type { RefObject } from 'react';
import { useCallback, useMemo } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartValue } from '../../chart/core/chartScale.ts';
import type { ChartPoint } from '../../chart/core/svgPoint.ts';
import type { ChartPointer } from '../../chart/ui/useChartPointer.ts';
import { useChartPointer } from '../../chart/ui/useChartPointer.ts';
import type { IrBand } from '../core/irBand.ts';
import { sameIrBand } from '../core/irBand.ts';
import type { IrMode } from '../core/irSpectrum.ts';
import { nearestBandAt } from '../core/nearestBand.ts';

/** What the axes say under the pointer, which is what a readout prints. */
export interface IrReadout {
  /** What the wavenumber axis reads there, in cm⁻¹. */
  wavenumber: number;
  /** What the value axis reads there, in whichever mode is drawn. */
  value: number;
  /** Which axis that value is in, so a readout can label it. */
  mode: IrMode;
  /** The band within reach of the pointer, `null` when none is. */
  band: IrBand | null;
}

export interface IrPointerOptions {
  /** The SVG the chart is drawn on, as it was handed to its `ref`. */
  svgRef: RefObject<SVGSVGElement | null>;
  /** Where the plot sits inside that SVG. */
  plot: PlotRect;
  /** The wavenumber axis as it is currently zoomed, running right to left. */
  xScale: ChartScale;
  /** The value axis as it is currently zoomed. */
  yScale: ChartScale;
  /** Which value axis is being drawn. */
  mode: IrMode;
  /** The bands of every drawn spectrum, for the one under the pointer. */
  bands: readonly IrBand[];
  /**
   * Told which band the pointer has come to rest on, and told `null` when it
   * leaves one — called only when the answer changes, so it is safe to hang a
   * highlight that redraws half the page on it.
   * @default undefined
   */
  onBand?: (band: IrBand | null) => void;
}

/**
 * Follow the pointer over an infrared chart.
 * @param options - The chart, its axes and the bands it is showing.
 * @returns Where the pointer is and what it reads, both `null` while it is
 * anywhere but over the plot.
 */
export function useIrPointer(
  options: IrPointerOptions,
): ChartPointer<IrReadout> {
  const { svgRef, plot, xScale, yScale, mode, bands, onBand } = options;

  const read = useCallback(
    (point: ChartPoint): IrReadout => ({
      wavenumber: chartValue(xScale, point.x),
      value: chartValue(yScale, point.y),
      mode,
      band: nearestBandAt(bands, xScale, point.x),
    }),
    [xScale, yScale, mode, bands],
  );

  const onReadout = useMemo(
    () =>
      onBand === undefined
        ? undefined
        : (readout: IrReadout | null) => onBand(readout?.band ?? null),
    [onBand],
  );

  return useChartPointer({
    svgRef,
    plot,
    read,
    sameReadout: sameIrReadout,
    onReadout,
  });
}

/**
 * Whether two readings are about the same band.
 *
 * The band alone, and never the wavenumber under the crosshair: that fractional
 * value changes on every pixel the pointer moves, and comparing it would report a
 * new answer for every tremor of a hand resting on one band.
 * @param current - What was last read.
 * @param next - What has just been read.
 * @returns Whether both are about the same band.
 */
export function sameIrReadout(current: IrReadout, next: IrReadout): boolean {
  return sameIrBand(current.band, next.band);
}
