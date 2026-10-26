import type { ReactNode } from 'react';
import { useMemo } from 'react';

import type { MassCommandHandlers } from '../core/massCommands.ts';

import type { MassCommandContextValue } from './massCommandContext.tsx';
import { massCommandContext } from './massCommandContext.tsx';

export interface MassCommandProviderProps {
  /** What each command does. */
  handlers: MassCommandHandlers;
  /** The viewer. */
  children: ReactNode;
}

/**
 * Put the command handlers where the toolbar and the panels can reach them.
 * @param props - Component props.
 * @returns The provider.
 */
export function MassCommandProvider(props: MassCommandProviderProps) {
  const { handlers, children } = props;

  const value = useMemo<MassCommandContextValue>(
    () => ({ handlers, run: (id) => handlers[id]?.() }),
    [handlers],
  );

  return (
    <massCommandContext.Provider value={value}>
      {children}
    </massCommandContext.Provider>
  );
}
