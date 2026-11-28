import { EditorState, TextSelection } from 'prosemirror-state';
import { expect, test } from 'vitest';

import {
  NOTHING_TYPED,
  typedCaptionText,
} from '../../core/captionTypeAhead.ts';
import { captionDocument, captionText } from '../captionSchema.ts';
import { withTypedAhead } from '../typedAhead.ts';

// A caption opened with all of its text selected, as the editor opens it.
function opened(text: string): EditorState {
  const doc = captionDocument(text);
  const selection = TextSelection.between(
    doc.resolve(0),
    doc.resolve(doc.content.size),
  );
  return EditorState.create({ doc, selection });
}

test('nothing typed leaves the state the editor opens on', () => {
  const state = opened('kept');

  expect(withTypedAhead(state, NOTHING_TYPED)).toBe(state);
});

test('what was typed into a new caption is its text', () => {
  const state = withTypedAhead(opened(''), { text: 'Pd(PPh3)4, K2CO3' });

  expect(captionText(state.doc)).toBe('Pd(PPh3)4, K2CO3');
});

test('what was typed replaces the caption opened, line by line', () => {
  const state = withTypedAhead(opened('old text'), {
    text: 'THF\n0 °C to rt',
  });

  expect(captionText(state.doc)).toBe('THF\n0 °C to rt');
  expect(state.doc.childCount).toBe(2);
});

test('typed text is written as the editor would write it', () => {
  const typed = { text: 'a*b\nNaOH' };

  expect(typedCaptionText(typed)).toBe(
    captionText(withTypedAhead(opened(''), typed).doc),
  );
});
