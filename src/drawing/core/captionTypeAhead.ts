/**
 * What is typed in a caption before its editor has arrived. The editor is
 * fetched once a caption may be typed, and a visitor who clicks and types at
 * once can be faster than that fetch: the keys are kept meanwhile, and the
 * editor opens holding them, as if they had been typed in it.
 *
 * Nothing here reaches ProseMirror, so the page that keeps the keys does not
 * fetch the editor to do it; `withTypedAhead`, which opens the editor on them,
 * is in `react-cheminfo/caption-editor`.
 */

import { writeRichText } from './richTextWriter.ts';

/** The keys typed while the editor was fetched. */
export interface TypedAhead {
  /** The text, lines separated by `\n`. */
  text: string;
}

/** Nothing typed yet. */
export const NOTHING_TYPED: TypedAhead = { text: '' };

/**
 * The caption written from plain typed text, with no style: what the editor
 * would keep had it been typed in it.
 * @param typed - What was typed.
 * @returns The caption's text, as a caption is stored.
 */
export function typedCaptionText(typed: TypedAhead): string {
  const lines = typed.text.split('\n');
  const spans = new Array<Array<{ text: string }>>(lines.length);
  for (let index = 0; index < lines.length; index++) {
    spans[index] = [{ text: lines[index] ?? '' }];
  }
  return writeRichText(spans);
}
