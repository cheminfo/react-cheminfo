import type { ReactNode } from 'react';
import { useMemo } from 'react';

import type { IrCommandHandlers } from '../core/irCommands.ts';
import type { IrTechnique } from '../core/irTechnique.ts';

import type { IrCommandContextValue } from './irCommandContext.tsx';
import { commandContext } from './irCommandContext.tsx';

export interface IrCommandProviderProps {
  /** What each command does. */
  handlers: IrCommandHandlers;
  /**
   * What the spectra were measured with, which decides how each command is
   * worded in its tooltip and its label.
   * @default 'infrared'
   */
  technique?: IrTechnique;
  /** The viewer. */
  children: ReactNode;
}

/**
 * Put the command handlers where the toolbar and the panels can reach them.
 * @param props - Component props.
 * @returns The provider.
 */
export function IrCommandProvider(props: IrCommandProviderProps) {
  const { handlers, technique = 'infrared', children } = props;

  const value = useMemo<IrCommandContextValue>(
    () => ({ handlers, technique, run: (id) => handlers[id]?.() }),
    [handlers, technique],
  );

  return (
    <commandContext.Provider value={value}>{children}</commandContext.Provider>
  );
}
