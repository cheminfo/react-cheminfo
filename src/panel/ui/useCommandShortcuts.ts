/**
 * A viewer's keys, heard on its own root rather than on the document.
 *
 * Two viewers on one page must not both answer `f`, and a page that holds one
 * beside a glycan editor must not have its own keys eaten. So the viewer hears
 * a key only while it holds the caret — the root carries `tabIndex={-1}` so a
 * click anywhere in it does — and a key it acted on goes no further.
 */

import { useEffect } from 'react';

import type { CommandTable } from '../core/editorCommands.ts';
import { matchCommand } from '../core/editorCommands.ts';
import { isEditingField } from '../core/isEditingField.ts';

/**
 * Run a command when its key is pressed inside one viewer.
 *
 * A key pressed with a modifier belongs to the browser or to the page — Ctrl+F
 * is a search — and a key typed into a field, or already claimed by something
 * closer to it, is left alone. Keys match case-insensitively, so a capital
 * arriving from a held shift still reaches the command a lowercase key names.
 * A press that ran something is claimed and stopped before the document.
 * @param root - The viewer's root element, `null` until it is mounted.
 * @param table - The viewer's commands; it must keep its identity.
 * @param run - Runs a command, and says whether anything answered; it must
 * keep its identity, so the listener is attached once.
 */
export function useCommandShortcuts<TId extends string>(
  root: HTMLElement | null,
  table: CommandTable<TId>,
  run: (id: TId) => boolean,
): void {
  useEffect(() => {
    if (root === null) return;

    function onKeyDown(event: KeyboardEvent): void {
      if (event.defaultPrevented) return;
      if (isEditingField(event.target)) return;
      const id = matchCommand(table, event);
      if (id === null || !run(id)) return;
      event.preventDefault();
      // So the same key does not also reach a viewer mounted beside this one.
      event.stopPropagation();
    }

    root.addEventListener('keydown', onKeyDown);
    return () => {
      root.removeEventListener('keydown', onKeyDown);
    };
  }, [root, table, run]);
}
