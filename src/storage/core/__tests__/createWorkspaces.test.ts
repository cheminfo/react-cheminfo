import {
  IDBCursor,
  IDBCursorWithValue,
  IDBDatabase,
  IDBFactory,
  IDBIndex,
  IDBKeyRange,
  IDBObjectStore,
  IDBRequest,
  IDBTransaction,
} from 'fake-indexeddb';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createReactiveSystem } from '../../../state/core/__tests__/fakeSignals.ts';
import { createWorkspaces } from '../createWorkspaces.ts';
import type { BuiltinWorkspace } from '../workspaceTypes.ts';

const BUILTINS: readonly [BuiltinWorkspace, ...BuiltinWorkspace[]] = [
  { id: 'drawing', name: 'Drawing' },
  {
    id: 'glassware',
    name: 'Glassware',
    preferences: { panels: ['glassware'], glass: { setups: false } },
  },
];

beforeEach(() => {
  // idb recognises what it wraps by these classes, read off the globals.
  const classes = {
    IDBCursor,
    IDBCursorWithValue,
    IDBDatabase,
    IDBIndex,
    IDBKeyRange,
    IDBObjectStore,
    IDBRequest,
    IDBTransaction,
  };
  for (const [name, value] of Object.entries(classes)) {
    vi.stubGlobal(name, value);
  }
  vi.stubGlobal('indexedDB', new IDBFactory());
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
 * A page of a site: its preferences, and its workspaces over them.
 * @param options - What the page is started with.
 * @param options.legacy - Preferences kept before workspaces.
 * @param options.forgetLegacy - Called once they are stored.
 * @param options.delay - Milliseconds before a change is written.
 * @returns The bucket and the workspaces.
 */
function openPage(
  options: {
    legacy?: () => unknown;
    forgetLegacy?: () => void;
    delay?: number;
  } = {},
) {
  const { signal, effect } = createReactiveSystem();
  const bucket = {
    resolution: signal(600),
    panels: signal<readonly string[]>(['structure']),
    glass: { setups: signal(true) },
  };
  const workspaces = createWorkspaces({
    name: 'test',
    site: 'draw',
    bucket,
    effect,
    builtins: BUILTINS,
    delay: 0,
    ...options,
  });
  return { bucket, workspaces };
}

test('a first visit opens the first workspace, and a change is kept for the next', async () => {
  const page = openPage();
  await page.workspaces.ready;

  expect(page.workspaces.getState()).toStrictEqual({
    ready: true,
    stored: true,
    workspaces: [
      { id: 'drawing', name: 'Drawing', source: 'builtin' },
      { id: 'glassware', name: 'Glassware', source: 'builtin' },
    ],
    active: { id: 'drawing', name: 'Drawing', source: 'builtin' },
    modified: false,
  });

  page.bucket.panels.value = ['structure', 'tlc'];
  await page.workspaces.flush();

  expect(page.workspaces.getState().modified).toBe(true);

  const next = openPage();
  await next.workspaces.ready;

  expect(next.bucket.panels.value).toStrictEqual(['structure', 'tlc']);
  expect(next.workspaces.getState().modified).toBe(true);
});

test('each workspace comes back as it was left', async () => {
  const page = openPage();
  await page.workspaces.ready;
  page.bucket.resolution.value = 300;

  await page.workspaces.activate('glassware');

  expect(page.bucket.panels.value).toStrictEqual(['glassware']);
  expect(page.bucket.glass.setups.value).toBe(false);
  expect(page.bucket.resolution.value).toBe(600);

  await page.workspaces.activate('drawing');

  expect(page.bucket.resolution.value).toBe(300);

  await page.workspaces.activate('glassware');
  await page.workspaces.flush();
  const next = openPage();
  await next.workspaces.ready;

  expect(next.workspaces.getState().active.id).toBe('glassware');
  expect(next.bucket.panels.value).toStrictEqual(['glassware']);
});

test('reset puts the workspace back as it was saved', async () => {
  const page = openPage();
  await page.workspaces.ready;
  page.bucket.panels.value = [];

  page.workspaces.reset();

  expect(page.bucket.panels.value).toStrictEqual(['structure']);
  expect(page.workspaces.getState().modified).toBe(false);
});

test('saving as a new workspace keeps the change there, and the one left as it was', async () => {
  const page = openPage();
  await page.workspaces.ready;
  page.bucket.panels.value = ['templates'];

  const made = await page.workspaces.saveAs('Mechanisms');

  expect(made.name).toBe('Mechanisms');
  expect(page.workspaces.getState().active).toStrictEqual(made);
  expect(page.workspaces.getState().modified).toBe(false);

  await page.workspaces.activate('drawing');

  expect(page.bucket.panels.value).toStrictEqual(['structure']);
  expect(page.workspaces.getState().modified).toBe(false);

  await page.workspaces.activate(made.id);

  expect(page.bucket.panels.value).toStrictEqual(['templates']);
});

test("a visitor's workspace is saved in place; the site's own is not", async () => {
  const page = openPage();
  await page.workspaces.ready;

  await expect(page.workspaces.save()).rejects.toThrow(
    'A workspace of the site is saved under a new name.',
  );

  const made = await page.workspaces.saveAs('Mine');
  page.bucket.resolution.value = 1200;

  await page.workspaces.save();
  page.bucket.resolution.value = 150;
  page.workspaces.reset();

  expect(page.bucket.resolution.value).toBe(1200);

  const next = openPage();
  await next.workspaces.ready;

  expect(next.workspaces.getState().active).toStrictEqual(made);
  expect(next.bucket.resolution.value).toBe(1200);
});

test('names stay apart, and a deleted workspace hands the screen to the first', async () => {
  const page = openPage();
  await page.workspaces.ready;
  const a = await page.workspaces.saveAs('Drawing');
  const b = await page.workspaces.saveAs('drawing');

  expect([a.name, b.name]).toStrictEqual(['Drawing (2)', 'drawing (3)']);

  await page.workspaces.rename(a.id, 'Course');

  await expect(page.workspaces.rename('drawing', 'Mine')).rejects.toThrow(
    'Only a workspace you made is renamed or deleted.',
  );

  await page.workspaces.remove(b.id);

  expect(page.workspaces.getState().active.id).toBe('drawing');
  expect(
    page.workspaces.getState().workspaces.map((workspace) => workspace.name),
  ).toStrictEqual(['Drawing', 'Glassware', 'Course']);
});

test('a workspace goes out as a file and comes in again under its own identity', async () => {
  const page = openPage();
  await page.workspaces.ready;
  page.bucket.panels.value = ['model'];
  const made = await page.workspaces.saveAs('Course');
  const text = page.workspaces.exportText();

  const other = openPage();
  await other.workspaces.ready;
  const first = await other.workspaces.importText(text);
  const again = await other.workspaces.importText(text);

  expect(first).toStrictEqual({ id: made.id, name: 'Course', source: 'user' });
  expect(again).toStrictEqual(first);
  expect(other.bucket.panels.value).toStrictEqual(['model']);
  expect(other.workspaces.getState().workspaces).toHaveLength(3);
  await expect(
    other.workspaces.importText(text.replace('"draw"', '"3d"')),
  ).rejects.toThrow(
    'This workspace was made for 3d, so it was not opened here.',
  );
});

test('a workspace taken from a document is fitted, and opens as saved', async () => {
  const page = openPage();
  await page.workspaces.ready;

  await page.workspaces.add({
    id: 'drawing',
    name: 'Exam',
    preferences: { resolution: 'high', panels: ['name'], retired: 1 },
  });

  const { active } = page.workspaces.getState();

  expect(active.id).not.toBe('drawing');
  expect(active.name).toBe('Exam');
  expect(page.workspaces.current()).toStrictEqual({
    resolution: 600,
    panels: ['name'],
    glass: { setups: true },
  });
});

test('the preferences kept before workspaces become the first workspace, once', async () => {
  const forgetLegacy = vi.fn();
  const page = openPage({
    legacy: () => ({ resolution: 300, panels: 'all' }),
    forgetLegacy,
  });
  await page.workspaces.ready;

  expect(page.bucket.resolution.value).toBe(300);
  expect(page.bucket.panels.value).toStrictEqual(['structure']);
  expect(forgetLegacy).toHaveBeenCalledOnce();

  page.bucket.resolution.value = 150;
  await page.workspaces.flush();
  const next = openPage({ legacy: () => ({ resolution: 300 }) });
  await next.workspaces.ready;

  expect(next.bucket.resolution.value).toBe(150);
});

test('a browser that keeps nothing still gives this page its workspaces', async () => {
  vi.stubGlobal('indexedDB', undefined);
  const page = openPage({ legacy: () => ({ resolution: 300 }) });
  await page.workspaces.ready;

  expect(page.workspaces.getState().stored).toBe(false);
  expect(page.bucket.resolution.value).toBe(300);

  const made = await page.workspaces.saveAs('Here only');

  expect(page.workspaces.getState().active).toStrictEqual(made);
});

test('a store that answers too late is left alone', async () => {
  vi.stubGlobal('indexedDB', {
    open: () => ({}),
  });
  const { signal, effect } = createReactiveSystem();
  const workspaces = createWorkspaces({
    name: 'slow',
    site: 'draw',
    bucket: { resolution: signal(600) },
    effect,
    builtins: BUILTINS,
    timeout: 10,
  });

  await workspaces.ready;

  expect(workspaces.getState()).toMatchObject({ ready: true, stored: false });
});

test('a change is found again by a page that started before IndexedDB had it', async () => {
  const page = openPage({ delay: 60_000 });
  await page.workspaces.ready;
  await page.workspaces.activate('glassware');
  page.bucket.resolution.value = 150;

  const next = openPage();
  await next.workspaces.ready;

  expect(next.workspaces.getState().active.id).toBe('glassware');
  expect(next.bucket.resolution.value).toBe(150);
  expect(localStorage.getItem('test:workspace:v1')).not.toBeNull();

  await next.workspaces.flush();

  expect(localStorage.getItem('test:workspace:v1')).toBeNull();
});
