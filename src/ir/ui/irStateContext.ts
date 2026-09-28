/**
 * How a panel reaches the viewer it is inside.
 *
 * Two contexts rather than one, because the actions never change while the state
 * changes on every pointer move: a panel that only ever acts — a toolbar button —
 * reads the second and is not re-rendered by the first.
 */

import { createContext, useContext } from 'react';

import type { IrEditorActions } from './irActions.ts';
import type { IrEditorApi } from './useIrEditor.ts';

/** Everything one viewer knows, as the provider holds it. */
export const stateContext = createContext<IrEditorApi | null>(null);

/** Everything that changes it, as the provider holds it. */
export const actionsContext = createContext<IrEditorActions | null>(null);

/**
 * Everything the viewer knows, from inside it.
 * @returns The state and what follows from it.
 * @throws {Error} When read outside an `IrStateProvider`.
 */
export function useIrEditorState(): IrEditorApi {
  const editor = useContext(stateContext);
  if (editor === null) {
    throw new Error(
      'The infrared viewer state was read outside an IrStateProvider',
    );
  }
  return editor;
}

/**
 * Everything to do, from inside the viewer.
 * @returns The actions.
 * @throws {Error} When read outside an `IrStateProvider`.
 */
export function useIrActions(): IrEditorActions {
  const actions = useContext(actionsContext);
  if (actions === null) {
    throw new Error(
      'The infrared viewer actions were read outside an IrStateProvider',
    );
  }
  return actions;
}
