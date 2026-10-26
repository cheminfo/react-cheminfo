/**
 * The edits the reducer makes in more than one place, kept apart from it so
 * the reducer reads as the list of what can be asked of the viewer.
 */

import type { MassSpectrum } from './massSpectrum.ts';
import type { MassState, PartialMassState } from './massState.ts';
import { isMassWindow, mergeMassSettings } from './massState.ts';

/**
 * Change one spectrum, leaving the state itself when nothing changed.
 *
 * The edit returns the very spectrum it was handed when it has nothing to do,
 * and that is passed on: a rename to the name already held must not rebuild
 * the list, or every memo keyed on it is defeated by a keystroke that did
 * nothing.
 * @param state - The state in force.
 * @param id - Identity of the spectrum to change.
 * @param edit - What to do to it.
 * @returns The new state, or the old one when the spectrum is absent or the
 * edit changed nothing.
 */
export function mapSpectrum(
  state: MassState,
  id: string,
  edit: (spectrum: MassSpectrum) => MassSpectrum,
): MassState {
  let changed = false;
  const spectra = state.data.spectra.map((spectrum) => {
    if (spectrum.id !== id) return spectrum;
    const edited = edit(spectrum);
    if (edited !== spectrum) changed = true;
    return edited;
  });
  return changed ? { ...state, data: { spectra } } : state;
}

/**
 * The spectra of an arrival that are not open already.
 *
 * Identity is what every row, every trace and the selection are keyed on, so a
 * second spectrum under an identity already taken would be two rows React
 * cannot tell apart and one trace drawn twice. A host handing the same spectra
 * over again is asking for nothing new.
 * @param state - The state in force.
 * @param spectra - What is arriving.
 * @returns What is new, in the order it arrived.
 */
export function arriving(
  state: MassState,
  spectra: readonly MassSpectrum[],
): MassSpectrum[] {
  const taken = new Set<string>();
  for (const spectrum of state.data.spectra) taken.add(spectrum.id);
  const fresh: MassSpectrum[] = [];
  for (const spectrum of spectra) {
    if (taken.has(spectrum.id)) continue;
    taken.add(spectrum.id);
    fresh.push(spectrum);
  }
  return fresh;
}

/**
 * Take a whole state, as a host restoring one supplies it.
 *
 * What is restored is checked against what it is restored with: a selection
 * naming a spectrum that is not among the restored ones selects the first
 * instead, and a window no chart can be drawn on is dropped for the fit.
 * @param state - The state in force.
 * @param partial - What the host supplies.
 * @returns The restored state.
 */
export function restoreState(
  state: MassState,
  partial: PartialMassState,
): MassState {
  const spectra = partial.data?.spectra ?? state.data.spectra;
  const view = { ...state.view, ...partial.view };
  const selectable =
    view.selectedId !== null &&
    spectra.some((spectrum) => spectrum.id === view.selectedId);
  return {
    data: { spectra },
    view: {
      ...view,
      selectedId: selectable ? view.selectedId : (spectra[0]?.id ?? null),
      domain:
        view.domain !== null && isMassWindow(view.domain) ? view.domain : null,
      openPanelIds: [...view.openPanelIds],
    },
    settings: mergeMassSettings(state.settings, partial.settings),
  };
}

/**
 * Refuse an action, saying why.
 * @param state - The state in force.
 * @param error - The sentence to show whoever asked.
 * @returns The state carrying the refusal.
 */
export function withError(state: MassState, error: string): MassState {
  return { ...state, view: { ...state.view, error } };
}
