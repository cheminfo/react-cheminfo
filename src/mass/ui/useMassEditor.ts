/**
 * One viewer's state, and everything derived from it.
 *
 * What is derived here is what three panels and the chart read alike — which
 * spectra are drawn, which one is selected, and how many decimals every mass on
 * screen is written with — so it is worked out once per change rather than once
 * per reader.
 */

import { useMemo, useReducer } from 'react';

import {
  useReportedSpectra,
  useSelectedSpectrum,
  useVisibleSpectra,
} from '../../panel/ui/spectrumHooks.ts';
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

  const visibleSpectra = useVisibleSpectra(spectra, isSpectrumDrawn);
  const selectedSpectrum = useSelectedSpectrum(spectra, selectedId);

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

  useReportedSpectra(spectra, onChange);

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
