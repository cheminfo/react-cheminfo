/**
 * What a consumer hands the chart, and what the chart tells it back.
 *
 * Held apart from the component because it is the whole of the chart's public
 * API — every spectrum drawn, every peak labelled on it and every gesture that
 * comes back out is one of these — while the component behind it is an assembly
 * of half a dozen layers nobody needs to read in order to mount one.
 *
 * Everything arrives as a prop and nothing is reached for: the chart reads no
 * store and no context, so the same component serves an editor, a report page
 * that only ever draws one spectrum, and a test.
 */

import type { ReactNode } from 'react';

import type { ZoomDragMode } from '../../chart/core/chartDomain.ts';
import type { MassDomain, MassSpectrum } from '../core/massSpectrum.ts';
import type { NearestPeak } from '../core/nearestPeak.ts';

export interface MassChartProps {
  /** The spectra to draw, each saying in itself which of its traces is drawn. */
  spectra: readonly MassSpectrum[];
  /**
   * Identity of the spectrum whose peaks are labelled, `null` for none. One
   * spectrum and never all of them: two stacks over every shared peak are the
   * same m/z written twice, a pixel apart, in two colours.
   * @default the first spectrum drawn
   */
  labelledId?: string | null;
  /**
   * Whether that spectrum's peaks are labelled at all.
   * @default true
   */
  showLabels?: boolean;
  /**
   * At most how many peaks are labelled; every labelled one is still marked.
   * @default DEFAULT_LABEL_LIMIT
   */
  labelLimit?: number;
  /**
   * Whether a label writes the charge of a peak whose charge was established.
   * @default false
   */
  showCharges?: boolean;
  /**
   * How many decimals every mass is written with, overriding what the spectra
   * resolve — where the labels follow the labelled spectrum's own resolution,
   * and the crosshair what the drawn spectra resolve together.
   * @default what the spectra resolve, as `mzDecimalsOf` decides
   */
  mzDecimals?: number;
  /**
   * What explains a peak, keyed as `peakKey` keys it — the name written on top
   * of its label. This is how a host annotates peaks without the chart having
   * to know where the names came from.
   * @default undefined
   */
  annotationLabels?: ReadonlyMap<string, string>;
  /**
   * The m/z a guide is drawn at, `null` for none — the peak a row of a table
   * beside the chart is resting on.
   * @default null
   */
  highlightMz?: number | null;
  /**
   * Told which picked peak the pointer has come to rest on, and told `null` when
   * it leaves one — called only when the answer changes.
   * @default undefined
   */
  onPeakHover?: (peak: NearestPeak | null) => void;
  /**
   * The window to show, `null` to let the chart show what fits.
   *
   * The chart holds a window of its own, so this is an override rather than the
   * chart's state: every window a gesture arrives at is reported through
   * `onDomainChange`, and a host that keeps one is expected to hand back what it
   * is told. Handing back `null` where a window was is how a host asks for the
   * fit again.
   * @default null
   */
  domain?: MassDomain | null;
  /**
   * Told the window the chart has come to show, whenever it changes — a drag, a
   * turn of the wheel, the double click that fits everything again, or a refit
   * after what is drawn changed.
   * @default undefined
   */
  onDomainChange?: (domain: MassDomain) => void;
  /**
   * Told where a click on the plot landed, in m/z, and the picked peak within
   * reach of it — `null` when it landed on none. The end of a drag is never a
   * click.
   * @default undefined
   */
  onPlotClick?: (mz: number, peak: NearestPeak | null) => void;
  /**
   * What a drag across the plot asks for: the m/z axis alone, or exactly the
   * rectangle it sweeps out.
   * @default 'xAxis'
   */
  drag?: ZoomDragMode;
  /**
   * Whether the chart answers `f` with the fit itself. A viewer around it that
   * runs its keys through a command table turns this off.
   * @default true
   */
  answersKeys?: boolean;
  /**
   * Identity of the spectrum drawn thicker than the rest, `null` for none.
   * @default null
   */
  emphasisedId?: string | null;
  /**
   * How wide the chart is drawn, in pixels.
   * @default the width of its container
   */
  width?: number;
  /**
   * How tall it is drawn, in pixels.
   * @default the height of its container
   */
  height?: number;
  /**
   * Anything else to draw over the spectra, in the same pixels and under the
   * same clip. Rendered last inside the plot, so a host adds to the chart
   * instead of forking it.
   * @default undefined
   */
  children?: ReactNode;
}
