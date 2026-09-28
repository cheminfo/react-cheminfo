/**
 * Every change the viewer can undergo, as one function over one object.
 *
 * A reducer rather than a graph of signals, for the reason
 * `docs/decisions.md` gives about the glycan editor: a published component must
 * not impose a state library on the page that mounts it, and two viewers on one
 * page must not share a module-level singleton. The state is a plain object, so a
 * host can save it, restore it and compare it.
 *
 * Every case returns the state **itself** when it has nothing to do, so a render
 * memoised on the state is not defeated by an action that changed nothing —
 * selecting the spectrum already selected, closing an error that is already
 * closed.
 */

import type { IrSidePanelId } from './irSidePanels.ts';
import type { IrDomain, IrSpectrum } from './irSpectrum.ts';
import type { IrSettings, IrState, IrTool, PartialIrState } from './irState.ts';
import {
  DEFAULT_SETTINGS,
  DEFAULT_SIDE_PANELS,
  isIrWindow,
  mergeIrSettings,
} from './irState.ts';

/** Everything that can be asked of the viewer. */
export type IrAction =
  | { type: 'addSpectra'; spectra: IrSpectrum[] }
  | { type: 'setSpectra'; spectra: IrSpectrum[] }
  | { type: 'removeSpectrum'; id: string }
  | { type: 'renameSpectrum'; id: string; name: string }
  | { type: 'setSpectrumColor'; id: string; color: string }
  | { type: 'setSpectrumVisible'; id: string; visible: boolean }
  | { type: 'selectSpectrum'; id: string | null }
  | { type: 'setDomain'; domain: IrDomain }
  | { type: 'resetDomain' }
  | { type: 'setTool'; tool: IrTool }
  | { type: 'togglePanel'; panelId: IrSidePanelId }
  | { type: 'setError'; error: string | null }
  | { type: 'setSettings'; settings: Partial<IrSettings> }
  | { type: 'loadState'; state: PartialIrState }
  | { type: 'clear' };

/** What a viewer opens on. */
export interface CreateIrStateOptions {
  /**
   * The spectra to open on.
   * @default []
   */
  spectra?: IrSpectrum[];
  /**
   * The workspace to open in.
   * @default DEFAULT_SETTINGS
   */
  settings?: Partial<IrSettings>;
  /**
   * The panels open to begin with.
   * @default DEFAULT_SIDE_PANELS
   */
  panelIds?: IrSidePanelId[];
}

/**
 * The state a viewer opens with.
 *
 * The panel list is spread rather than stored by reference: a caller's array is
 * the caller's to mutate, and a viewer holding it would find its open panels
 * changing under it.
 * @param options - What it opens on.
 * @returns The state.
 */
export function createIrState(options: CreateIrStateOptions = {}): IrState {
  const { spectra = [], settings, panelIds } = options;
  return {
    data: { spectra: [...spectra] },
    view: {
      selectedId: spectra[0]?.id ?? null,
      domain: null,
      tool: 'read',
      openPanelIds: [...(panelIds ?? DEFAULT_SIDE_PANELS)],
      error: null,
    },
    settings: mergeIrSettings(DEFAULT_SETTINGS, settings),
  };
}

/**
 * Fold one action into the state.
 * @param state - The state in force.
 * @param action - What is being asked.
 * @returns The new state, or the old one when nothing changed.
 */
