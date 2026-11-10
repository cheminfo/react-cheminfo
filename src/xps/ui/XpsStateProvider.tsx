import type { ReactNode } from 'react';
import { useMemo, useReducer } from 'react';

import { createXpsActions } from '../core/xpsActions.ts';
import type { CreateXpsStateOptions } from '../core/xpsReducer.ts';
import { createXpsState, xpsReducer } from '../core/xpsReducer.ts';

import type { XpsStateHandle } from './xpsStateContext.ts';
import { actionsContext, stateContext } from './xpsStateContext.ts';

/** The one viewer a shell is drawn for, and the shell itself. */
export interface XpsStateProviderProps extends CreateXpsStateOptions {
  /**
   * The viewer held outside, as `useXpsEditor` returns it. Supplying it is
   * what lets a host page drive the chart — write the state to a file, read
   * one back, step through a session — since it is then holding the state the
   * shell is drawn from rather than watching a copy of it.
   *
   * Left out, the provider holds its own, which is what a viewer mounted on
   * its own needs; the options beside this one are then what it opens on, and
   * are ignored when a viewer is handed in.
   * @default undefined
   */
  editor?: XpsStateHandle;
  /** The shell it is read in. */
  children: ReactNode;
}

/**
 * Offer one viewer's state to the shell drawing it.
 *
 * Per mount, never per module: two charts on one page are two documents — a
 * survey scan beside the narrow scan it was picked from, an as-received sample
 * beside a sputtered one — and a state shared between them would make them one,
 * so closing a spectrum in either would take it out of both.
 * @param props - Component props.
 * @returns The shell, with the state reachable inside it.
 */
export function XpsStateProvider(props: XpsStateProviderProps) {
  const { editor, spectra, settings, panelIds, children } = props;

  const [ownState, ownDispatch] = useReducer(
    xpsReducer,
    { spectra, settings, panelIds },
    createXpsState,
  );

  const ownHandle = useMemo<XpsStateHandle>(
    () => ({ state: ownState, dispatch: ownDispatch }),
    [ownState, ownDispatch],
  );
  const handle = editor ?? ownHandle;

  // Built from the dispatch rather than taken off the handle, so a host page
  // holding nothing but a state and a dispatch drives the shell exactly as one
  // holding a whole editor does.
  const actions = useMemo(
    () => createXpsActions(handle.dispatch),
    [handle.dispatch],
  );

  return (
    <actionsContext.Provider value={actions}>
      <stateContext.Provider value={handle}>{children}</stateContext.Provider>
    </actionsContext.Provider>
  );
}
