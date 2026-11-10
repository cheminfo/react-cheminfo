/**
 * What a host drives the viewer through once it is mounted.
 *
 * A sealed component takes its document as a prop and reports it back through
 * `onChange`; everything else a host asks of it — frame this line, take these
 * spectra, tell me what is open — is a gesture rather than a state, and
 * threading a gesture through props means inventing a token that changes
 * whenever the same gesture is made twice. NMRium settled the same question the
 * same way, and this is the handle its `ref` carries.
 */

import type { XpsSpectrum } from './xpsSpectrum.ts';
import type { XpsState } from './xpsState.ts';

/**
 * How far in eV either side of a line the chart is framed on.
 *
 * Ten, which is the width a narrow scan is usually acquired over: it holds a
 * spin-orbit doublet and the chemically shifted components under it, which is
 * what a line is read in. A single component framed on its own says nothing
 * about the envelope it belongs to.
 */
export const ENERGY_WINDOW = 10;

/** How wide a window an energy is framed in. */
export interface ZoomToEnergyOptions {
  /**
   * Half the width of the window, in eV.
   * @default ENERGY_WINDOW
   */
  halfWidth?: number;
}

/**
 * The viewer, as whatever mounted it holds it.
 *
 * Named a handle rather than an API because `XpsEditorApi` already answers for
 * the state hook — the thing this is implemented on top of — and two names for
 * two very different objects is what keeps an import from being read wrong.
 *
 * Every member is stable for the life of the viewer, so a host may keep one in
 * an effect's dependency list without re-running it on every zoom.
 */
export interface XpsEditorHandle {
  /**
   * Open more spectra, keeping the ones already open.
   * @param spectra - The spectra, each with an identity nothing open shares.
   */
  addSpectra: (spectra: XpsSpectrum[]) => void;
  /**
   * Open these spectra and no others, closing whatever was open.
   *
   * The workspace is kept — the axis, the background, the tolerance — because
   * this replaces the document and not the viewer: a host stepping through a
   * folder of VAMAS files would otherwise put every setting back to its default
   * on each step.
   * @param spectra - The spectra to be showing.
   */
  setSpectra: (spectra: XpsSpectrum[]) => void;
  /** Close every spectrum and start again from an empty chart. */
  clear: () => void;
  /**
   * Frame a binding energy on the chart, keeping the counts axis where it was.
   *
   * The height is deliberately not refitted to what falls inside the new
   * window: a request to look at the C 1s region that also rescaled the counts
   * would make whatever was asked for fill the plot, so every line would look
   * like the strongest one.
   *
   * The energy is a **binding** energy whichever axis the chart is drawn
   * against, since that is what a line is published in; the conversion to the
   * axis on screen is the viewer's to make.
   * @param bindingEnergy - The energy in eV to frame.
   * @param options - How wide a window to frame it in.
   */
  zoomToEnergy: (bindingEnergy: number, options?: ZoomToEnergyOptions) => void;
  /**
   * Everything the viewer knows, in the three buckets it holds it in.
   *
   * Read at the moment it is asked for rather than closed over, so a host that
   * kept the handle from the first render still reads the spectra that are open
   * now. It is the very state the chart is drawing and is never to be mutated.
   * @returns The state.
   */
  getState: () => XpsState;
}
