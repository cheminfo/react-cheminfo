import type { EditorState } from 'prosemirror-state';

import type { TypedAhead } from '../core/captionTypeAhead.ts';

/**
 * The editor's first state, with what was typed before it opened in place of
 * its selection, as typing it there would have done: a line break splits the
 * paragraph.
 * @param state - The state the editor opens on.
 * @param typed - What was typed meanwhile.
 * @returns The state to open on; the same state when nothing was typed.
 */
export function withTypedAhead(
  state: EditorState,
  typed: TypedAhead,
): EditorState {
  if (typed.text === '') return state;
  const transaction = state.tr;
  const lines = typed.text.split('\n');
  for (let index = 0; index < lines.length; index++) {
    if (index > 0) transaction.split(transaction.selection.from);
    transaction.insertText(lines[index] ?? '');
  }
  return state.apply(transaction);
}
