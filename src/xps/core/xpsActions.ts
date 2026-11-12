/**
 * The viewer's API: one function per gesture, so a component dispatches nothing
 * itself and never has to know how an action is shaped.
 *
 * Every one of them names a spectrum by its identity. The spectra list, the
 * legend and the chart all show the same spectra, and their order changes the
 * moment a file is dropped or a spectrum is closed — an index handed across
 * this seam would recolour or close whichever spectrum has since taken that
 * place.
 */

import type { XpsSurveyLine } from './surveyLines.ts';
import type { XpsAction } from './xpsAction.ts';
import type { XpsPanelId } from './xpsSidePanels.ts';
import type { XpsDomain, XpsPeak, XpsSpectrum } from './xpsSpectrum.ts';
import type { PartialXpsState, XpsSettings } from './xpsState.ts';

/** Everything the viewer can be asked to do. */
export interface XpsEditorActions {
  /**
   * Open spectra, keeping the ones already open.
   *
   * A list rather than one at a time, because one VAMAS file is many spectra
   * and a consumer watching the document would otherwise be told about the
   * same drop once per block. The chart gives up whatever window it was
   * showing, since a spectrum just dropped in has to be visible; the first of
   * them is selected when nothing was.
   * @param spectra - The spectra, each with an identity nothing open shares.
   */
  addSpectra: (spectra: XpsSpectrum[]) => void;
  /**
   * Close a spectrum, leaving the selection on its neighbour.
   * @param id - Its identity.
   */
  removeSpectrum: (id: string) => void;
  /** Close every spectrum and start again from an empty chart. */
  clear: () => void;
  /**
   * Select the spectrum the panels act on.
   * @param id - Its identity, `null` to select nothing.
   */
  selectSpectrum: (id: string | null) => void;
  /**
   * Give a spectrum another name.
   *
   * The name is what the list calls it and never what anything addresses it
   * by, so a rename keeps the selection, the colour and the peaks picked in it.
   * @param id - Its identity.
   * @param name - What to call it.
   */
  renameSpectrum: (id: string, name: string) => void;
  /**
   * Draw a spectrum in another colour.
   * @param id - Its identity.
   * @param color - The colour, as CSS reads it.
   */
  setSpectrumColor: (id: string, color: string) => void;
  /**
   * Draw a spectrum, or stop drawing it.
   * @param id - Its identity.
   * @param visible - Whether its trace is on the chart.
   */
  setSpectrumVisibility: (id: string, visible: boolean) => void;
  /**
   * Draw one spectrum and no other.
   * @param id - Its identity.
   */
  showOnly: (id: string) => void;
  /** Draw every spectrum that is open, undoing a `showOnly`. */
  showEvery: () => void;
  /**
   * Replace the maxima found in a spectrum, as a fresh detection found them.
   * @param id - Its identity.
   * @param peaks - The peaks, in the order they are to be listed.
   */
  setSpectrumPeaks: (id: string, peaks: XpsPeak[]) => void;
  /**
   * Choose the lines a survey is quantified on, and the window of each.
   * @param id - Its identity.
   * @param lines - The lines, in the order the table lists them; `null` to go
   * back to the ones the panel works out from the narrow scans.
   */
  setSurveyLines: (id: string, lines: XpsSurveyLine[] | null) => void;
  /**
   * Show a window of the chart, as a drag across it asks for.
   * @param domain - The window, in binding energy and in counts.
   */
  setDomain: (domain: XpsDomain) => void;
  /**
   * Give the window back to the chart, which is "zoom to fit".
   *
   * A separate gesture rather than a window computed by the caller: the chart
   * is the only thing that knows what is currently drawn, and a window worked
   * out once would stop fitting the moment a trace is hidden.
   */
  resetDomain: () => void;
  /**
   * Stretch the counts axis about its baseline, leaving the energy axis alone.
   * @param factor - Above one magnifies the trace, below one pulls it back.
   * @param from - The window the chart is showing while the state holds none.
   */
  zoomY: (factor: number, from?: XpsDomain) => void;
  /**
   * Open a side panel that is closed, close one that is open.
   * @param panelId - The panel.
   */
  togglePanel: (panelId: XpsPanelId) => void;
  /**
   * Say why something outside the reducer was refused.
   *
   * A file that could not be read fails where it was dropped rather than where
   * the state is held, and this is how that failure reaches the one place the
   * user is already looking for a refusal.
   * @param error - The sentence to show, `null` to clear it.
   */
  setError: (error: string | null) => void;
  /**
   * Set how spectra are drawn, what is subtracted under them, and how near a
   * reference has to be before a peak is called an element.
   * @param settings - The settings that change; the rest are left alone.
   */
  setSettings: (settings: Partial<XpsSettings>) => void;
  /**
   * Open a state read back from a file, in place of the one held.
   * @param state - What the file held; what it left out comes back defaulted.
   */
  loadState: (state: PartialXpsState) => void;
}

/**
 * Bind the viewer's API to a dispatch.
 *
 * Nothing here closes over the state, only over the dispatch, so the object is
 * built once per viewer and handed to every component that fires a gesture —
 * which is what lets those components be memoized against a state that changes
 * on every frame of a drag.
 * @param dispatch - Where the actions go.
 * @returns The API, stable for as long as the dispatch is.
 */
export function createXpsActions(
  dispatch: (action: XpsAction) => void,
): XpsEditorActions {
  return {
    addSpectra(spectra) {
      dispatch({ type: 'addSpectra', spectra });
    },
    removeSpectrum(id) {
      dispatch({ type: 'removeSpectrum', id });
    },
    clear() {
      dispatch({ type: 'clear' });
    },
    selectSpectrum(id) {
      dispatch({ type: 'selectSpectrum', id });
    },
    renameSpectrum(id, name) {
      dispatch({ type: 'renameSpectrum', id, name });
    },
    setSpectrumColor(id, color) {
      dispatch({ type: 'setSpectrumColor', id, color });
    },
    setSpectrumVisibility(id, visible) {
      dispatch({ type: 'setSpectrumVisibility', id, visible });
    },
    showOnly(id) {
      dispatch({ type: 'showOnly', id });
    },
    showEvery() {
      dispatch({ type: 'showEvery' });
    },
    setSpectrumPeaks(id, peaks) {
      dispatch({ type: 'setSpectrumPeaks', id, peaks });
    },
    setSurveyLines(id, lines) {
      dispatch({ type: 'setSurveyLines', id, lines });
    },
    setDomain(domain) {
      dispatch({ type: 'setDomain', domain });
    },
    resetDomain() {
      dispatch({ type: 'resetDomain' });
    },
    zoomY(factor, from) {
      dispatch({ type: 'zoomY', factor, from });
    },
    togglePanel(panelId) {
      dispatch({ type: 'togglePanel', panelId });
    },
    setError(error) {
      dispatch({ type: 'setError', error });
    },
    setSettings(settings) {
      dispatch({ type: 'setSettings', settings });
    },
    loadState(state) {
      dispatch({ type: 'loadState', state });
    },
  };
}
