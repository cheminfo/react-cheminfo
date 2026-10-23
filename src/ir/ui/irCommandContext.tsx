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
import { irCommandEntryLabel, irCommands } from '../core/irCommands.ts';
import type { IrTechnique } from '../core/irTechnique.ts';

import { IrCommandTooltip } from './IrCommandTooltip.tsx';
import { useIrText } from './useIrText.ts';

/** What the provider holds. */
export interface IrCommandContextValue {
  /** What each command does. */
  handlers: IrCommandHandlers;
  /** What the spectra were measured with, which words the commands. */
  technique: IrTechnique;
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
 * What the spectra were measured with, from anywhere inside the viewer.
 * @returns The technique; infrared outside a provider.
 */
export function useIrCommandTechnique(): IrTechnique {
  return useContext(commandContext)?.technique ?? 'infrared';
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
  const technique = useIrCommandTechnique();
  const text = useIrText(technique);
  return function command(id: IrCommandId) {
    const entry = text.command(id) ?? irCommands[id];
    return {
      tooltip: <IrCommandTooltip id={id} technique={technique} />,
      'aria-label': irCommandEntryLabel(entry),
      onClick: () => run(id),
    };
  };
}

/** What running a command comes to outside a provider: nothing at all. */
function noRun(): void {
  // Deliberately empty: a chart mounted without the shell has no commands, and
  // a missing provider is not a reason to throw at a button press.
}
