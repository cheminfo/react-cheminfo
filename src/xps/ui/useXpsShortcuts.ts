/**
 * The viewer's shortcuts: one listener, reading the same table the tooltips do.
 */

import { useCommandShortcuts } from '../../panel/ui/useCommandShortcuts.ts';
import { xpsCommands } from '../core/xpsCommands.ts';

import type { RunXpsCommand } from './xpsCommandContext.tsx';

/**
 * Run a command when its key is pressed inside one viewer, through the
 * family's `useCommandShortcuts`: on the viewer's own root, never on the
 * document, so a page mounting two of these — a survey scan above the narrow
 * scan it was picked from — has each answer its own keys.
 * @param root - The viewer's root element, `null` until it is mounted.
 * @param run - Asks the registry for a command, and says whether one answered.
 */
export function useXpsShortcuts(
  root: HTMLElement | null,
  run: RunXpsCommand,
): void {
  useCommandShortcuts(root, xpsCommands, run);
}
