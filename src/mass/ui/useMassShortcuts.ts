/**
 * The keys of the mass viewer, heard on its own root through the family's
 * `useCommandShortcuts`.
 */

import { useCallback, useLayoutEffect, useRef } from 'react';

import { useCommandShortcuts } from '../../panel/ui/useCommandShortcuts.ts';
import type {
  MassCommandHandlers,
  MassCommandId,
} from '../core/massCommands.ts';
import { massCommands } from '../core/massCommands.ts';

/**
 * Fire the viewer's commands from the keyboard.
 *
 * The handlers are read live through a ref rather than closed over, so the
 * listener is attached once for the life of the viewer instead of being torn
 * down and rebuilt on every render — and the chart re-renders on every move of
 * the pointer across it.
 * @param root - The viewer's root element, `null` until it is mounted.
 * @param handlers - What each command does.
 */
export function useMassShortcuts(
  root: HTMLElement | null,
  handlers: MassCommandHandlers,
): void {
  const latest = useRef(handlers);
  useLayoutEffect(() => {
    latest.current = handlers;
  });
  const run = useCallback((id: MassCommandId) => {
    const handler = latest.current[id];
    if (handler === undefined) return false;
    handler();
    return true;
  }, []);
  useCommandShortcuts(root, massCommands, run);
}
