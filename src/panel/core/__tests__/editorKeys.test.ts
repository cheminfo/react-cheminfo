// @vitest-environment jsdom
import { expect, test } from 'vitest';

import { editorKeyAction, isTypingTarget } from '../editorKeys.ts';

function press(
  key: string,
  held: Partial<Record<'ctrl' | 'meta' | 'shift' | 'alt', boolean>> = {},
) {
  return editorKeyAction({
    key,
    ctrlKey: held.ctrl ?? false,
    metaKey: held.meta ?? false,
    shiftKey: held.shift ?? false,
    altKey: held.alt ?? false,
  });
}

test('Ctrl+Z undoes, Shift+Ctrl+Z and Ctrl+Y redo, Command as Control', () => {
  expect(press('z', { ctrl: true })).toBe('undo');
  expect(press('Z', { ctrl: true, shift: true })).toBe('redo');
  expect(press('y', { meta: true })).toBe('redo');
  expect(press('a', { ctrl: true })).toBeUndefined();
});

test('f frames the figure, + and = zoom in, - zooms out', () => {
  expect(press('f')).toBe('fit');
  expect(press('+', { shift: true })).toBe('zoomIn');
  expect(press('=')).toBe('zoomIn');
  expect(press('-')).toBe('zoomOut');
  expect(press('F', { shift: true })).toBeUndefined();
  expect(press('f', { alt: true })).toBeUndefined();
  expect(press('t')).toBeUndefined();
});

test('a key typed into a field, an editable region or a dialog is left alone', () => {
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  const button = document.createElement('button');
  dialog.append(button);
  const editable = document.createElement('div');
  editable.contentEditable = 'true';
  document.body.append(dialog, editable);

  expect(isTypingTarget(document.createElement('select'))).toBe(true);
  expect(isTypingTarget(button)).toBe(true);
  expect(isTypingTarget(document.body)).toBe(false);
  expect(isTypingTarget(null)).toBe(false);

  dialog.remove();
  editable.remove();
});
