/**
 * The three things every document edit does: find a spectrum by its identity,
 * refuse an action by saying why, and replace one spectrum with the same
 * spectrum carrying a change.
 *
 * Written once and shared, so a gesture cannot be accepted by one half of the
 * state and refused by the other: the reducer looks a selection up the same way
 * the edits look a rename up, and every refusal reads as a sentence in the one
 * place the user is already looking.
 */

import type { XpsSpectrum } from './xpsSpectrum.ts';
import type { XpsState } from './xpsState.ts';

/**
 * Replace one spectrum with the same spectrum carrying a change.
 *
 * The identity and every field the change does not mention travel across
 * untouched, which is what lets a rename keep the colour it was drawn in, the
 * peaks that were picked in it and the selection that was on it.
 * @param state - The state to change.
 * @param id - Identity of the spectrum.
 * @param change - The fields that change, each already known to be wanted.
 * @param gesture - What was being done, for the sentence a refusal reads as.
 * @returns The new state, the same object when the change says nothing new.
 */
export function changeXpsSpectrum(
  state: XpsState,
  id: string,
  change: Partial<XpsSpectrum>,
  gesture: string,
): XpsState {
  const held = state.data.spectra;
  const index = indexOfXpsSpectrum(held, id);
  if (index === -1) {
    return refuseXpsAction(
      state,
      `No open spectrum has the identity ${id}, so nothing was ${gesture}`,
    );
  }
  const spectrum = held[index] as XpsSpectrum;
  if (saysNothingNew(spectrum, change) && state.view.error === null) {
    return state;
  }
  return {
    ...state,
    data: { spectra: held.with(index, { ...spectrum, ...change }) },
    view: { ...state.view, error: null },
  };
}

/**
 * Where a spectrum sits in the list.
 * @param spectra - The spectra that are open.
 * @param id - Identity of the one wanted.
 * @returns Its index, or `-1` when no spectrum has that identity.
 */
export function indexOfXpsSpectrum(
  spectra: readonly XpsSpectrum[],
  id: string,
): number {
  for (let index = 0; index < spectra.length; index++) {
    if ((spectra[index] as XpsSpectrum).id === id) return index;
  }
  return -1;
}

/**
 * Refuse an action by saying why, in the one place the user is looking.
 *
 * Every refusal in the viewer goes through here rather than throwing: a panel
 * that fires an action for a spectrum somebody has just closed is a race
 * between two renders, and unmounting the chart over it would lose the other
 * forty-seven spectra as well. Refusing the same thing twice hands the state
 * back untouched, so a gesture repeated against a stale list does not ask for
 * another render.
 * @param state - The state that stands.
 * @param error - The sentence to show.
 * @returns The same state carrying the refusal, unchanged when it already does.
 */
export function refuseXpsAction(state: XpsState, error: string): XpsState {
  if (state.view.error === error) return state;
  return { ...state, view: { ...state.view, error } };
}

/**
 * Whether a change would leave a spectrum exactly as it is.
 * @param spectrum - The spectrum as it stands.
 * @param change - The fields that would be written.
 * @returns Whether every one of them already holds that value.
 */
function saysNothingNew(
  spectrum: XpsSpectrum,
  change: Partial<XpsSpectrum>,
): boolean {
  for (const key of Object.keys(change) as Array<keyof XpsSpectrum>) {
    if (change[key] !== spectrum[key]) return false;
  }
  return true;
}
