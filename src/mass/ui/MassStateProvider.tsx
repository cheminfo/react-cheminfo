import type { ReactNode } from 'react';

import { massActionsContext, massStateContext } from './massStateContext.ts';
import type { MassEditorApi } from './useMassEditor.ts';

export interface MassStateProviderProps {
  /** The viewer's state, as `useMassEditor` holds it. */
  editor: MassEditorApi;
  /** The viewer. */
  children: ReactNode;
}

/**
 * Put one viewer's state where its panels can reach it.
 *
 * The state and the actions go into separate contexts on purpose — see
 * `massStateContext.ts` for why — and the actions are handed over as they are,
 * since `useMassEditor` already keeps them stable for the life of the viewer.
 * @param props - Component props.
 * @returns The provider.
 */
export function MassStateProvider(props: MassStateProviderProps) {
  const { editor, children } = props;

  return (
    <massStateContext.Provider value={editor}>
      <massActionsContext.Provider value={editor.actions}>
        {children}
      </massActionsContext.Provider>
    </massStateContext.Provider>
  );
}
