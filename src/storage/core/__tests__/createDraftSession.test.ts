/**
 * A page keeps what is on screen as a draft from its first change, before any
 * save, and the next page opens on it — after a reload, a closed tab or a
 * crash. A draft that crashed the page while it was reopened is skipped once.
 */

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

import { createDraftSession } from '../createDraftSession.ts';
import type { DraftStore } from '../createDraftStore.ts';
import { createDraftStore } from '../createDraftStore.ts';
import type { Cell, DocumentFile } from '../documentFile.ts';

interface Doc {
  items: string[];
}

function readDoc(value: unknown): Doc | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const { items } = value as { items?: unknown };
  if (!Array.isArray(items)) return undefined;
  return { items: items.filter((item) => typeof item === 'string') };
}

function cell<T>(value: T): Cell<T> {
  const holder = { value, peek: () => holder.value };
  return holder;
}

// Web Locks held by every page of the test, as one browser holds them.
const locks = new Map<string, () => void>();

beforeEach(() => {
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
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  });
  // Every page is a new tab: none remembers a draft of its own.
  vi.stubGlobal('sessionStorage', undefined);
  locks.clear();
  vi.stubGlobal('navigator', {
    locks: {
      request: (
        name: string,
        _options: unknown,
        callback: (lock: unknown) => Promise<void> | undefined,
      ) => {
        if (locks.has(name)) return Promise.resolve(callback(null));
        const held = callback({ name });
        locks.set(name, () => undefined);
        return Promise.resolve(held).then(() => {
          locks.delete(name);
        });
      },
      query: () =>
        Promise.resolve({ held: [...locks.keys()].map((name) => ({ name })) }),
    },
  });
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    callback();
    return 0;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * One load of the page: its cells, its session, and what it said.
 * @param store - The drafts every load shares.
 * @param limit - How many drafts it keeps.
 * @returns The page.
 */
function page(store: DraftStore<Doc>, limit?: number) {
  const cells = {
    document: cell<Doc>({ items: [] }),
    file: cell<DocumentFile<Doc> | null>(null),
    draftId: cell<string | null>(null),
  };
  const said: string[] = [];
  let watcher: (() => void) | undefined;
  const session = createDraftSession<Doc>({
    scope: 'test-cheminfo',
    store,
    cells,
    status: {
      available: cell<boolean | undefined>(undefined),
      settled: cell(false),
      version: cell(0),
    },
    signals: {
      batch: (callback) => {
        callback();
      },
      effect: (callback) => {
        watcher = callback;
        callback();
        return () => {
          watcher = undefined;
        };
      },
      untracked: (callback) => callback(),
    },
    empty: () => ({ items: [] }),
    isEmpty: (document) => document.items.length === 0,
    reset: (document) => {
      cells.document.value = document;
    },
    notify: (text) => {
      said.push(text);
    },
    ...(limit === undefined ? {} : { limit }),
  });
  // What the site's effect does on every change: runs the watcher again.
  function change(document: Doc, file?: DocumentFile<Doc>): void {
    cells.document.value = document;
    if (file) cells.file.value = file;
    watcher?.();
    // The first change gives the document its draft; the second keeps it.
    watcher?.();
  }
  return { cells, session, said, change };
}

test('a document is kept from its first change, and the next page opens on it', async () => {
  const store = createDraftStore({ name: 'test-reload', read: readDoc });
  const first = page(store);
  const stopFirst = await first.session.start({ linked: false });

  first.change({ items: ['benzene'] });
  await first.session.flush();

  const kept = await store.list();

  expect(kept.map((draft) => draft.document)).toStrictEqual([
    { items: ['benzene'] },
  ]);

  stopFirst();
  await first.session.flush();
  locks.clear();
  const second = page(store);
  await second.session.start({ linked: false });

  expect(second.cells.document.value).toStrictEqual({ items: ['benzene'] });
  expect(second.cells.draftId.value).toBe(kept[0]?.id);
  expect(second.said).toHaveLength(1);
  expect(second.said[0]).toMatch(
    /^Reopened your last work, from .+\. New starts an empty one\.$/,
  );
});

test('a page opened on a link does not replace it with the last work', async () => {
  const store = createDraftStore({ name: 'test-linked', read: readDoc });
  await store.put({
    id: 'last',
    document: { items: ['toluene'] },
    createdAt: 1,
    updatedAt: 2,
  });
  const linked = page(store);
  await linked.session.start({ linked: true });

  expect(linked.cells.document.value).toStrictEqual({ items: [] });
  expect(linked.said).toStrictEqual([]);
});

