/**
 * Everything the viewer can be asked to do, as functions rather than actions.
 *
 * A component that dispatched action objects would have the shape of the reducer
 * spread across every panel; one that calls `actions.selectSpectrum(id)` does
 * not, and the reducer stays free to change how it holds things.
 */

import type { Dispatch } from 'react';

import type { MassAction, SpectrumVisibility } from '../core/massReducer.ts';
import type { MassPanelId } from '../core/massSidePanels.ts';
import type { MassDomain, MassSpectrum } from '../core/massSpectrum.ts';
import type {
  MassSettings,
  MassTool,
  PartialMassState,
} from '../core/massState.ts';

/** Everything the viewer can be asked to do. */
export interface MassEditorActions {
  /** Draw these as well as what is already open. */
  addSpectra: (spectra: MassSpectrum[]) => void;
  /** Draw these instead of what is open, and refit the window to them. */
  setSpectra: (spectra: MassSpectrum[]) => void;
  /** Close one. */
  removeSpectrum: (id: string) => void;
  /** Call one something else. */
  renameSpectrum: (id: string, name: string) => void;
  /** Draw one in another colour. */
  setSpectrumColor: (id: string, color: string) => void;
  /** Draw one as its profile, as its sticks, or not at all. */
  setSpectrumVisibility: (id: string, visibility: SpectrumVisibility) => void;
  /** Point the panels at one, or at none. */
  selectSpectrum: (id: string | null) => void;
  /** Show this window. */
  setDomain: (domain: MassDomain) => void;
  /** Show what fits again. */
  resetDomain: () => void;
  /** Run this tool on the next drag. */
  setTool: (tool: MassTool) => void;
  /** Open or close a side panel, the viewer's own or one a host added. */
  togglePanel: (panelId: MassPanelId) => void;
  /** Say why something was refused, or that nothing is wrong any more. */
  setError: (error: string | null) => void;
  /** Change how the spectra are drawn. */
  setSettings: (settings: Partial<MassSettings>) => void;
  /** Take a whole state, as a host restoring one supplies it. */
  loadState: (state: PartialMassState) => void;
  /** Close every spectrum and start again from an empty chart. */
  clear: () => void;
}

/**
 * Bind every action to a dispatch.
 * @param dispatch - The reducer's dispatch.
 * @returns The actions, stable for as long as the dispatch is.
 */
export function createMassActions(
  dispatch: Dispatch<MassAction>,
): MassEditorActions {
  return {
    addSpectra(spectra) {
      dispatch({ type: 'addSpectra', spectra });
    },
    setSpectra(spectra) {
      dispatch({ type: 'setSpectra', spectra });
    },
    removeSpectrum(id) {
      dispatch({ type: 'removeSpectrum', id });
    },
    renameSpectrum(id, name) {
      dispatch({ type: 'renameSpectrum', id, name });
    },
    setSpectrumColor(id, color) {
      dispatch({ type: 'setSpectrumColor', id, color });
    },
    setSpectrumVisibility(id, visibility) {
      dispatch({ type: 'setSpectrumVisibility', id, visibility });
    },
    selectSpectrum(id) {
      dispatch({ type: 'selectSpectrum', id });
    },
    setDomain(domain) {
      dispatch({ type: 'setDomain', domain });
    },
    resetDomain() {
      dispatch({ type: 'resetDomain' });
    },
    setTool(tool) {
      dispatch({ type: 'setTool', tool });
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
    clear() {
      dispatch({ type: 'clear' });
    },
  };
}
