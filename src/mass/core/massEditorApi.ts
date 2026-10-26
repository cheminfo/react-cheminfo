/**
 * The handle a host drives the viewer through.
 *
 * A handle rather than props, for the reason NMRium uses one: "frame this peak"
 * and "take these spectra" are *gestures*, and a gesture expressed as a prop has
 * to change to be obeyed — so asking for the same window twice does nothing the
 * second time, and a host ends up inventing a nonce to make it work.
 */

import type { MassDomain, MassSpectrum } from './massSpectrum.ts';

/** How much room to leave either side of a mass a host asks to be framed. */
export interface ZoomToMzOptions {
  /**
   * How much of the m/z axis to show either side of the mass.
   * @default MZ_FRAME_HALF_WIDTH
   */
  halfWidth?: number;
}

/** What a host can ask of the viewer. */
export interface MassEditorHandle {
  /** The spectra that are open, in the order they were loaded. */
  getSpectra: () => MassSpectrum[];
  /** Draw these instead of what is open, and refit to them. */
  setSpectra: (spectra: MassSpectrum[]) => void;
  /** Draw these as well as what is open. */
  addSpectra: (spectra: MassSpectrum[]) => void;
  /**
   * Read files the way a drop on the chart reads them, and add what they hold.
   * Resolves once every file has been read; what could not be read is said in
   * the status bar.
   */
  openFiles: (files: readonly File[]) => Promise<void>;
  /** Close every spectrum. */
  clear: () => void;
  /** Show this window. */
  setDomain: (domain: MassDomain) => void;
  /** Show what fits. */
  resetDomain: () => void;
  /**
   * Frame a mass, keeping the intensity axis as it is.
   *
   * The commonest thing a host wants: a peak named in a table beside the viewer
   * is clicked, and the chart should go there.
   */
  zoomToMz: (mz: number, options?: ZoomToMzOptions) => void;
  /** Point the panels at one spectrum, or at none. */
  selectSpectrum: (id: string | null) => void;
}

/**
 * A click on the plot, as the viewer tells its host about it.
 *
 * A click is a press let go over the plot without travelling: the end of a zoom
 * drag is never one, and a click on the axis labels is not reported.
 */
export interface MassPlotClick {
  /** Where it landed on the m/z axis. */
  mz: number;
  /**
   * The m/z of the picked peak within reach of the click, `null` when it landed
   * on none — an empty stretch of the plot is not a peak of zero.
   */
  peakMz: number | null;
  /** Identity of the spectrum selected when it was made, `null` for none. */
  spectrumId: string | null;
}
