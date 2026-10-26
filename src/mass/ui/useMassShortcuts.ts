/**
 * The keys, heard on the viewer's own root rather than on the document.
 *
 * Two viewers on one page must not both answer `f`, and a page that holds this
 * beside an infrared viewer must not have its own keys eaten. So the viewer
 * hears a key only while it holds the caret — the root carries `tabIndex={-1}`
 * so a click anywhere in it does — and a key it acted on goes no further.
 */

import { useEffect, useLayoutEffect, useRef } from 'react';

import { isEditingField } from '../../panel/core/isEditingField.ts';
import type {
  MassCommand,
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
 * @param root - The viewer's root, `null` until it is mounted.
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

  useEffect(() => {
    if (root === null) return;

    /**
     * Run the command a key names, if it names one.
     * @param event - The key that arrived.
     */
    function onKeyDown(event: KeyboardEvent): void {
      // A key pressed with a modifier belongs to the browser or to the page:
      // Ctrl+F is a search, and a viewer that swallowed it to fit its chart
      // would be a viewer people stop typing in.
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      // Never while a name is being typed into the spectra panel.
      if (isEditingField(event.target)) return;

      const id = KEYS.get(event.key.toLowerCase());
      if (id === undefined) return;
      const handler = latest.current[id];
      if (handler === undefined) return;

      event.preventDefault();
      // So the same key does not also reach a viewer mounted beside this one.
      event.stopPropagation();
      handler();
    }

    root.addEventListener('keydown', onKeyDown);
    return () => {
      root.removeEventListener('keydown', onKeyDown);
    };
  }, [root]);
}

/**
 * Every key the viewer answers to, against the command it runs — built once
 * from the command table, lower-cased so a capital arriving from a held shift
 * still reaches the command a lowercase key names.
 */
const KEYS = new Map<string, MassCommandId>(
  Object.entries(massCommands as Record<string, MassCommand>).flatMap(
    ([id, command]) =>
      (command.shortcut?.keys ?? []).map(
        (key) => [key.toLowerCase(), id as MassCommandId] as const,
      ),
  ),
);
