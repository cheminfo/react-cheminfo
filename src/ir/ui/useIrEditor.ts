/**
 * One viewer's state, and everything derived from it.
 *
 * The bands are derived here rather than held, and that is the one structural
 * decision in this file. Picking is a pure function of a spectrum and the
 * picking settings, so a band held in state would be an answer that has to be
 * invalidated by hand every time either changes — and the version that is wrong
 * is the one drawn on the chart. Derived, a stale band cannot exist.
 *
 * It is memoised on the selected spectrum rather than on all of them: picking
 * runs a peak detection over a few thousand points, and doing it for six loaded
 * spectra when the panels only ever show one would cost six times what it needs
 * to on every change of a threshold.
 */

import { useEffect, useMemo, useReducer, useRef } from 'react';

import type { AssignedBand } from '../core/assignBands.ts';
import { assignBands } from '../core/assignBands.ts';
import type { CreateIrStateOptions } from '../core/irReducer.ts';
import { createIrState, irReducer } from '../core/irReducer.ts';
import type { IrSpectrum } from '../core/irSpectrum.ts';
import type { IrState } from '../core/irState.ts';
import { pickBands } from '../core/pickBands.ts';

import type { IrEditorActions } from './irActions.ts';
import { createIrActions } from './irActions.ts';

/** What a viewer opens on, and who to tell when the spectra change. */
export interface UseIrEditorOptions extends CreateIrStateOptions {
  /**
   * Called whenever the spectra open change — one loaded, one closed, the chart
   * cleared — with the spectra now open.
   * @default undefined
   */
  onChange?: (spectra: IrSpectrum[]) => void;
}

/** What a component drives the viewer through. */
export interface IrEditorApi {
  /** Everything the viewer knows, in its three buckets. */
  state: IrState;
  /** The spectra currently drawn, in the order they were loaded. */
  visibleSpectra: IrSpectrum[];
  /** The spectrum the panels act on, `null` while none is selected. */
  selectedSpectrum: IrSpectrum | null;
  /**
   * The bands of the selected spectrum, with everything each might be. Empty
   * while nothing is selected or while picking is switched off.
   */
  assigned: AssignedBand[];
  /** Everything to do. */
  actions: IrEditorActions;
}

/**
 * Hold one viewer's state.
 * @param options - What it opens on.
 * @returns The state, what follows from it, and everything to do.
 */
export function useIrEditor(options: UseIrEditorOptions = {}): IrEditorApi {
  const { onChange, ...initial } = options;

  const [state, dispatch] = useReducer(irReducer, initial, createIrState);
  const actions = useMemo(() => createIrActions(dispatch), [dispatch]);

  const { spectra } = state.data;
  const { selectedId } = state.view;
  const { pickBands: picking, picking: pickingOptions } = state.settings;
  const { assignmentTolerance } = state.settings;

  const visibleSpectra = useMemo(() => {
    const visible: IrSpectrum[] = [];
    for (const spectrum of spectra) {
      if (spectrum.visible) visible.push(spectrum);
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

  const bands = useMemo(
    () =>
      selectedSpectrum === null || !picking
        ? []
        : pickBands(selectedSpectrum, pickingOptions),
    [selectedSpectrum, picking, pickingOptions],
  );

  // Assigning is a walk of thirty ranges per band, which is nothing beside the
  // picking — so it is a memo of its own, and moving the tolerance does not
  // re-pick.
  const assigned = useMemo(
    () => assignBands(bands, { tolerance: assignmentTolerance }),
    [bands, assignmentTolerance],
  );

  // What was reported last, so a host passing a fresh callback on every render
  // is not told about spectra that did not change. The identities are compared
  // rather than the array: every edit replaces it, including the ones that only
  // change how a spectrum is drawn.
  const reported = useRef(spectra);
  useEffect(() => {
    if (sameSpectra(reported.current, spectra)) return;
    reported.current = spectra;
    onChange?.(spectra);
  }, [spectra, onChange]);

  return useMemo(
    () => ({ state, visibleSpectra, selectedSpectrum, assigned, actions }),
    [state, visibleSpectra, selectedSpectrum, assigned, actions],
  );
}

/**
 * Whether two lists hold the same spectra, by identity and in order.
 * @param current - What was reported last.
 * @param next - What is open now.
 * @returns Whether the report can be skipped.
 */
function sameSpectra(
  current: readonly IrSpectrum[],
  next: readonly IrSpectrum[],
): boolean {
  if (current === next) return true;
  if (current.length !== next.length) return false;
  for (let index = 0; index < current.length; index++) {
    if ((current[index] as IrSpectrum).id !== (next[index] as IrSpectrum).id) {
      return false;
    }
  }
  return true;
}
