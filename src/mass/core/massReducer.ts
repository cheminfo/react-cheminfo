/**
 * Every change the viewer can undergo, as one function over one object.
 *
 * A reducer rather than a graph of signals: a published component must not
 * impose a state library on the page that mounts it, and two viewers on one
 * page must not share a module-level singleton. The state is a plain object, so
 * a host can save it, restore it and compare it.
 *
 * Every case returns the state **itself** when it has nothing to do, so a render
 * memoised on the state is not defeated by an action that changed nothing —
 * selecting the spectrum already selected, closing an error already closed.
 */

import type { MassPanelId } from './massSidePanels.ts';
import type { MassDomain, MassSpectrum } from './massSpectrum.ts';
import type {
  MassSettings,
  MassState,
  MassTool,
  PartialMassState,
} from './massState.ts';
import { isMassWindow, mergeMassSettings } from './massState.ts';
import {
  arriving,
  mapSpectrum,
  restoreState,
  withError,
} from './massStateEdits.ts';

/**
 * Which of a spectrum's two traces are drawn. Both are named every time,
 * because they are an either/or: drawing one is also the gesture that puts the
 * other away.
 */
export interface SpectrumVisibility {
  /** Whether the continuous trace is drawn. */
  showProfile: boolean;
  /** Whether the centroid sticks are drawn. */
  showCentroid: boolean;
}

/** Everything that can be asked of the viewer. */
export type MassAction =
  | { type: 'addSpectra'; spectra: MassSpectrum[] }
  | { type: 'setSpectra'; spectra: MassSpectrum[] }
  | { type: 'removeSpectrum'; id: string }
  | { type: 'renameSpectrum'; id: string; name: string }
  | { type: 'setSpectrumColor'; id: string; color: string }
  | {
      type: 'setSpectrumVisibility';
      id: string;
      visibility: SpectrumVisibility;
    }
  | { type: 'selectSpectrum'; id: string | null }
  | { type: 'setDomain'; domain: MassDomain }
  | { type: 'resetDomain' }
  | { type: 'setTool'; tool: MassTool }
  | { type: 'togglePanel'; panelId: MassPanelId }
  | { type: 'setError'; error: string | null }
  | { type: 'setSettings'; settings: Partial<MassSettings> }
  | { type: 'loadState'; state: PartialMassState }
  | { type: 'clear' };

/**
 * Fold one action into the state.
 * @param state - The state in force.
 * @param action - What is being asked.
 * @returns The new state, or the old one when nothing changed.
 */
export function massReducer(state: MassState, action: MassAction): MassState {
  switch (action.type) {
    case 'addSpectra': {
      const added = arriving(state, action.spectra);
      if (added.length === 0) return state;
      return {
        ...state,
        data: { spectra: [...state.data.spectra, ...added] },
        view: {
          ...state.view,
          // Whatever arrived is what somebody wants to look at, so it takes the
          // selection — but only when nothing was selected, since a spectrum
          // added for comparison must not steal the panels from the one being
          // read.
          selectedId: state.view.selectedId ?? added[0]?.id ?? null,
          error: null,
        },
      };
    }

    case 'setSpectra': {
      const spectra = arriving(
        { ...state, data: { spectra: [] } },
        action.spectra,
      );
      return {
        ...state,
        data: { spectra },
        view: {
          ...state.view,
          selectedId: spectra[0]?.id ?? null,
          // Replacing what is drawn is the one change that throws the window
          // away: a window over one spectrum's masses means nothing over
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

    case 'setSpectrumVisibility': {
      return mapSpectrum(state, action.id, (spectrum) => {
        // A spectrum read from a peak table has no profile to draw, and asking
        // for one must not leave it drawn as nothing at all.
        const showProfile =
          action.visibility.showProfile && spectrum.profile !== null;
        const { showCentroid } = action.visibility;
        return spectrum.showProfile === showProfile &&
          spectrum.showCentroid === showCentroid
          ? spectrum
          : { ...spectrum, showProfile, showCentroid };
      });
    }

    case 'selectSpectrum': {
      if (state.view.selectedId === action.id) return state;
      return { ...state, view: { ...state.view, selectedId: action.id } };
    }

    case 'setDomain': {
      if (!isMassWindow(action.domain)) return state;
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
      const settings = mergeMassSettings(state.settings, action.settings);
      const { showLabels, labelLimit, showCharges, mzDecimals } =
        state.settings;
      if (
        settings.showLabels === showLabels &&
        settings.labelLimit === labelLimit &&
        settings.showCharges === showCharges &&
        settings.mzDecimals === mzDecimals
      ) {
        return state;
      }
      return { ...state, settings };
    }

    case 'loadState': {
      return restoreState(state, action.state);
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