test('the file a document is kept in comes back with its draft', async () => {
  const store = createDraftStore({ name: 'test-file', read: readDoc });
  const first = page(store);
  await first.session.start({ linked: false });
  first.change(
    { items: ['phenol', 'water'] },
    { name: 'Phenol', savedId: 'saved-1', saved: { items: ['phenol'] } },
  );
  await first.session.flush();

  const [draft] = await store.list();

  expect(draft?.file).toStrictEqual({
    name: 'Phenol',
    savedId: 'saved-1',
    modified: true,
    saved: { items: ['phenol'] },
  });

  locks.clear();
  const second = page(store);
  await second.session.start({ linked: false });

  expect(second.cells.file.value).toStrictEqual({
    name: 'Phenol',
    savedId: 'saved-1',
    saved: { items: ['phenol'] },
  });
});

test('a save writes its draft at once, so it never reads as not saved after', async () => {
  const store = createDraftStore({ name: 'test-saved', read: readDoc });
  const page1 = page(store);
  await page1.session.start({ linked: false });
  const document = { items: ['phenol'] };
  page1.change(document);
  await page1.session.flush();

  page1.change(document, { name: 'Phenol.svg', saved: document });

  // Well before the 500 ms the autosave waits for an edit.
  await vi.waitFor(
    async () => {
      const [draft] = await store.list();

      expect(draft?.file).toStrictEqual({
        name: 'Phenol.svg',
        modified: false,
      });
    },
    { timeout: 200, interval: 10 },
  );
});

test('a draft that took the page down is skipped once, then opened again', async () => {
  const store = createDraftStore({ name: 'test-crash', read: readDoc });
  await store.put({
    id: 'heavy',
    document: { items: ['C60'] },
    createdAt: 1,
    updatedAt: 2,
  });
  // The page dies before it paints the draft it reopens.
  vi.stubGlobal('requestAnimationFrame', () => 0);
  await page(store).session.start({ linked: false });
  locks.clear();
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
    callback();
    return 0;
  });

  const skipped = page(store);
  await skipped.session.start({ linked: false });

  expect(skipped.cells.document.value).toStrictEqual({ items: [] });
  expect(skipped.said).toStrictEqual([
    'The page stopped while reopening your last work, so it opened empty. Reload to try it again.',
  ]);

  locks.clear();
  const retried = page(store);
  await retried.session.start({ linked: false });

  expect(retried.cells.document.value).toStrictEqual({ items: ['C60'] });
});

test('past its limit, a site forgets its oldest draft no tab holds', async () => {
  const store = createDraftStore({ name: 'test-limit', read: readDoc });
  await store.putMany([
    { id: 'old', document: { items: ['a'] }, createdAt: 1, updatedAt: 1 },
    { id: 'mid', document: { items: ['b'] }, createdAt: 2, updatedAt: 2 },
  ]);
  const current = page(store, 2);
  await current.session.start({ linked: true });

  current.change({ items: ['c'] });
  await current.session.flush();

  const kept = await store.list();

  expect(kept.map((draft) => draft.document.items[0])).toStrictEqual([
    'c',
    'b',
  ]);
});

test('a document opened again is kept once, as the draft on screen', async () => {
  const store = createDraftStore({ name: 'test-once', read: readDoc });
  await store.putMany([
    { id: 'old', document: { items: ['a'] }, createdAt: 1, updatedAt: 1 },
    { id: 'other', document: { items: ['b'] }, createdAt: 2, updatedAt: 2 },
  ]);
  const linked = page(store);
  await linked.session.start({ linked: true });

  linked.change({ items: ['a'] });
  await linked.session.flush();

  const kept = await store.list();

  expect(kept.map((draft) => draft.document.items[0])).toStrictEqual([
    'a',
    'b',
  ]);
  expect(kept[0]?.id).toBe(linked.cells.draftId.value);
});

test('copies kept before go when a page starts, the most recent staying', async () => {
  const store = createDraftStore({ name: 'test-copies', read: readDoc });
  await store.putMany([
    { id: 'recent', document: { items: ['a'] }, createdAt: 3, updatedAt: 3 },
    { id: 'older', document: { items: ['a'] }, createdAt: 1, updatedAt: 1 },
  ]);
  const linked = page(store);
  await linked.session.start({ linked: true });

  await vi.waitFor(async () => {
    const kept = await store.list();

    expect(kept.map((draft) => draft.id)).toStrictEqual(['recent']);
  });
});

test('a session that cannot keep drafts keeps none', async () => {
  const store = createDraftStore({ name: 'test-refused', read: readDoc });
  vi.spyOn(store, 'isAvailable').mockResolvedValue(false);
  const refused = page(store);

  const stop = await refused.session.start({ linked: false });
  stop();

  await expect(refused.session.heldElsewhere()).resolves.toStrictEqual(
    new Set(),
  );
});

test('a row written by draw before the store was shared still reads', async () => {
  const store = createDraftStore({ name: 'test-legacy', read: readDoc });
  await store.put({
    id: 'drawn',
    drawing: { items: ['ethanol'] },
    createdAt: 1,
    updatedAt: 2,
  } as never);

  const draft = await store.get('drawn');

  expect(draft?.document).toStrictEqual({ items: ['ethanol'] });
});
