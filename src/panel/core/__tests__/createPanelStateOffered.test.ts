/**
 * The panels a page offers and a workspace leaves out: a plate drawn by hand
 * offers no compounds, and a workspace outside research leaves the Tafel
 * panel off the rail, out of the stack, until a link asks for it by name.
 */

import { expect, test } from 'vitest';

import type { Cell } from '../../../state/core/cells.ts';
import { cell } from '../../../storage/core/__tests__/fakeFileSystem.ts';
import { createPanelState } from '../createPanelState.ts';

type Panel = 'spots' | 'compounds' | 'eluent' | 'tafel';

const IDS: readonly Panel[] = ['spots', 'compounds', 'eluent', 'tafel'];

function panels(options: {
  open: Panel[];
  folded?: Panel[];
  offered?: Cell<readonly Panel[]>;
  hidden?: Panel[];
}) {
  const cells = {
    open: cell<readonly Panel[]>(options.open),
    folded: cell<readonly Panel[]>(options.folded ?? []),
    collapsed: cell(false),
    drawer: cell<Panel | null>(null),
    hidden: cell<readonly Panel[]>(options.hidden ?? []),
  };
  const { offered } = options;
  const state = createPanelState<Panel>({
    ids: IDS,
    cells,
    signals: { batch: (callback) => callback() },
    ...(offered ? { offered: () => offered.value } : {}),
  });
  return { cells, state };
}

test('only the panels the page offers are drawn, and their place is kept', () => {
  const offered = cell<readonly Panel[]>(['spots', 'eluent']);
  const { cells, state } = panels({ open: ['spots', 'compounds'], offered });

  expect(state.visible()).toStrictEqual(['spots']);
  expect(state.rail()).toStrictEqual(['spots', 'eluent']);

  offered.value = IDS;

  expect(state.visible()).toStrictEqual(['spots', 'compounds']);
  expect(cells.open.value).toStrictEqual(['spots', 'compounds']);
});

test('a panel open but not offered keeps its fold for the next page that offers it', () => {
  const offered = cell<readonly Panel[]>(['spots']);
  const { cells, state } = panels({
    open: ['spots', 'compounds'],
    folded: ['compounds'],
    offered,
  });
  state.setFolded(['spots']);

  expect(cells.folded.value).toStrictEqual(['spots', 'compounds']);

  state.setFolded([]);

  expect(cells.folded.value).toStrictEqual(['compounds']);
});

test('collapsed, a panel the page stops offering leaves the figure', () => {
  const offered = cell<readonly Panel[]>(IDS);
  const { cells, state } = panels({ open: [], offered });
  cells.collapsed.value = true;
  state.toggle('compounds');

  expect(state.visible()).toStrictEqual(['compounds']);

  offered.value = ['spots'];

  expect(state.visible()).toStrictEqual([]);
});

test('a panel the workspace leaves out is off the rail and out of the stack', () => {
  const { state } = panels({ open: ['spots', 'tafel'], hidden: ['tafel'] });

  expect(state.visible()).toStrictEqual(['spots']);
  expect(state.rail()).toStrictEqual(['spots', 'compounds', 'eluent']);
});

test('collapsed, a panel left out still comes over the figure when asked, and the rail lists it', () => {
  const { cells, state } = panels({ open: ['spots'], hidden: ['tafel'] });
  cells.collapsed.value = true;
  cells.drawer.value = 'tafel';

  expect(state.visible()).toStrictEqual(['tafel']);
  expect(state.rail()).toStrictEqual(['spots', 'compounds', 'eluent', 'tafel']);
});

test('a link reveals a panel left out: open, unfolded, and offered from then on', () => {
  const { cells, state } = panels({
    open: ['spots'],
    folded: ['spots'],
    hidden: ['tafel'],
  });
  state.reveal('tafel');

  expect(cells.hidden.value).toStrictEqual([]);
  expect(state.visible()).toStrictEqual(['spots', 'tafel']);
  expect(state.visibleFolded()).toStrictEqual(['spots']);
});

test('the settings read and write the layout, keeping only the panels the editor has', () => {
  const { cells, state } = panels({ open: ['spots'], hidden: ['tafel'] });

  expect(state.layout()).toStrictEqual({
    open: ['spots'],
    folded: [],
    hidden: ['tafel'],
  });

  state.setLayout({
    open: ['eluent', 'gone' as Panel, 'spots'],
    folded: ['eluent'],
    hidden: [],
  });

  expect(cells.open.value).toStrictEqual(['spots', 'eluent']);
  expect(cells.folded.value).toStrictEqual(['eluent']);
  expect(cells.hidden.value).toStrictEqual([]);
});

test('the cross of a header closes a panel; collapsed, only the one over the figure leaves', () => {
  const { cells, state } = panels({
    open: ['spots', 'eluent'],
    folded: ['eluent'],
  });
  state.close('eluent');

  expect(cells.open.value).toStrictEqual(['spots']);
  expect(cells.folded.value).toStrictEqual([]);

  cells.collapsed.value = true;
  state.toggle('compounds');
  state.close('compounds');

  expect(cells.drawer.value).toBeNull();
  expect(cells.open.value).toStrictEqual(['spots']);
});

test('focus opens a panel unfolded and folds the others', () => {
  const { cells, state } = panels({ open: ['spots', 'eluent'] });
  state.focus('compounds');

  expect(cells.open.value).toStrictEqual(['spots', 'compounds', 'eluent']);
  expect(cells.folded.value).toStrictEqual(['spots', 'eluent']);
});