export function irReducer(state: IrState, action: IrAction): IrState {
  switch (action.type) {
    case 'addSpectra': {
      if (action.spectra.length === 0) return state;
      const spectra = [...state.data.spectra, ...action.spectra];
      return {
        ...state,
        data: { spectra },
        view: {
          ...state.view,
          // Whatever arrived is what somebody wants to look at, so it takes the
          // selection — but only when nothing was selected, since a spectrum
          // added for comparison must not steal the panels from the one being
          // read.
          selectedId: state.view.selectedId ?? action.spectra[0]?.id ?? null,
          error: null,
        },
      };
    }

    case 'setSpectra': {
      return {
        ...state,
        data: { spectra: [...action.spectra] },
        view: {
          ...state.view,
          selectedId: action.spectra[0]?.id ?? null,
          // Replacing what is drawn is the one change that throws the window
          // away: a window over one spectrum's wavenumbers means nothing over
          // another's, and the chart refits when it is handed `null`.
          domain: null,
          error: null,
        },
      };
    }

    case 'removeSpectrum': {
      const spectra = state.data.spectra.filter(
        (spectrum) => spectrum.id !== action.id,
      );
      if (spectra.length === state.data.spectra.length) return state;
      return {
        ...state,
        data: { spectra },
        view: {
          ...state.view,
          selectedId:
            state.view.selectedId === action.id
              ? (spectra[0]?.id ?? null)
              : state.view.selectedId,
        },
      };
    }

    case 'renameSpectrum': {
      const name = action.name.trim();
      if (name === '') {
        return withError(state, 'A spectrum needs a name to be called by.');
      }
      return mapSpectrum(state, action.id, (spectrum) =>
        spectrum.name === name ? spectrum : { ...spectrum, name },
      );
    }

    case 'setSpectrumColor': {
      return mapSpectrum(state, action.id, (spectrum) =>
        spectrum.color === action.color
          ? spectrum
          : { ...spectrum, color: action.color },
      );
    }

    case 'setSpectrumVisible': {
      return mapSpectrum(state, action.id, (spectrum) =>
        spectrum.visible === action.visible
          ? spectrum
          : { ...spectrum, visible: action.visible },
      );
    }

    case 'selectSpectrum': {
      if (state.view.selectedId === action.id) return state;
      return { ...state, view: { ...state.view, selectedId: action.id } };
    }

    case 'setDomain': {
      if (!isIrWindow(action.domain)) return state;
      return { ...state, view: { ...state.view, domain: action.domain } };
    }

    case 'resetDomain': {
      if (state.view.domain === null) return state;
      return { ...state, view: { ...state.view, domain: null } };
    }

    case 'setTool': {
      if (state.view.tool === action.tool) return state;
      return { ...state, view: { ...state.view, tool: action.tool } };
    }

    case 'togglePanel': {
      const { openPanelIds } = state.view;
      const open = openPanelIds.includes(action.panelId);
      return {
        ...state,
        view: {
          ...state.view,
          openPanelIds: open
            ? openPanelIds.filter((id) => id !== action.panelId)
            : [...openPanelIds, action.panelId],
        },
      };
    }

    case 'setError': {
      if (state.view.error === action.error) return state;
      return { ...state, view: { ...state.view, error: action.error } };
    }

    case 'setSettings': {
      const settings = mergeIrSettings(state.settings, action.settings);
      return { ...state, settings };
    }

    case 'loadState': {
      const { data, view, settings } = action.state;
      return {
        data: data === undefined ? state.data : { spectra: [...data.spectra] },
        view: { ...state.view, ...view },
        settings: mergeIrSettings(state.settings, settings),
      };
    }

    case 'clear': {
      if (state.data.spectra.length === 0 && state.view.error === null) {
        return state;
      }
      return {
        ...state,
        data: { spectra: [] },
        view: { ...state.view, selectedId: null, domain: null, error: null },
      };
    }
    /* Every action is handled above, and TypeScript is what keeps that true
       when one is added — so there is nothing for a fallback to do. */
    // no default
  }
}

/**
 * Change one spectrum, leaving the state alone when it did not change.
 * @param state - The state in force.
 * @param id - Which spectrum.
 * @param change - What to make of it; return it unchanged for no change.
 * @returns The new state, or the old one.
 */
function mapSpectrum(
  state: IrState,
  id: string,
  change: (spectrum: IrSpectrum) => IrSpectrum,
): IrState {
  let changed = false;
  const spectra = state.data.spectra.map((spectrum) => {
    if (spectrum.id !== id) return spectrum;
    const next = change(spectrum);
    if (next !== spectrum) changed = true;
    return next;
  });
  if (!changed) return state;
  return { ...state, data: { spectra }, view: { ...state.view, error: null } };
}

/**
 * Refuse an action, saying why.
 * @param state - The state in force.
 * @param error - The sentence to show whoever asked.
 * @returns The state carrying the refusal.
 */
function withError(state: IrState, error: string): IrState {
  return { ...state, view: { ...state.view, error } };
}
