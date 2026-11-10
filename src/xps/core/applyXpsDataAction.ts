/**
 * The edits that change the document: which spectra are open, and how each of
 * them reads.
 *
 * Kept apart from the rest of the reducer because these are the only actions a
 * consumer is told about — everything else moves the window or the workspace —
 * and because every one of them has the same two obligations: find the spectrum
 * by its identity, and hand the state back untouched when there was nothing to
 * do. An identity nobody is holding becomes `view.error` rather than an
 * exception at the call site: a panel that fires an action for a spectrum which
 * has just been closed is a race between two renders, not a reason to take the
 * chart down.
 */

import {
  changeXpsSpectrum,
  indexOfXpsSpectrum,
  refuseXpsAction,
} from './changeXpsSpectrum.ts';
import type { XpsDataAction } from './xpsAction.ts';
import type { XpsSpectrum } from './xpsSpectrum.ts';
import type { XpsState } from './xpsState.ts';

/**
 * The state the viewer is in once a document edit has been applied.
 * @param state - The state to change.
 * @param action - What to do.
 * @returns The new state, the same object when there was nothing to do.
 */
export function applyXpsDataAction(
  state: XpsState,
  action: XpsDataAction,
): XpsState {
  const held = state.data.spectra;

  switch (action.type) {
    case 'addSpectra': {
      const { spectra } = action;
      if (spectra.length === 0) return state;
      const identities = new Set<string>();
      for (const spectrum of held) identities.add(spectrum.id);
      for (const spectrum of spectra) {
        if (identities.has(spectrum.id)) {
          return refuseXpsAction(
            state,
            `The spectrum "${spectrum.name}" is already open, so it was not loaded a second time`,
          );
        }
        identities.add(spectrum.id);
      }
      const first = spectra[0] as XpsSpectrum;
      return {
        ...state,
        data: { spectra: [...held, ...spectra] },
        view: {
          ...state.view,
          // A spectrum just dropped in has to be visible, so a window set on
          // the spectra before it is given up rather than hiding it off-screen.
          domain: null,
          selectedId: state.view.selectedId ?? first.id,
          error: null,
        },
      };
    }

    case 'removeSpectrum': {
      const index = indexOfXpsSpectrum(held, action.id);
      if (index === -1) {
        return refuseXpsAction(
          state,
          `No open spectrum has the identity ${action.id}, so nothing was closed`,
        );
      }
      const spectra = held.toSpliced(index, 1);
      // The neighbour below, then the one above, so closing down a list leaves
      // the selection where the eye already is instead of dropping it.
      const neighbour = spectra[index] ?? spectra.at(-1) ?? null;
      const { view } = state;
      return {
        ...state,
        data: { spectra },
        view: {
          ...view,
          selectedId:
            view.selectedId === action.id
              ? (neighbour?.id ?? null)
              : view.selectedId,
          domain: spectra.length === 0 ? null : view.domain,
          error: null,
        },
      };
    }

    case 'renameSpectrum':
      return changeXpsSpectrum(
        state,
        action.id,
        { name: action.name },
        'renamed',
      );

    case 'setSpectrumColor':
      return changeXpsSpectrum(
        state,
        action.id,
        { color: action.color },
        'recoloured',
      );

    case 'setSpectrumVisibility':
      return changeXpsSpectrum(
        state,
        action.id,
        { visible: action.visible },
        'shown or hidden',
      );

    case 'setSpectrumPeaks':
      return changeXpsSpectrum(
        state,
        action.id,
        { peaks: action.peaks },
        'picked again',
      );

    case 'showOnly': {
      if (indexOfXpsSpectrum(held, action.id) === -1) {
        return refuseXpsAction(
          state,
          `No open spectrum has the identity ${action.id}, so nothing was shown on its own`,
        );
      }
      return drawEvery(state, action.id);
    }

    case 'showEvery':
      return drawEvery(state, null);

    case 'clear': {
      const { view } = state;
      if (
        held.length === 0 &&
        view.selectedId === null &&
        view.domain === null &&
        view.error === null
      ) {
        return state;
      }
      return {
        ...state,
        data: { spectra: [] },
        view: { ...view, selectedId: null, domain: null, error: null },
      };
    }

    // no default
  }
}

/**
 * Draw one spectrum on its own, or draw every one of them.
 *
 * The selection is left where it is: a survey scan shown alone while a narrow
 * scan of the same sample stays selected is exactly the pair a peak is read
 * against, and moving the selection with the traces would break it.
 * @param state - The state to change.
 * @param onlyId - Identity of the one to draw alone, `null` to draw them all.
 * @returns The new state, the same object when every trace is already right.
 */
function drawEvery(state: XpsState, onlyId: string | null): XpsState {
  const held = state.data.spectra;
  const spectra: XpsSpectrum[] = [];
  let changed = false;
  for (const spectrum of held) {
    const visible = onlyId === null || spectrum.id === onlyId;
    if (spectrum.visible === visible) {
      spectra.push(spectrum);
    } else {
      spectra.push({ ...spectrum, visible });
      changed = true;
    }
  }
  if (!changed && state.view.error === null) return state;
  return { ...state, data: { spectra }, view: { ...state.view, error: null } };
}
