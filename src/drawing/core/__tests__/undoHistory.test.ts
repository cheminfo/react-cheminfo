import { expect, test } from 'vitest';

import type { Cell } from '../../../storage/core/documentFile.ts';
import { createUndoHistory } from '../undoHistory.ts';

function cell<T>(value: T): Cell<T> {
  const holder = {
    value,
    peek: () => holder.value,
  };
  return holder;
}

function history(limit?: number) {
  const document = cell('a');
  const steps = cell(0);
  const shown: string[] = [];
  const undo = createUndoHistory({
    document,
    steps,
    signals: { batch: (callback) => callback() },
    shown: (step) => shown.push(step),
    limit,
  });
  return { document, steps, shown, undo };
}

test('a commit is a step back, and redo brings it again', () => {
  const { document, steps, shown, undo } = history();

  expect(undo.canUndo()).toBe(false);

  undo.commit('b');
  undo.commit('c');

  expect(document.value).toBe('c');
  expect(steps.value).toBe(2);
  expect(undo.canUndo()).toBe(true);

  undo.undo();

  expect(document.value).toBe('b');
  expect(undo.canRedo()).toBe(true);

  undo.redo();

  expect(document.value).toBe('c');
  expect(shown).toStrictEqual(['b', 'c']);
  expect(steps.value).toBe(4);
});

test('a gesture previews as it goes and is one step back from where it began', () => {
  const { document, undo } = history();
  const before = document.peek();

  undo.preview('a1');
  undo.preview('a2');

  expect(undo.canUndo()).toBe(false);

  undo.commit('a3', before);
  undo.undo();

  expect(document.value).toBe('a');
  expect(undo.canUndo()).toBe(false);
});

test('a new change drops what could be redone, and a same document is no step', () => {
  const { document, steps, undo } = history();
  undo.commit('b');
  undo.undo();
  undo.commit('c');

  expect(undo.canRedo()).toBe(false);
  expect(steps.value).toBe(3);

  undo.commit(document.peek());

  expect(steps.value).toBe(3);
});

test('the oldest steps leave past the limit, and a restart forgets them all', () => {
  const { document, undo } = history(2);
  undo.commit('b');
  undo.commit('c');
  undo.commit('d');
  undo.undo();
  undo.undo();
  undo.undo();

  expect(document.value).toBe('b');

  undo.restart('z');

  expect(document.value).toBe('z');
  expect(undo.canUndo()).toBe(false);
  expect(undo.canRedo()).toBe(false);
});
