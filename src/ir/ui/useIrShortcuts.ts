/**
 * The keys, heard on the viewer's own root rather than on the document.
 *
 * On its own root and with `stopPropagation`, which is the deliberate half of a
 * decision the repo has already taken once: two viewers on one page must not both
 * answer `f`, and a page that holds this beside a glycan editor must not have its
 * own keys eaten. So the viewer hears a key only while it holds the caret — the
 * root carries `tabIndex={-1}` so a click anywhere in it does — and a key it
 * acted on goes no further.
 */

import type { RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';

import { isEditingField } from '../../panel/core/isEditingField.ts';
import type {
  IrCommand,
  IrCommandHandlers,
  IrCommandId,
} from '../core/irCommands.ts';
import { irCommands } from '../core/irCommands.ts';

/**
 * Fire the viewer's commands from the keyboard.
 *
 * The handlers are read live through a ref rather than closed over, so the
 * listener is attached once for the life of the viewer instead of being torn down
 * and rebuilt on every render — and the chart re-renders on every move of the
 * pointer across it.
 * @param root - The viewer's root, as it was handed to its `ref`.
 * @param handlers - What each command does.
 */
export function useIrShortcuts(
  root: RefObject<HTMLElement | null> | HTMLElement | null,
  handlers: IrCommandHandlers,
): void {
  const latest = useRef(handlers);

  useLayoutEffect(() => {
    latest.current = handlers;
  });

  const element = root === null || root instanceof HTMLElement ? root : null;

  useEffect(() => {
    if (element === null) return;

    function onKeyDown(event: KeyboardEvent): void {
      // A key pressed with a modifier belongs to the browser or to the page:
      // Ctrl+F is a search, and a viewer that swallowed it to fit its chart
      // would be a viewer people stop typing in.
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      // Never while a name is being typed into the spectra panel.
      if (isEditingField(event.target)) return;

      const id = commandFor(event.key);
      if (id === undefined) return;
      const handler = latest.current[id];
      if (handler === undefined) return;

      event.preventDefault();
      // So the same key does not also reach a viewer mounted beside this one.
      event.stopPropagation();
      handler();
    }

    element.addEventListener('keydown', onKeyDown);
    return () => {
      element.removeEventListener('keydown', onKeyDown);
    };
  }, [element]);
}

/**
 * Which command a key runs, if any.
 *
 * Built once from the command table rather than looked up by walking it, and
 * compared case-insensitively so a capital arriving from a held shift still
 * reaches the command a lowercase key names.
 * @param key - The `event.key` that arrived.
 * @returns The command, or `undefined` when the key names none.
 */
function commandFor(key: string): IrCommandId | undefined {
  return KEYS.get(key.toLowerCase());
}

/** Every key the viewer answers to, against the command it runs. */
const KEYS = new Map<string, IrCommandId>(
  Object.entries(irCommands as Record<string, IrCommand>).flatMap(
    ([id, command]) =>
      (command.shortcut?.keys ?? []).map(
        (key) => [key.toLowerCase(), id as IrCommandId] as const,
      ),
  ),
);
