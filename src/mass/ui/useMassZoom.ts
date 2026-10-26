/**
 * The generic zoom, told what a mass spectrum's window is fitted to.
 *
 * Every gesture — the drag, the wheel, the double click — is `useChartZoom` in
 * the shared chart and is not written here, because none of it is about mass.
 * What *is* about mass is the fit: a spectrum carries two traces where only one
 * is drawn, and a previewed pattern is left out of the extents. That arithmetic
 * is `massDomain.ts`, and this hook is what joins the two.
 *
 * One gesture is about mass in the same way. A click on a mass chart is a peak
 * or it is nothing at all, and only the axis the gesture was measured against
 * can say which of the two it was — so the hook that owns that axis answers it,
 * and the chart above is handed the peak rather than a place on the plot.
 */

import type { RefObject } from 'react';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

import type { ZoomDragMode } from '../../chart/core/chartDomain.ts';
import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import type { ChartPoint } from '../../chart/core/svgPoint.ts';
import type { ChartClickModifiers } from '../../chart/ui/chartGestures.ts';
import type { ChartZoom } from '../../chart/ui/useChartZoom.ts';
import { useChartZoom } from '../../chart/ui/useChartZoom.ts';
import { fittedTo, fullDomain } from '../core/massDomain.ts';
import type { MassDomain, MassSpectrum } from '../core/massSpectrum.ts';
import type { NearestPeak } from '../core/nearestPeak.ts';
import { peakAtMz } from '../core/nearestPeak.ts';

/** A click on the plot, with everything needed to say what it was on. */
export interface MassZoomClick {
  /** Where it landed on the m/z axis. */
  mz: number;
  /** The picked peak within reach of it, `null` when it landed on none. */
  peak: NearestPeak | null;
  /**
   * The m/z axis the click was measured against, for a host testing marks of
   * its own — a ring on a fragmented peak — before the sticks.
   */
  xScale: ChartScale;
  /** The modifier keys held as the button came up. */
  modifiers: ChartClickModifiers;
}

export interface MassZoomOptions {
  /** What the chart draws. */
  spectra: readonly MassSpectrum[];
  /**
   * What the window is fitted to instead, when that is not what the chart
   * draws — every pane of a stack is fitted to the union, so a faint spectrum
   * and a bright one are not drawn alike.
   * @default the spectra the chart draws
   */
  fitTo?: readonly MassSpectrum[];
  /**
   * Whether one spectrum is drawn below the axis, which fits the window about
   * zero.
   * @default false
   */
  mirror?: boolean;
  /** The SVG the gestures are made on, as it was handed to its `ref`. */
  svgRef: RefObject<SVGSVGElement | null>;
  /** Where the plot sits inside that SVG, which the axes are laid over. */
  plot: PlotRect;
  /**
   * The window a host is imposing, `null` while it imposes none. Handed straight
   * through; `useChartZoom` documents what imposing one does.
   * @default null
   */
  domain?: MassDomain | null;
  /**
   * What a drag asks for: the m/z axis alone, or the rectangle swept out.
   * @default 'xAxis'
   */
  drag?: ZoomDragMode;
  /**
   * Whether the chart answers `f` with the fit itself. A viewer running its own
   * keys through a command table, where the key is documented, turns it off.
   * @default true
   */
  keys?: boolean;
  /**
   * Told where a click on the plot landed — a press let go over it without
   * travelling, never the end of a drag — and the peak within reach of it.
   * @default undefined
   */
  onClick?: (click: MassZoomClick) => void;
}

/**
 * Zoom a mass chart by dragging it, by the wheel and by double clicking it.
 *
 * The y axis keeps its default rules, which are a stick spectrum's: zero is the
 * baseline the wheel scales about, and it stays inside the window however the
 * chart is zoomed, because a window starting at a tenth of the base peak would
 * cut every stick off at the ankles.
 * @param options - The chart and what it holds.
 * @returns The window and the gestures that move it.
 */
export function useMassZoom(options: MassZoomOptions): ChartZoom {
  const {
    spectra,
    fitTo,
    mirror = false,
    svgRef,
    plot,
    domain = null,
    drag = 'xAxis',
    keys = true,
    onClick,
  } = options;

  const measured = fitTo ?? spectra;
  const fitted = useMemo(
    () => fullDomain(measured, mirror),
    [measured, mirror],
  );
  const fitKey = useMemo(() => fittedTo(measured, mirror), [measured, mirror]);
  const gestures = useMemo(() => ({ drag, wheel: true, keys }), [drag, keys]);

  // The axis a click is measured against is the one the zoom arrived at, and
  // the click comes back out of that same hook: it therefore reaches the
  // handler through a ref, read as the button comes up rather than closed over
  // when the gesture layer was built.
  const axis = useRef<ChartScale | null>(null);

  const onPress = useCallback(
    (point: ChartPoint, modifiers: ChartClickModifiers) => {
      const xScale = axis.current;
      if (xScale === null || onClick === undefined) return;
      onClick({
        mz: point.x,
        peak: peakAtMz(spectra, xScale, point.x),
        xScale,
        modifiers,
      });
    },
    [spectra, onClick],
  );

  const zoom = useChartZoom({
    fitted,
    fitKey,
    svgRef,
    plot,
    domain,
    gestures,
    ...(onClick === undefined ? {} : { onClick: onPress }),
  });

  useLayoutEffect(() => {
    axis.current = zoom.xScale;
  });

  return zoom;
}
