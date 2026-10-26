/**
 * How a component reaches the commands, and what a toolbar item needs to be one.
 *
 * The hooks and the context object, with no component of its own: a module that
 * exports a component and a constant together cannot be hot reloaded, which is
 * why the provider and the tooltip are files of their own beside this one.
 */

import { createContext, useContext } from 'react';

import type {
  MassCommandHandlers,
  MassCommandId,
  RunMassCommand,
} from '../core/massCommands.ts';
import { massCommandLabel } from '../core/massCommands.ts';

import { MassCommandTooltip } from './MassCommandTooltip.tsx';

/** What the provider holds. */
export interface MassCommandContextValue {
  /** What each command does. */
  handlers: MassCommandHandlers;
  /** Run one. */
  run: RunMassCommand;
}

/** Where the provider puts it. */
export const massCommandContext = createContext<MassCommandContextValue | null>(
  null,
);

/**
 * Run a command from anywhere inside the viewer.
 * @returns The runner; a command nothing handles does nothing.
 */
export function useMassCommand(): RunMassCommand {
  const value = useContext(massCommandContext);
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
export function useMassCommandProps() {
  const run = useMassCommand();
  return function command(id: MassCommandId) {
    return {
      tooltip: <MassCommandTooltip id={id} />,
      'aria-label': massCommandLabel(id),
      onClick: () => run(id),
    };
  };
}

/** What running a command comes to outside a provider: nothing at all. */
function noRun(): void {
  // Deliberately empty: a chart mounted without the shell has no commands, and
  // a missing provider is not a reason to throw at a button press.
}
