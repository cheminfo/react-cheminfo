/**
 * The changes of the viewer's state that are about bands: spectra arriving
 * with theirs or without, a list picked by hand, a list found automatically
 * again, and new picking settings, which pick again every list that was found
 * automatically.
 *
 * Apart from the reducer, which routes these actions here; like it, each
 * returns the state itself when it has nothing to do.
 */

import type { IrBand } from './irBand.ts';
import type { IrSpectrum } from './irSpectrum.ts';
import type { IrSettings, IrState, PartialIrState } from './irState.ts';
import { mergeIrSettings } from './irState.ts';
import type { PickBandsOptions } from './pickBands.ts';
import {
  orderedBands,
  repickBands,
  samePicking,
  withBands,
} from './spectrumBands.ts';

/**
 * Spectra arriving, each carrying its bands: its own, or picked now.
 * @param state - The state they arrive in.
 * @param spectra - The spectra.
 * @returns A new list.
 */
export function arriving(
  state: IrState,
  spectra: readonly IrSpectrum[],
): IrSpectrum[] {
  const { picking } = state.settings;
  return spectra.map((spectrum) => withBands(spectrum, picking));
}

/**
 * Give one spectrum bands picked by hand.
 * @param state - The state in force.
 * @param id - Which spectrum.
 * @param bands - Its bands, in any order.
 * @returns The new state, or the old one when they were its own already.
 */
export function setSpectrumBands(
  state: IrState,
  id: string,
  bands: IrBand[],
): IrState {
  return mapSpectrum(state, id, (spectrum) => {
    const ordered = orderedBands(spectrum.id, bands);
    return ordered === spectrum.bands && spectrum.bandsByHand === true
      ? spectrum
      : { ...spectrum, bands: ordered, bandsByHand: true };
  });
}

/**
 * Have one spectrum's bands found automatically again.
 * @param state - The state in force.
 * @param id - Which spectrum.
 * @returns The new state, or the old one when they already were.
 */
export function resetSpectrumBands(state: IrState, id: string): IrState {
  const { picking } = state.settings;
  return mapSpectrum(state, id, (spectrum) =>
    spectrum.bandsByHand
      ? repickBands({ ...spectrum, bandsByHand: false }, picking)
      : spectrum,
  );
}

/**
 * Fold a change into the workspace, and pick again what it changes.
 * @param state - The state in force.
 * @param change - What to change about the workspace.
 * @returns The new state.
 */
export function changeSettings(
  state: IrState,
  change: Partial<IrSettings>,
): IrState {
  const settings = mergeIrSettings(state.settings, change);
  const { spectra } = state.data;
  const picked = pickedAgain(spectra, state.settings.picking, settings.picking);
  return {
    ...state,
    data: picked === spectra ? state.data : { spectra: picked },
    settings,
  };
}

/**
 * Take a whole state, as a host restoring one supplies it.
 * @param state - The state in force.
 * @param restored - The parts the host supplies.
 * @returns The new state.
 */
export function restoreState(
  state: IrState,
  restored: PartialIrState,
): IrState {
  const { data, view, settings } = restored;
  const merged = mergeIrSettings(state.settings, settings);
  const spectra =
    data === undefined
      ? state.data.spectra
      : arriving({ ...state, settings: merged }, data.spectra);
  return {
    data: {
      spectra: pickedAgain(spectra, state.settings.picking, merged.picking),
    },
    view: { ...state.view, ...view },
    settings: merged,
  };
}

/**
 * Change one spectrum, leaving the state alone when it did not change.
 * @param state - The state in force.
 * @param id - Which spectrum.
 * @param change - What to make of it; return it unchanged for no change.
 * @returns The new state, or the old one.
 */
export function mapSpectrum(
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
 * The spectra under new picking settings: those found automatically picked
 * again.
 * @param spectra - The spectra.
 * @param before - The settings they were picked with.
 * @param after - The settings now in force.
 * @returns The same list when the settings pick as before.
 */
function pickedAgain(
  spectra: IrSpectrum[],
  before: PickBandsOptions,
  after: PickBandsOptions,
): IrSpectrum[] {
  if (samePicking(before, after)) return spectra;
  return spectra.map((spectrum) => repickBands(spectrum, after));
}
