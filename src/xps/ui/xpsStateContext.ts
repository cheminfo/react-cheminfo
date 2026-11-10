/**
 * The viewer's state, reached from wherever it is needed rather than handed
 * down.
 *
 * The shell is a chart, a toolbar, a status bar and a stack of six panels, and
 * every one of them wants a different slice of the same state — which spectrum
 * is selected, what window is shown, which axis the chart is drawn against, how
 * near a reference has to be. Passing those slices down as props puts a dozen
 * of them on the toolbar alone, most of which the viewer only holds in order to
 * pass on.
 *
 * Two contexts rather than one: the state changes on every gesture, the actions
 * never change at all. A component that only fires actions takes them from the
 * second and is free to be memoized against the first — which matters here more
 * than in most editors, since dragging a zoom across the chart re-renders
 * everything subscribed to the state on every frame.
 */

import type { Dispatch } from 'react';
import { createContext, useContext } from 'react';

import type { XpsAction } from '../core/xpsAction.ts';
import type { XpsEditorActions } from '../core/xpsActions.ts';
import type { XpsState } from '../core/xpsState.ts';

/** The state, and the way to change it. */
export interface XpsStateHandle {
  /** Everything the viewer knows, in its three buckets. */
  state: XpsState;
  /**
   * Where an action goes. Offered beside the actions because a host page may
   * hold the state itself — replaying a session, undoing a step — and then it
   * is the dispatch that has to be shared rather than the reducer.
   */
  dispatch: Dispatch<XpsAction>;
}

/** Everything one viewer knows, as the provider holds it. */
export const stateContext = createContext<XpsStateHandle | null>(null);

/** Everything that changes it, as the provider holds it. */
export const actionsContext = createContext<XpsEditorActions | null>(null);

/**
 * The state in its three buckets, and the dispatch that changes it.
 * @returns The viewer's state and its dispatch.
 */
export function useXpsEditorState(): XpsStateHandle {
  const handle = useContext(stateContext);
  if (handle === null) {
    throw new Error(
      'The XPS viewer state was read outside an XpsStateProvider',
    );
  }
  return handle;
}

/**
 * Everything that changes the spectra, without subscribing to what they
 * currently are.
 * @returns The actions, the same object for the life of the viewer.
 */
export function useXpsActions(): XpsEditorActions {
  const actions = useContext(actionsContext);
  if (actions === null) {
    throw new Error(
      'The XPS viewer actions were read outside an XpsStateProvider',
    );
  }
  return actions;
}
