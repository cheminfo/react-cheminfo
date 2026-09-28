import type { ReactNode } from 'react';
import { useMemo } from 'react';

import type { IrCommandHandlers } from '../core/irCommands.ts';

import type { IrCommandContextValue } from './irCommandContext.tsx';
import { commandContext } from './irCommandContext.tsx';

export interface IrCommandProviderProps {
  /** What each command does. */
  handlers: IrCommandHandlers;
  /** The viewer. */
  children: ReactNode;
}

/**
 * Put the command handlers where the toolbar and the panels can reach them.
 * @param props - Component props.
 * @returns The provider.
 */
export function IrCommandProvider(props: IrCommandProviderProps) {
  const { handlers, children } = props;

  const value = useMemo<IrCommandContextValue>(
    () => ({ handlers, run: (id) => handlers[id]?.() }),
    [handlers],
  );

  return (
    <commandContext.Provider value={value}>{children}</commandContext.Provider>
  );
}
