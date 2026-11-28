/**
 * An editor keeping pins: a panel opened from the rail is passing through and
 * the next one takes its place, a pinned panel stays, folding an unpinned one
 * closes it, and a link reveals a panel the workspace left out.
 */

import { expect, test } from 'vitest';

import { cell } from '../../../storage/core/__tests__/fakeFileSystem.ts';
import { createPanelState } from '../createPanelState.ts';

type Panel = 'structure' | 'properties' | 'name' | 'templates' | 'object';

const IDS: readonly Panel[] = [
  'structure',
  'properties',
  'name',
  'templates',
  'object',
];

function panels(open: Panel[] = ['structure']) {
  const cells = {
    open: cell<readonly Panel[]>(open),
    folded: cell<readonly Panel[]>([]),
    collapsed: cell(false),
    drawer: cell<Panel | null>(null),
    hidden: cell<readonly Panel[]>([]),
    pinned: cell<readonly Panel[] | null>(null),
  };
  const state = createPanelState<Panel>({
    ids: IDS,
    cells,
    signals: { batch: (callback) => callback() },
  });
  return { cells, state };
}

test('every panel a workspace opens is pinned', () => {
  const { state } = panels(['structure', 'properties', 'name']);

  expect(state.pinned()).toStrictEqual(['structure', 'properties', 'name']);
});

test('a panel opened from the rail is not pinned, and the next one takes its place', () => {
  const { cells, state } = panels();
  state.toggle('properties');

  expect(cells.open.value).toStrictEqual(['structure', 'properties']);
  expect(state.pinned()).toStrictEqual(['structure']);

  state.toggle('name');

  expect(cells.open.value).toStrictEqual(['structure', 'name']);
});

test('a pinned panel stays when another opens, and pinning a closed one opens it', () => {
  const { cells, state } = panels();
  state.toggle('properties');
  state.setPinned('properties', true);
  state.toggle('name');

  expect(cells.open.value).toStrictEqual(['structure', 'properties', 'name']);
  expect(state.pinned()).toStrictEqual(['structure', 'properties']);

  state.setPinned('templates', true);

  expect(state.pinned()).toStrictEqual([
    'structure',
    'properties',
    'templates',
  ]);
});

test('folding an unpinned panel closes it, folding a pinned one keeps its header', () => {
  const { cells, state } = panels();
  state.toggle('properties');
  state.setFolded(['structure', 'properties']);

  expect(cells.open.value).toStrictEqual(['structure']);
  expect(cells.folded.value).toStrictEqual(['structure']);
});

test('a pinned panel closed opens unpinned when it comes back', () => {
  const { state } = panels();
  state.setPinned('properties', true);
  state.toggle('properties');
  state.toggle('properties');

  expect(state.pinned()).toStrictEqual(['structure']);
});

test('unpinning a folded panel unfolds it', () => {
  const { cells, state } = panels();
  state.setPinned('properties', true);
  state.setFolded(['properties']);
  state.setPinned('properties', false);

  expect(cells.open.value).toStrictEqual(['structure', 'properties']);
  expect(cells.folded.value).toStrictEqual([]);
  expect(state.pinned()).toStrictEqual(['structure']);
});

test('focus folds the pinned panels and closes the unpinned one', () => {
  const { cells, state } = panels(['structure', 'templates']);
  state.toggle('properties');
  state.focus('templates');

  expect(cells.open.value).toStrictEqual(['structure', 'templates']);
  expect(cells.folded.value).toStrictEqual(['structure']);
});

test('a gesture opens its panel beside the one passing through, and the next panel opened replaces both', () => {
  const { cells, state } = panels();
  state.toggle('templates');
  state.open('object');

  expect(cells.open.value).toStrictEqual(['structure', 'templates', 'object']);
  expect(state.pinned()).toStrictEqual(['structure']);

  state.toggle('properties');

  expect(cells.open.value).toStrictEqual(['structure', 'properties']);
});

test('a panel the settings open is pinned, the others keep their pins', () => {
  const { state } = panels();
  state.toggle('properties');
  state.setLayout({
    open: ['structure', 'properties', 'name'],
    folded: [],
    hidden: [],
  });

  expect(state.pinned()).toStrictEqual(['structure', 'name']);
});

test('a panel shown alone opens even when left out, the pinned folded and the unpinned closed', () => {
  const { cells, state } = panels();
  cells.hidden.value = ['templates'];
  state.toggle('properties');
  state.showAlone('templates');

  expect(cells.open.value).toStrictEqual(['structure', 'templates']);
  expect(cells.folded.value).toStrictEqual(['structure']);
  expect(cells.hidden.value).toStrictEqual([]);
});

test('a panel left out is not opened by a gesture, nor focused', () => {
  const { cells, state } = panels();
  cells.hidden.value = ['object'];
  state.open('object');
  state.focus('object');

  expect(cells.open.value).toStrictEqual(['structure']);
});

test('collapsed, pinning a panel brings it over the figure', () => {
  const { cells, state } = panels();
  cells.collapsed.value = true;
  state.setPinned('name', true);

  expect(state.visible()).toStrictEqual(['name']);
  expect(state.pinned()).toStrictEqual(['structure', 'name']);
});
