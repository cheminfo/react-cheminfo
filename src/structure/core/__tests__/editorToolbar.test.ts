import { expect, test } from 'vitest';

import type { EditorToolbarButton } from '../editorToolbar.ts';
import {
  EDITOR_TOOLBAR_BUTTONS,
  isEditorToolbarButtonAvailable,
} from '../editorToolbar.ts';
import {
  EDITOR_TOOLBAR_COLUMNS,
  EDITOR_TOOLBAR_ROWS,
} from '../editorToolbarGeometry.ts';

test('every button of the sprite is named, in the order it is drawn', () => {
  expect(EDITOR_TOOLBAR_BUTTONS).toHaveLength(
    EDITOR_TOOLBAR_ROWS * EDITOR_TOOLBAR_COLUMNS,
  );
  expect(EDITOR_TOOLBAR_BUTTONS.map((button) => button.name)).toStrictEqual([
    'Clear',
    'Clean up',
    'Select',
    'Unknown configuration',
    'Delete',
    'Single bond',
    'Up bond',
    '3-membered ring',
    '5-membered ring',
    '7-membered ring',
    'Positive charge',
    'Carbon',
    'Nitrogen',
    'Oxygen',
    'Fluorine',
    'Bromine',
    'Hydrogen',
    'Undo',
    'Zoom and rotate',
    'Atom mapping',
    'Enhanced stereo',
    'Text',
    'Chain',
    'Down bond',
    '4-membered ring',
    '6-membered ring',
    'Benzene ring',
    'Negative charge',
    'Silicon',
    'Phosphorus',
    'Sulfur',
    'Chlorine',
    'Iodine',
    'Any atom',
  ]);
});

test('a key picks one tool only', () => {
  const keys = EDITOR_TOOLBAR_BUTTONS.flatMap((button) =>
    button.keys === undefined ? [] : [button.keys.join('+')],
  );

  expect(new Set(keys).size).toBe(keys.length);
});

test('h is not offered for hydrogen, since the editor flips the molecule on it', () => {
  const hydrogen = buttonAt(16);

  expect(hydrogen.name).toBe('Hydrogen');
  expect(hydrogen.keys).toBeUndefined();
});

test('atom mapping works only in a reaction, text in no editor', () => {
  const mapping = buttonAt(19);
  const text = buttonAt(21);
  const bond = buttonAt(5);

  expect(isEditorToolbarButtonAvailable(mapping, 'molecule')).toBe(false);
  expect(isEditorToolbarButtonAvailable(mapping, 'reaction')).toBe(true);
  expect(isEditorToolbarButtonAvailable(text, 'molecule')).toBe(false);
  expect(isEditorToolbarButtonAvailable(text, 'reaction')).toBe(false);
  expect(isEditorToolbarButtonAvailable(bond, 'molecule')).toBe(true);
});

test('an atom button names its element and its key', () => {
  expect(EDITOR_TOOLBAR_BUTTONS[31]).toStrictEqual({
    id: 'chlorine',
    name: 'Chlorine',
    description:
      'Click empty space for a new Cl atom, or an atom to turn it into Cl.',
    keys: ['l'],
  });
});

function buttonAt(index: number): EditorToolbarButton {
  const button = EDITOR_TOOLBAR_BUTTONS[index];
  if (button === undefined) {
    throw new Error(`the toolbar has no button ${index}`);
  }
  return button;
}
