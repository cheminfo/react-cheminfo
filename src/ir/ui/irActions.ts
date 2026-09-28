/**
 * Everything the viewer can be asked to do, as functions rather than actions.
 *
 * A component that dispatched action objects would have the shape of the reducer
 * spread across every panel; one that calls `actions.selectSpectrum(id)` does
 * not, and the reducer stays free to change how it holds things.
 */

import type { Dispatch } from 'react';

import type { IrAction } from '../core/irReducer.ts';
import type { IrSidePanelId } from '../core/irSidePanels.ts';
import type { IrDomain, IrSpectrum } from '../core/irSpectrum.ts';
import type { IrSettings, IrTool, PartialIrState } from '../core/irState.ts';

/** Everything the viewer can be asked to do. */
export interface IrEditorActions {
  /** Draw these as well as what is already open. */
  addSpectra: (spectra: IrSpectrum[]) => void;
  /** Draw these instead of what is open, and refit the window to them. */
  setSpectra: (spectra: IrSpectrum[]) => void;
  /** Close one. */
  removeSpectrum: (id: string) => void;
  /** Call one something else. */
  renameSpectrum: (id: string, name: string) => void;
  /** Draw one in another colour. */
  setSpectrumColor: (id: string, color: string) => void;
  /** Draw one, or stop drawing it. */
  setSpectrumVisible: (id: string, visible: boolean) => void;
  /** Point the panels at one, or at none. */
  selectSpectrum: (id: string | null) => void;
  /** Show this window. */
  setDomain: (domain: IrDomain) => void;
  /** Show what fits again. */
  resetDomain: () => void;
  /** Run this tool on the next drag. */
  setTool: (tool: IrTool) => void;
  /** Open or close a side panel. */
  togglePanel: (panelId: IrSidePanelId) => void;
  /** Say why something was refused, or that nothing is wrong any more. */
  setError: (error: string | null) => void;
  /** Change how the spectra are drawn and read. */
  setSettings: (settings: Partial<IrSettings>) => void;
  /** Take a whole state, as a host restoring one supplies it. */
  loadState: (state: PartialIrState) => void;
  /** Close every spectrum and start again from an empty chart. */
  clear: () => void;
}

/**
 * Bind every action to a dispatch.
 * @param dispatch - The reducer's dispatch.
 * @returns The actions, stable for as long as the dispatch is.
 */
export function createIrActions(dispatch: Dispatch<IrAction>): IrEditorActions {
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
    setSpectrumVisible(id, visible) {
      dispatch({ type: 'setSpectrumVisible', id, visible });
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
