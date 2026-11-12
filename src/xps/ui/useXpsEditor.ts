/**
 * The viewer's state as a hook: a reducer over `XpsState`, the dispatch that
 * drives it and one stable object of gestures.
 *
 * Per mount, never per module. A page showing two charts is showing two sets of
 * spectra — a sample beside its reference, a survey above the narrow scan it
 * was picked from — and a state shared between them would make one zoom move
 * the other.
 *
 * The handle is what a host page drives the viewer from outside with: it holds
 * the state, so it can write it to a file, and it holds the actions, so it can
 * open one.
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import type { XpsEditorActions } from '../core/xpsActions.ts';
import { createXpsActions } from '../core/xpsActions.ts';
import type { CreateXpsStateOptions } from '../core/xpsReducer.ts';
import { createXpsState, xpsReducer } from '../core/xpsReducer.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';

import {
  DEFAULT_INSTRUMENT_STORAGE_KEY,
  instrumentBucket,
} from './instrumentStorage.ts';
import type { XpsStateHandle } from './xpsStateContext.ts';

/** What a viewer opens on, and who to tell when the spectra change. */
export interface UseXpsEditorOptions extends CreateXpsStateOptions {
  /**
   * Called whenever the spectra open change — one loaded, one closed, the
   * chart cleared, a state read back from a file — with the spectra now open.
   * It is not called for the ones the viewer opened on.
   *
   * Only for the document: a zoom, a selection, a rename or a colour changes
   * what is being looked at rather than what is loaded, and a consumer told
   * about those would re-derive its composition on every drag of the mouse.
   * @default undefined
   */
  onChange?: (spectra: XpsSpectrum[]) => void;
  /**
   * The key of this browser's storage the instruments are kept under between
   * visits, with the one chosen and the background; `null` keeps them for this
   * page only. Read when the viewer opens.
   * @default DEFAULT_INSTRUMENT_STORAGE_KEY
   */
  storageKey?: string | null;
}

/** What a host page drives the viewer through. */
export interface XpsEditorApi extends XpsStateHandle {
  /** Everything to do. */
  actions: XpsEditorActions;
}

/**
 * Hold the spectra a chart is showing.
 *
 * The options are only read when the viewer opens: what is on the chart
 * belongs to the viewer from then on, so a consumer re-rendering with another
 * array of spectra does not silently replace them — `actions.addSpectra` and
 * `actions.loadState` are how spectra arrive after the first render.
 * @param options - What the viewer opens on.
 * @returns The state, the dispatch and the actions that change it.
 */
export function useXpsEditor(options: UseXpsEditorOptions = {}): XpsEditorApi {
  const {
    onChange,
    storageKey = DEFAULT_INSTRUMENT_STORAGE_KEY,
    ...initial
  } = options;

  const [bucket] = useState(() =>
    storageKey === null ? null : instrumentBucket(storageKey),
  );

  // `useReducer` rather than a `useState` holding the last state in a ref: two
  // actions dispatched from one event have to be applied one after the other
  // rather than both against what was on screen before either of them, and
  // queueing them is what a reducer already does.
  const [state, dispatch] = useReducer(xpsReducer, initial, (opening) =>
    createXpsState({
      ...opening,
      // What the caller states wins over what this browser kept.
      settings: { ...bucket?.read().value, ...opening.settings },
    }),
  );

  const { instrumentId, instruments, surveyBackground } = state.settings;
  useEffect(() => {
    bucket?.write({ instrumentId, instruments, surveyBackground });
  }, [bucket, instrumentId, instruments, surveyBackground]);

  // An instrument entered in another tab of the same site is here as well.
  useEffect(
    () =>
      bucket?.subscribe(({ value }) => {
        dispatch({ type: 'setSettings', settings: value });
      }),
    [bucket],
  );

  const actions = useMemo(() => createXpsActions(dispatch), [dispatch]);

  // The spectra the host has already been told about. Compared by identity
  // rather than by contents: every edit replaces the array, including the ones
  // that only change how a spectrum is drawn, and those are not the document.
  const notified = useRef(state.data.spectra);
  useLayoutEffect(() => {
    const { spectra } = state.data;
    if (sameSpectra(notified.current, spectra)) return;
    notified.current = spectra;
    onChange?.(spectra);
  });

  return useMemo(
    () => ({ state, dispatch, actions }),
    [state, dispatch, actions],
  );
}

/**
 * Whether two lists hold the same spectra, whatever has been done to them.
 * @param current - The spectra open before the action.
 * @param next - The spectra open after it.
 * @returns Whether the same identities are open, in the same order.
 */
function sameSpectra(
  current: readonly XpsSpectrum[],
  next: readonly XpsSpectrum[],
): boolean {
  if (current === next) return true;
  if (current.length !== next.length) return false;
  for (let index = 0; index < current.length; index++) {
    if (
      (current[index] as XpsSpectrum).id !== (next[index] as XpsSpectrum).id
    ) {
      return false;
    }
  }
  return true;
}
