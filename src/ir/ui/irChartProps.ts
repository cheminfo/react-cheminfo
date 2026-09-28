/**
 * What a consumer hands the chart, and what the chart tells it back.
 *
 * Held apart from the component because it is the whole of the chart's public
 * API — every spectrum drawn, every band marked on it and every gesture that
 * comes back out is one of these — while the component behind it is an assembly
 * of half a dozen layers nobody needs to read in order to mount one.
 *
 * Everything arrives as a prop and nothing is reached for: the chart reads no
 * context and no store, so the same component serves an editor, a report page
 * that only ever draws one spectrum, and a test.
 */

import type { ReactNode } from 'react';

import type { ZoomDragMode } from '../../chart/core/chartDomain.ts';
import type { AssignedBand } from '../core/assignBands.ts';
import type { IrBand } from '../core/irBand.ts';
import type { IrDomain, IrMode, IrSpectrum } from '../core/irSpectrum.ts';

export interface IrChartProps {
  /** The spectra to draw, each saying in itself whether it is drawn. */
  spectra: readonly IrSpectrum[];
  /**
   * Which value axis to draw them in.
   *
   * A prop rather than state, so the switch lives with whoever owns the toolbar
   * that flips it — and so two charts of the same spectra can be shown side by
   * side, one in each, which is the clearest way to see what the pair means.
   * @default 'transmittance'
   */
  mode?: IrMode;
  /**
   * The bands to mark, with whatever the correlation table said about them.
   *
   * Handed in rather than picked here, because the same bands answer the chart,
   * a table beside it and any assignment count — and picking three times over
   * would let them disagree.
   * @default no bands
   */
  assigned?: readonly AssignedBand[];
  /**
   * Whether each band label names its assignment as well as its wavenumber.
   * @default false
   */
  showAssignments?: boolean;
  /**
   * At most how many bands are labelled; all of them are still marked.
   * @default 12
   */
  labelLimit?: number;
  /**
   * The band the pointer has come to rest on, wherever it was hovered. The chart
   * draws its mark larger, which is how a band hovered in a panel beside the
   * chart shows up on the trace.
   * @default null
   */
  highlight?: IrBand | null;
  /**
   * Told which band the pointer has come to rest on, and told `null` when it
   * leaves — called only when the answer changes, so it is safe to hang a
   * highlight that redraws half the page on it.
   * @default undefined
   */
  onHighlight?: (band: IrBand | null) => void;
  /**
   * The window to show, `null` to let the chart show what fits.
   *
   * The chart holds a window of its own — where you are looking is neither saved
   * nor undone — so this is an override rather than the chart's state. Every
   * window a gesture arrives at is reported through `onDomainChange`, and a host
   * that keeps one is expected to hand back what it is told. Handing back `null`
   * where a window was is how a host asks for the fit again, which is what "zoom
   * to fit" on a toolbar comes down to.
   *
   * `x` is in wavenumbers and runs low to high, whichever way the axis is drawn.
   * @default null
   */
  domain?: IrDomain | null;
  /**
   * Told the window the chart has come to show, whenever it changes — a drag, a
   * turn of the wheel, the double click that fits everything again, or a refit
   * after what is drawn changed.
   * @default undefined
   */
  onDomainChange?: (domain: IrDomain) => void;
  /**
   * What a drag across the plot asks for: the wavenumber axis alone, or exactly
   * the rectangle it sweeps out. A viewer offering a square-zoom tool switches
   * this while the tool is chosen.
   * @default 'xAxis'
   */
  drag?: ZoomDragMode;
  /**
   * Identity of the spectrum drawn thicker than the rest, `null` for none.
   * @default null
   */
  emphasisedId?: string | null;
  /**
   * How wide the chart is drawn, in pixels. Left out, it fills the box it is
   * given and follows it as that box is resized.
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
   * same clip — a band marking a region of interest, a second producer's layer,
   * a ruler. It is rendered last inside the plot, so a host adds to the chart
   * instead of forking it.
   * @default undefined
   */
  children?: ReactNode;
}
