/**
 * What the viewer can be asked to do, as one registry the whole shell reads.
 *
 * The command table already says what each thing is called and which key asks
 * for it; what it does not say is what actually happens. Registering the
 * handlers against the same ids keeps the two halves from drifting apart: a
 * command is offered by the rail, by the header and by the keyboard because it
 * is in the registry, and by nothing at all when it is not.
 *
 * A panel takes the labels without taking the registry — `xpsCommandLabel`
 * reads the table alone — because a panel is mounted on its own as readily as
 * inside this shell, and a button that threw unless a provider was somewhere
 * above it would make that impossible.
 */

import { createContext, useCallback, useContext } from 'react';

import type { XpsCommandId } from '../core/xpsCommands.ts';
import { xpsCommand } from '../core/xpsCommands.ts';

import { XpsCommandTooltip } from './XpsCommandTooltip.tsx';

/** What to run for each command, those left out being offered by nothing. */
export type XpsCommandHandlers = Partial<Record<XpsCommandId, () => void>>;

/**
 * Ask for a command by name.
 *
 * Answers whether anything ran, so a key press nothing offers can be left to
 * the browser rather than swallowed.
 */
export type RunXpsCommand = (id: XpsCommandId) => boolean;

/** The registry, as the provider holds it. */
export const xpsCommandContext = createContext<RunXpsCommand | null>(null);

/**
 * Ask for commands from inside the viewer.
 * @returns The way to run one, stable for the life of the viewer.
 */
export function useXpsCommand(): RunXpsCommand {
  const run = useContext(xpsCommandContext);
  if (run === null) {
    throw new Error(
      'An XPS command was asked for outside an XpsCommandProvider',
    );
  }
  return run;
}

/**
 * Everything a button needs to be a command: what it says, and what it does.
 * @returns The props for one command, per command.
 */
export function useXpsCommandProps() {
  const run = useXpsCommand();
  return useCallback(
    (id: XpsCommandId) => ({
      ...xpsCommandLabel(id),
      onClick: () => run(id),
    }),
    [run],
  );
}

/**
 * What a command is called, for the things that carry a command without being
 * driven by the registry — a panel's own toolbar, mounted anywhere.
 * @param id - The command.
 * @returns The tooltip and the label, off the same table the keys read.
 */
export function xpsCommandLabel(id: XpsCommandId) {
  return {
    tooltip: <XpsCommandTooltip command={id} />,
    'aria-label': xpsCommand(id).title,
  };
}
