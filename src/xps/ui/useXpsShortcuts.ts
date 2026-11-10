/**
 * The viewer's shortcuts: one listener, reading the same table the tooltips do.
 */

import { useEffect } from 'react';

import { isEditingField } from '../../panel/core/isEditingField.ts';
import { matchXpsCommand } from '../core/xpsCommands.ts';

import type { RunXpsCommand } from './xpsCommandContext.tsx';

/**
 * Run a command when its key is pressed inside one viewer.
 *
 * **On the viewer's own root, never on the document** — the rule
 * `useSpectrumDrop` states for the drop and the paste, for the same reason: a
 * page is free to mount two of these, a survey scan above the narrow scan it
 * was picked from, and a listener on the document is answered by every one of
 * them at once. A press is therefore heard once the viewer holds the caret,
 * which a click anywhere in it arranges, exactly as a paste is.
 *
 * A press that ran something is claimed with `preventDefault` and stopped
 * before the document, so a page listening at that level leaves alone the key
 * this viewer has just answered.
 * @param root - The viewer's root element, `null` until it is mounted.
 * @param run - Asks the registry for a command, and says whether one answered.
 */
export function useXpsShortcuts(
  root: HTMLElement | null,
  run: RunXpsCommand,
): void {
  useEffect(() => {
    if (root === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      // Something closer to the press has already dealt with it — a row
      // answering an arrow key, a name being renamed in place.
      if (event.defaultPrevented) return;
      const command = matchXpsCommand(event);
      if (command === null) return;
      // A bare letter is a letter while something is being typed into.
      if (isEditingField(event.target)) return;
      // Nothing offers it here, so it stays the browser's press rather than
      // being swallowed by a viewer that had no answer for it.
      if (!run(command)) return;
      event.preventDefault();
      event.stopPropagation();
    }

    root.addEventListener('keydown', handleKeyDown);
    return () => root.removeEventListener('keydown', handleKeyDown);
  }, [root, run]);
}
