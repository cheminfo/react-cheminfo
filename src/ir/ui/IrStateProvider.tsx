import type { ReactNode } from 'react';

import { actionsContext, stateContext } from './irStateContext.ts';
import type { IrEditorApi } from './useIrEditor.ts';

export interface IrStateProviderProps {
  /** The viewer's state, as `useIrEditor` holds it. */
  editor: IrEditorApi;
  /** The viewer. */
  children: ReactNode;
}

/**
 * Put one viewer's state where its panels can reach it.
 *
 * The state and the actions go into separate contexts on purpose — see
 * `irStateContext.ts` for why — and the actions are handed over as they are,
 * since `useIrEditor` already keeps them stable for the life of the viewer.
 * @param props - Component props.
 * @returns The provider.
 */
export function IrStateProvider(props: IrStateProviderProps) {
  const { editor, children } = props;

  return (
    <stateContext.Provider value={editor}>
      <actionsContext.Provider value={editor.actions}>
        {children}
      </actionsContext.Provider>
    </stateContext.Provider>
  );
}
