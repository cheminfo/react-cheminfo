import { afterEach, expect, test, vi } from 'vitest';

import type { Cell } from '../../../storage/core/documentFile.ts';
import { createPanelState } from '../createPanelState.ts';

type Panel = 'parts' | 'info' | 'folder';

function cell<T>(value: T): Cell<T> {
  const holder = {
    value,
    peek: () => holder.value,
  };
  return holder;
}

function panels(open: Panel[], folded: Panel[] = []) {
  const cells = {
    open: cell<readonly Panel[]>(open),
    folded: cell<readonly Panel[]>(folded),
    collapsed: cell(false),
    drawer: cell<Panel | null>(null),
  };
  const state = createPanelState<Panel>({
    ids: ['parts', 'info', 'folder'],
    cells,
    signals: { batch: (callback) => callback() },
  });
  return { cells, state };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a stored list keeps only the panels the editor has, in its order', () => {
  const { state } = panels([]);

  expect(state.panelsIn(['folder', 'gone', 'parts'])).toStrictEqual([
    'parts',
    'folder',
  ]);
  expect(state.panelsIn('parts')).toStrictEqual([]);
});

test('the rail opens a panel unfolded, and closes an open one', () => {
  const { cells, state } = panels(['parts'], ['info']);

  state.toggle('info');

  expect(cells.open.value).toStrictEqual(['parts', 'info']);
  expect(cells.folded.value).toStrictEqual([]);

  state.toggle('parts');

  expect(state.visible()).toStrictEqual(['info']);

  state.setFolded(['info', 'nothing']);

  expect(state.visibleFolded()).toStrictEqual(['info']);

  state.open('info');

  expect(state.visibleFolded()).toStrictEqual([]);
});

test('collapsed, one panel comes over the figure and folding sends it away', () => {
  const { cells, state } = panels(['parts', 'info']);
  cells.collapsed.value = true;

  expect(state.visible()).toStrictEqual([]);

  state.toggle('folder');

  expect(state.visible()).toStrictEqual(['folder']);
  expect(cells.open.value).toStrictEqual(['parts', 'info']);
  expect(state.visibleFolded()).toStrictEqual([]);

  state.setFolded(['folder']);

  expect(state.visible()).toStrictEqual([]);
});

test('a window grown wide again keeps the panel that was over the figure', () => {
  const listeners = new Set<() => void>();
  const answers = { narrow: true };
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query === 'print' ? false : answers.narrow;
    },
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
  }));
  const { cells, state } = panels(['parts']);
  const stop = state.start();
  cells.collapsed.value = true;
  state.toggle('folder');
  answers.narrow = false;
  for (const listener of listeners) listener();

  expect(cells.collapsed.value).toBe(false);
  expect(cells.drawer.value).toBeNull();
  expect(state.visible()).toStrictEqual(['parts', 'folder']);

  stop();
});
