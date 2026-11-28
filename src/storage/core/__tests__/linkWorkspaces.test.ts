/**
 * `?workspace=` opens a workspace of the site, and the address then names the
 * workspace on screen whenever it is one of the site's other than the first.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createReactiveSystem } from '../../../state/core/__tests__/fakeSignals.ts';
import { createWorkspaces } from '../createWorkspaces.ts';
import { linkWorkspaces } from '../linkWorkspaces.ts';
import type { BuiltinWorkspace } from '../workspaceTypes.ts';

import { stubIndexedDB } from './fakeIndexedDB.ts';

const BUILTINS: readonly [BuiltinWorkspace, ...BuiltinWorkspace[]] = [
  { id: 'drawing', name: 'Drawing' },
  { id: 'analysis', name: 'Analysis', preferences: { grid: true } },
  { id: 'fragmentation', name: 'Mass fragmentation' },
];

beforeEach(() => {
  stubIndexedDB();
  const entries = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * A page whose address carries a `workspace` parameter, or none.
 * @param named - The parameter on screen.
 * @returns The workspaces, the link, the address and what was opened.
 */
function page(named?: string) {
  const { signal, effect } = createReactiveSystem();
  const workspaces = createWorkspaces({
    name: 'test-link',
    site: 'draw',
    bucket: { grid: signal(false) },
    effect,
    builtins: BUILTINS,
    delay: 0,
  });
  const address = { workspace: named };
  const opened: string[] = [];
  const moves = new Set<() => void>();
  const linked = linkWorkspaces(workspaces, {
    builtins: BUILTINS,
    read: () => address.workspace,
    write: (id) => {
      address.workspace = id ?? undefined;
    },
    subscribe: (listener) => {
      moves.add(listener);
      return () => {
        moves.delete(listener);
      };
    },
    onOpened: (id) => {
      opened.push(id);
    },
  });
  return { workspaces, linked, address, opened, moves };
}

test('a link names a workspace of the site by its id, an unknown one skipped', () => {
  const { linked } = page();

  expect(linked.read('analysis')).toBe('analysis');
  expect(linked.read(' fragmentation ')).toBe('fragmentation');
  expect(linked.read('Analysis')).toBeUndefined();
  expect(linked.read('glassware')).toBeUndefined();
  expect(linked.read(undefined)).toBeUndefined();
});

test('a link names the workspace on screen only when it is the site’s, and not the first', () => {
  const { linked } = page();

  expect(
    linked.paramOf({ id: 'analysis', name: 'Analysis', source: 'builtin' }),
  ).toBe('analysis');
  expect(
    linked.paramOf({ id: 'drawing', name: 'Drawing', source: 'builtin' }),
  ).toBeNull();
  expect(
    linked.paramOf({ id: 'a1b2', name: 'Mechanisms', source: 'user' }),
  ).toBeNull();
});

test('the workspace a link names is on screen before the first render', async () => {
  const { workspaces, linked, opened } = page('fragmentation');
  await workspaces.ready;
  await linked.open();

  expect(workspaces.getState().active.id).toBe('fragmentation');
  expect(opened).toStrictEqual(['fragmentation']);
});

test('an unknown workspace opens the page as it was', async () => {
  const { workspaces, linked, opened } = page('constructor');
  await workspaces.ready;
  await linked.open();

  expect(workspaces.getState().active.id).toBe('drawing');
  expect(opened).toStrictEqual([]);
});

test('the address follows the workspace picked, and a page moved to is named again', async () => {
  const { workspaces, linked, address, moves } = page();
  await workspaces.ready;
  const stop = linked.follow();

  expect(address.workspace).toBeUndefined();

  await workspaces.activate('analysis');

  expect(address.workspace).toBe('analysis');

  address.workspace = undefined;
  for (const move of moves) move();

  expect(address.workspace).toBe('analysis');

  await workspaces.activate('drawing');

  expect(address.workspace).toBeUndefined();

  stop();

  expect(moves.size).toBe(0);
});
