import type { Command } from 'prosemirror-state';
import { EditorState, TextSelection } from 'prosemirror-state';
import { expect, test } from 'vitest';

import { captionSelectionStyle } from '../captionCommands.ts';
import { captionDocument, captionText } from '../captionSchema.ts';
import {
  CAPTION_SYMBOLS,
  greekCaptionSelection,
  insertCaptionSymbol,
} from '../captionSymbols.ts';

// A caption with a stretch of its first line selected; its text starts at 1.
function opened(text: string, from: number, to: number): EditorState {
  const doc = captionDocument(text);
  const selection = TextSelection.create(doc, from + 1, to + 1);
  return EditorState.create({ doc, selection });
}

function apply(state: EditorState, command: Command): EditorState {
  let next = state;
  command(state, (tr) => {
    next = state.apply(tr);
  });
  return next;
}

test('a symbol is typed at the caret, in the style of the text there', () => {
  const state = opened('*ab*', 1, 1);
  const typed = apply(state, insertCaptionSymbol('β'));

  expect(captionText(typed.doc)).toBe('*aβb*');
});

test('a symbol takes the place of the selection', () => {
  const state = opened('heat: x', 6, 7);
  const typed = apply(state, insertCaptionSymbol('Δ'));

  expect(captionText(typed.doc)).toBe('heat: Δ');
});

test('the selected letters are made Greek, each run keeping its style', () => {
  const state = opened('**a**b-lactam', 0, 2);

  expect(captionSelectionStyle(state, 10).latin).toBe(true);

  const greek = apply(state, greekCaptionSelection);

  expect(captionText(greek.doc)).toBe('**α**β-lactam');
  // The selection still holds the two letters, now Greek.
  expect(greek.selection.from).toBe(1);
  expect(greek.selection.to).toBe(3);
  expect(captionSelectionStyle(greek, 10).latin).toBe(false);
});

test('a selection with no Latin letter is left as it is', () => {
  const state = opened('12 °C', 0, 3);

  expect(captionSelectionStyle(state, 10).latin).toBe(false);
  expect(greekCaptionSelection(state)).toBe(false);
  expect(greekCaptionSelection(opened('ab', 1, 1))).toBe(false);
});

test('the palette offers each character once', () => {
  const symbols = CAPTION_SYMBOLS.flatMap((group) =>
    group.symbols.map(({ symbol }) => symbol),
  );

  expect(symbols).toHaveLength(56);
  expect(new Set(symbols).size).toBe(56);
});
