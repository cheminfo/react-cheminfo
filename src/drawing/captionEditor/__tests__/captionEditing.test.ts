import type { Command } from 'prosemirror-state';
import { EditorState, TextSelection } from 'prosemirror-state';
import type { DecorationSet } from 'prosemirror-view';
import { expect, test } from 'vitest';

import {
  captionSelectionStyle,
  setCaptionSize,
  stepCaptionSize,
  toggleCaptionMark,
} from '../captionCommands.ts';
import { captionPreview, setCaptionChemical } from '../captionPreview.ts';
import { captionDocument, captionText } from '../captionSchema.ts';

// A caption open for typing, with a stretch of its first line selected.
function opened(text: string, from: number, to: number): EditorState {
  const doc = captionDocument(text);
  // The first line's text starts after its opening, at position 1.
  const selection = TextSelection.create(doc, from + 1, to + 1);
  return EditorState.create({
    doc,
    selection,
    plugins: [captionPreview(true)],
  });
}

function apply(state: EditorState, command: Command): EditorState {
  let next = state;
  command(state, (tr) => {
    next = state.apply(tr);
  });
  return next;
}

// Where the preview sets scripts, as positions in the first line.
function shown(state: EditorState): number[][] {
  const preview = state.plugins[0]?.getState(state) as {
    decorations: DecorationSet;
  };
  return preview.decorations
    .find()
    .map((decoration) => [decoration.from - 1, decoration.to - 1]);
}

test('a caption is opened and written back with the same marks', () => {
  const text = 'H_2O {14pt:**big** x^{2−}}\n*it*, \\*';

  expect(captionText(captionDocument(text))).toBe(text);
  expect(captionText(captionDocument(''))).toBe('');
});

test('a style set on a selection is written as its mark', () => {
  const state = opened('Ca2+ ions', 2, 4);
  const raised = apply(state, toggleCaptionMark('sup'));

  expect(captionText(raised.doc)).toBe('Ca^{2+} ions');

  // A subscript takes the place of the superscript, never both.
  const lowered = apply(raised, toggleCaptionMark('sub'));

  expect(captionText(lowered.doc)).toBe('Ca_{2+} ions');

  const bold = apply(opened('Ca2+ ions', 0, 2), toggleCaptionMark('bold'));

  expect(captionText(bold.doc)).toBe('**Ca**2+ ions');
});

test('a size is set on a selection, and the caption size clears it', () => {
  const state = opened('a big word', 2, 5);
  const larger = apply(state, setCaptionSize(14, 10));

  expect(captionText(larger.doc)).toBe('a {14pt:big} word');
  expect(captionSelectionStyle(larger, 10)).toStrictEqual({
    active: new Set(),
    size: 14,
  });

  const grown = apply(larger, stepCaptionSize(1, 10));

  expect(captionText(grown.doc)).toBe('a {16pt:big} word');

  const back = apply(grown, setCaptionSize(10, 10));

  expect(captionText(back.doc)).toBe('a big word');
});

test('the toolbar is told the styles every character of the selection has', () => {
  const state = opened('**ab**c', 0, 3);

  expect(captionSelectionStyle(state, 10).active).toStrictEqual(new Set());

  const bold = opened('**ab**c', 0, 2);

  expect(captionSelectionStyle(bold, 10).active).toStrictEqual(
    new Set(['bold']),
  );

  // Two sizes in the selection: no single size to show.
  const mixed = opened('a{14pt:b}', 0, 2);

  expect(captionSelectionStyle(mixed, 10).size).toBeUndefined();
});

test('the digits and charges the chemical rules set are shown as typed', () => {
  const state = opened('SO4--, H_2O', 0, 0);
  const preview = state.plugins[0]?.getState(state) as {
    decorations: DecorationSet;
  };
  const found = preview.decorations
    .find()
    .map((decoration) => [decoration.from, decoration.to]);

  // SO4-- has its 4 lowered and its two signs raised; the marked 2 is left.
  expect(found).toStrictEqual([
    [3, 4],
    [4, 6],
  ]);
});

test('turned off, the chemical rules show nothing, and back on they return', () => {
  const state = opened('CDCl3 and Ca2+', 0, 0);

  expect(shown(state)).toStrictEqual([
    [4, 5],
    [12, 14],
  ]);

  const off = apply(state, setCaptionChemical(false));

  expect(shown(off)).toStrictEqual([]);

  // What is typed with the rules off is not set either.
  const typed = off.apply(off.tr.insertText(' H2O', 15));

  expect(shown(typed)).toStrictEqual([]);
  // The text itself is never changed by the switch.
  expect(captionText(typed.doc)).toBe('CDCl3 and Ca2+ H2O');

  const on = apply(typed, setCaptionChemical(true));

  expect(shown(on)).toStrictEqual([
    [4, 5],
    [12, 14],
    [16, 17],
  ]);
});

test('a formula group opens as the scripts mf-parser sets', () => {
  const doc = captionDocument('{{SO4(2-)}} {{[13C]H4}}');

  expect(captionText(doc)).toBe('SO_4^{2−} ^{13}CH_4');
});
