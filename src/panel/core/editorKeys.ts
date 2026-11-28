/**
 * The keys every editor of the family answers the same way, read off a key
 * event: undo and redo, and the keys that move the view. A site keeps its own
 * tool and selection keys beside them.
 */

import { isEditingField } from './isEditingField.ts';

/** What one of the keys shared by every editor asks for. */
export type EditorKeyAction = 'undo' | 'redo' | 'fit' | 'zoomIn' | 'zoomOut';

/** The parts of a key event the shared keys are read from. */
export interface EditorKeyEvent {
  /** The key, as `KeyboardEvent.key` names it. */
  key: string;
  /** Whether Control is held. */
  ctrlKey: boolean;
  /** Whether Command is held. */
  metaKey: boolean;
  /** Whether Shift is held. */
  shiftKey: boolean;
  /** Whether Alt is held. */
  altKey: boolean;
}

/**
 * Whether a key event belongs to somewhere a key types rather than commands:
 * a field, an editable region, or anything inside a dialog.
 * @param target - What the event was delivered to.
 * @returns Whether the editor's keys leave it alone.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (isEditingField(target)) return true;
  return (
    target instanceof HTMLElement && target.closest('[role="dialog"]') !== null
  );
}

/**
 * What a key asks of an editor, among the keys every editor shares: Ctrl+Z
 * (Command+Z) undoes, Shift+Ctrl+Z and Ctrl+Y redo, `f` frames the figure,
 * `+` or `=` zooms in and `-` zooms out.
 * @param event - The key event.
 * @returns The action, or undefined for a key the site handles itself.
 */
export function editorKeyAction(
  event: EditorKeyEvent,
): EditorKeyAction | undefined {
  if (event.altKey) return undefined;
  if (event.ctrlKey || event.metaKey) {
    const key = event.key.toLowerCase();
    if (key === 'y') return 'redo';
    if (key === 'z') return event.shiftKey ? 'redo' : 'undo';
    return undefined;
  }
  return VIEW_KEYS[event.key];
}

const VIEW_KEYS: Readonly<Partial<Record<string, EditorKeyAction>>> = {
  f: 'fit',
  '+': 'zoomIn',
  '=': 'zoomIn',
  '-': 'zoomOut',
};
