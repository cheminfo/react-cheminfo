/**
 * The generic zoom, told what an infrared window is fitted to and how its value
 * axis behaves.
 *
 * Every gesture is `useChartZoom` in the shared chart and none of it is
 * written here. What is about infrared is the three things handed in: the fit,
 * which has to refit when the mode changes because the value axis is replaced
 * rather than nudged; the y axis rules, which are where percent transmittance
 * says that its baseline is 100 and not zero; and which gestures the mode
 * answers at all, which is where it says that a rectangle is the only drag worth
 * making on it and that the wheel belongs to the page.
 */

import type { RefObject } from 'react';
import { useMemo } from 'react';

import type { ZoomDragMode } from '../../chart/core/chartDomain.ts';
import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartZoom } from '../../chart/ui/useChartZoom.ts';
import { useChartZoom } from '../../chart/ui/useChartZoom.ts';
import { fittedTo, fullDomain } from '../core/irDomain.ts';
import { yAxisRules, zoomGestures } from '../core/irMode.ts';
import type { IrDomain, IrMode, IrSpectrum } from '../core/irSpectrum.ts';

export interface IrZoomOptions {
  /** Everything the chart holds, which is what the window is fitted to. */
  spectra: readonly IrSpectrum[];
  /** Which value axis is being drawn. */
  mode: IrMode;
  /** The SVG the gestures are made on, as it was handed to its `ref`. */
  svgRef: RefObject<SVGSVGElement | null>;
  /** Where the plot sits inside that SVG, which the axes are laid over. */
  plot: PlotRect;
  /**
   * The window a host is imposing, `null` while it imposes none. Handed straight
   * through; `useChartZoom` documents what imposing one does.
   * @default null
   */
  domain?: IrDomain | null;
  /**
   * What a drag asks for **where the mode leaves the choice open** — the
   * wavenumber axis, or the rectangle swept out. Percent transmittance takes the
   * rectangle whatever this says; `zoomGestures` is where that is decided.
   * @default 'xAxis'
   */
  drag?: ZoomDragMode;
}

/**
 * Zoom an infrared chart by dragging it, and — reading absorbance — by the wheel.
 *
 * A double click always fits everything again, in either mode: it is the way
 * back from a zoom, and a chart that offers a gesture has to offer the way out
 * of it.
 * @param options - The chart, what it holds and which axis it is read in.
 * @returns The window and the gestures that move it.
 */
export function useIrZoom(options: IrZoomOptions): ChartZoom {
  const {
    spectra,
    mode,
    svgRef,
    plot,
    domain = null,
    drag = 'xAxis',
  } = options;

  const fitted = useMemo(() => fullDomain(spectra, mode), [spectra, mode]);
  const fitKey = useMemo(() => fittedTo(spectra, mode), [spectra, mode]);
  const yAxis = useMemo(() => yAxisRules(mode), [mode]);
  const gestures = useMemo(() => zoomGestures(mode, drag), [mode, drag]);

  // `reverseX` is not decoration: the hook measures every gesture by inverting a
  // pixel through the scale it builds, so it has to build the same reversed one
  // the chart draws with.
  return useChartZoom({
    fitted,
    fitKey,
    svgRef,
    plot,
    yAxis,
    domain,
    gestures,
    reverseX: true,
  });
}
