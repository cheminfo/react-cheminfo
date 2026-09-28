/**
 * How a component reaches the commands, and what a toolbar item needs to be one.
 *
 * The hooks and the context object, with no component of its own — see
 * `irCommands.ts` for why the four files are split the way they are.
 */

import { createContext, useContext } from 'react';

import type {
  IrCommandHandlers,
  IrCommandId,
  RunIrCommand,
} from '../core/irCommands.ts';
import { irCommandLabel } from '../core/irCommands.ts';

import { IrCommandTooltip } from './IrCommandTooltip.tsx';

/** What the provider holds. */
export interface IrCommandContextValue {
  /** What each command does. */
  handlers: IrCommandHandlers;
  /** Run one. */
  run: RunIrCommand;
}

/** Where the provider puts it. */
export const commandContext = createContext<IrCommandContextValue | null>(null);

/**
 * Run a command from anywhere inside the viewer.
 * @returns The runner; a command nothing handles does nothing.
 */
export function useIrCommand(): RunIrCommand {
  const value = useContext(commandContext);
  return value?.run ?? noRun;
}

/**
 * Everything a toolbar item needs to be one command, in one spread.
 *
 * The tooltip, the label a screen reader is given and the click handler all come
 * from the same table entry, so a button cannot end up titled one thing and
 * doing another.
 * @returns A function from a command's identity to the props for its button.
 */
export function useIrCommandProps() {
  const run = useIrCommand();
  return function command(id: IrCommandId) {
    return {
      tooltip: <IrCommandTooltip id={id} />,
      'aria-label': irCommandLabel(id),
      onClick: () => run(id),
    };
  };
}

/** What running a command comes to outside a provider: nothing at all. */
function noRun(): void {
  // Deliberately empty: a chart mounted without the shell has no commands, and
  // a missing provider is not a reason to throw at a button press.
}
