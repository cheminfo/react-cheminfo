/**
 * How a panel reaches the viewer it is inside.
 *
 * Two contexts rather than one, because the actions never change while the state
 * changes on every drag of the chart: a panel that only ever acts — a toolbar
 * button — reads the second and is not re-rendered by the first.
 */

import { createContext, useContext } from 'react';

import type { MassEditorActions } from './massActions.ts';
import type { MassEditorApi } from './useMassEditor.ts';

/** Everything one viewer knows, as the provider holds it. */
export const massStateContext = createContext<MassEditorApi | null>(null);

/** Everything that changes it, as the provider holds it. */
export const massActionsContext = createContext<MassEditorActions | null>(null);

/**
 * Everything the viewer knows, from inside it.
 * @returns The state and what follows from it.
 * @throws {Error} When read outside a `MassStateProvider`.
 */
export function useMassEditorState(): MassEditorApi {
  const editor = useContext(massStateContext);
  if (editor === null) {
    throw new Error(
      'The mass spectrum viewer state was read outside a MassStateProvider',
    );
  }
  return editor;
}

/**
 * Everything to do, from inside the viewer.
 * @returns The actions.
 * @throws {Error} When read outside a `MassStateProvider`.
 */
export function useMassActions(): MassEditorActions {
  const actions = useContext(massActionsContext);
  if (actions === null) {
    throw new Error(
      'The mass spectrum viewer actions were read outside a MassStateProvider',
    );
  }
  return actions;
}
