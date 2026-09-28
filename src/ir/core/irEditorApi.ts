/**
 * The handle a host drives the viewer through.
 *
 * A handle rather than props, for the reason NMRium uses one: "frame this band"
 * and "take these spectra" are *gestures*, and a gesture expressed as a prop has
 * to change to be obeyed — so asking for the same window twice does nothing the
 * second time, and a host ends up inventing a nonce to make it work.
 */

import type { IrDomain, IrSpectrum } from './irSpectrum.ts';

/** How much room to leave either side of a band a host asks to be framed. */
export interface ZoomToBandOptions {
  /**
   * How wide the window is, in cm⁻¹.
   * @default 200
   */
  width?: number;
}

/** What a host can ask of the viewer. */
export interface IrEditorHandle {
  /** The spectra that are open, in the order they were loaded. */
  getSpectra: () => IrSpectrum[];
  /** Draw these instead of what is open, and refit to them. */
  setSpectra: (spectra: IrSpectrum[]) => void;
  /** Draw these as well as what is open. */
  addSpectra: (spectra: IrSpectrum[]) => void;
  /** Close every spectrum. */
  clear: () => void;
  /** Show this window. */
  setDomain: (domain: IrDomain) => void;
  /** Show what fits. */
  resetDomain: () => void;
  /**
   * Frame a wavenumber, keeping the value axis as it is.
   *
   * The commonest thing a host wants: a band named in a table beside the viewer
   * is clicked, and the chart should go there.
   */
  zoomToWavenumber: (wavenumber: number, options?: ZoomToBandOptions) => void;
  /** Point the panels at one spectrum, or at none. */
  selectSpectrum: (id: string | null) => void;
}
