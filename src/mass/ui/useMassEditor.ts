/**
 * One viewer's state, and everything derived from it.
 *
 * What is derived here is what three panels and the chart read alike — which
 * spectra are drawn, which one is selected, and how many decimals every mass on
 * screen is written with — so it is worked out once per change rather than once
 * per reader.
 */

import { useEffect, useMemo, useReducer, useRef } from 'react';

import { massReducer } from '../core/massReducer.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';
import { isSpectrumDrawn } from '../core/massSpectrum.ts';
import type { CreateMassStateOptions, MassState } from '../core/massState.ts';
import { createMassState } from '../core/massState.ts';
import { mzDecimalsFor } from '../core/mzDecimalsSetting.ts';
import { mzDecimalsOf } from '../core/resolutionOf.ts';

import type { MassEditorActions } from './massActions.ts';
import { createMassActions } from './massActions.ts';

/** What a viewer opens on, and who to tell when the spectra change. */
export interface UseMassEditorOptions extends CreateMassStateOptions {
  /**
   * Called whenever the spectra open change — one loaded, one closed, the chart
   * cleared — with the spectra now open.
   * @default undefined
   */
  onChange?: (spectra: MassSpectrum[]) => void;
}

/** What a component drives the viewer through. */
export interface MassEditorApi {
  /** Everything the viewer knows, in its three buckets. */
  state: MassState;
  /** The spectra currently drawn, by either trace, in the order they were loaded. */
  visibleSpectra: MassSpectrum[];
  /** The spectrum the panels act on, `null` while none is selected. */
  selectedSpectrum: MassSpectrum | null;
  /**
   * How many decimals the masses the panels write are written with: the number
   * chosen in the settings, or else the selected spectrum's own, since the peak
   * table, the acquisition table and the labels are all about it alone — a
   * nominal-mass table is written in whole numbers even beside an Orbitrap
   * scan. With nothing selected, what the drawn spectra resolve together — see
   * `mzDecimalsOf`.
   */
  mzDecimals: number;
  /**
   * What `mzDecimals` comes to when nothing is chosen, for a control that says
   * what choosing nothing would mean.
   */
  autoMzDecimals: number;
  /** Everything to do. */
  actions: MassEditorActions;
}

/**
 * Hold one viewer's state.
 * @param options - What it opens on.
 * @returns The state, what follows from it, and everything to do.
 */
export function useMassEditor(
  options: UseMassEditorOptions = {},
): MassEditorApi {
  const { onChange, ...initial } = options;

  const [state, dispatch] = useReducer(massReducer, initial, createMassState);
  const actions = useMemo(() => createMassActions(dispatch), [dispatch]);

  const { spectra } = state.data;
  const { selectedId } = state.view;

  const visibleSpectra = useMemo(() => {
    const visible: MassSpectrum[] = [];
    for (const spectrum of spectra) {
      if (isSpectrumDrawn(spectrum)) visible.push(spectrum);
    }
    return visible;
  }, [spectra]);

  const selectedSpectrum = useMemo(() => {
    if (selectedId === null) return null;
    for (const spectrum of spectra) {
      if (spectrum.id === selectedId) return spectrum;
    }
    return null;
  }, [spectra, selectedId]);

  const decimalsSetting = state.settings.mzDecimals;
  const shownSpectra = useMemo(
    () => (selectedSpectrum === null ? visibleSpectra : [selectedSpectrum]),
    [visibleSpectra, selectedSpectrum],
  );
  const autoMzDecimals = useMemo(
    () => mzDecimalsOf(shownSpectra),
    [shownSpectra],
  );
  const mzDecimals = useMemo(
    () => mzDecimalsFor(decimalsSetting, shownSpectra),
    [decimalsSetting, shownSpectra],
  );

  // What was reported last, so a host passing a fresh callback on every render
  // is not told about spectra that did not change. The identities are compared
  // rather than the array: a rename or a colour builds a new spectrum around
  // the same peaks, and that is not a change of what is loaded.
  const reported = useRef(spectra);
  useEffect(() => {
    if (sameSpectra(reported.current, spectra)) return;
    reported.current = spectra;
    onChange?.(spectra);
  }, [spectra, onChange]);

  return useMemo(
    () => ({
      state,
      visibleSpectra,
      selectedSpectrum,
      mzDecimals,
      autoMzDecimals,
      actions,
    }),
    [
      state,
      visibleSpectra,
      selectedSpectrum,
      mzDecimals,
      autoMzDecimals,
      actions,
    ],
  );
}

/**
 * Whether two lists hold the same spectra, in order.
 * @param current - What was reported last.
 * @param next - What is open now.
 * @returns Whether the report can be skipped.
 */
function sameSpectra(
  current: readonly MassSpectrum[],
  next: readonly MassSpectrum[],
): boolean {
  if (current === next) return true;
  if (current.length !== next.length) return false;
  for (let index = 0; index < current.length; index++) {
    if (
      (current[index] as MassSpectrum).id !== (next[index] as MassSpectrum).id
    ) {
      return false;
    }
  }
  return true;
}
