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

import { readArchive, writeArchive } from '../backupFiles.ts';
import type { Draft, DraftStore } from '../createDraftStore.ts';
import { createSavedDocuments } from '../createSavedDocuments.ts';
import type { DraftSession } from '../draftSessionTypes.ts';
import { createSiteBackup } from '../siteBackup.ts';

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
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(Date.UTC(2026, 10, 13));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

interface Note {
  text: string;
}

function readNote(value: unknown): Note | undefined {
  return typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    typeof value.text === 'string'
    ? { text: value.text }
    : undefined;
}

/**
 * The archive a backup writes, which a test needs to exist.
 * @param written - What `write` handed back.
 * @returns The archive.
 */
async function archiveOf(written: Promise<Blob | undefined>): Promise<Blob> {
  const archive = await written;
  if (!archive) throw new Error('no archive');
  return archive;
}

function openNotes(name = 'notes-test') {
  return createSavedDocuments<Note>({ name, read: readNote });
}

/**
 * Drafts kept in memory, with a session that records what it was asked.
 * @param held - The drafts another tab holds.
 * @returns The drafts, the calls made to the session, the store and the session.
 */
function memoryDrafts(held: string[] = []) {
  const kept = new Map<string, Draft<Note>>();
  const calls: string[] = [];
  const store: DraftStore<Note> = {
    isAvailable: () => Promise.resolve(true),
    list: () => Promise.resolve([...kept.values()]),
    get: (id) => Promise.resolve(kept.get(id)),
    put: (draft) => {
      kept.set(draft.id, draft);
      return Promise.resolve();
    },
    putMany: (drafts) => {
      for (const draft of drafts) kept.set(draft.id, draft);
      return Promise.resolve();
    },
    delete: (id) => {
      kept.delete(id);
      return Promise.resolve();
    },
  };
  const session: DraftSession = {
    start: () => Promise.resolve(() => undefined),
    flush: () => {
      calls.push('flush');
      return Promise.resolve();
    },
    discardPending: () => {
      calls.push('discard');
    },
    heldElsewhere: () => Promise.resolve(new Set(held)),
    changed: () => {
      calls.push('changed');
    },
    open: (id) => {
      calls.push(`open ${id}`);
      return Promise.resolve(true);
    },
  };
  return { kept, calls, store, session };
}

test('the saved documents go out as one archive and come back with their names and dates', async () => {
  const notes = openNotes();
  await notes.save('Aspirin', { text: 'acetylsalicylic acid' });
  vi.setSystemTime(Date.UTC(2026, 10, 13, 1));
  await notes.save('Caffeine', { text: 'a purine' });
  const backup = createSiteBackup({
    stem: 'notes-cheminfo',
    generator: 'notes.cheminfo.org',
    documents: notes,
  });

  const archive = await archiveOf(backup.write());
  const files = await readArchive(archive);

  expect(backup.fileName()).toBe('notes-cheminfo-backup-2026-11-13.zip');
  expect(files.map((file) => file.path)).toStrictEqual([
    'manifest.json',
    'documents/001-Caffeine.json',
    'documents/002-Aspirin.json',
  ]);

  const elsewhere = openNotes('notes-elsewhere');
  const restore = createSiteBackup({
    stem: 'notes-cheminfo',
    generator: 'notes.cheminfo.org',
    documents: elsewhere,
  });

  await expect(restore.read(archive)).resolves.toStrictEqual({
    documents: 2,
    drafts: 0,
    copies: 0,
  });
  await expect(restore.read(archive)).resolves.toStrictEqual({
    documents: 2,
    drafts: 0,
    copies: 0,
  });

  const listed = await elsewhere.list();

  expect(
    listed.map(({ name, savedAt, data }) => ({
      name,
      savedAt,
      data,
    })),
  ).toStrictEqual([
    {
      name: 'Caffeine',
      savedAt: Date.UTC(2026, 10, 13, 1),
      data: { text: 'a purine' },
    },
    {
      name: 'Aspirin',
      savedAt: Date.UTC(2026, 10, 13),
      data: { text: 'acetylsalicylic acid' },
    },
  ]);
});

test('nothing kept yet means no archive, and an archive without a table of contents is no backup', async () => {
  const backup = createSiteBackup({
    stem: 'notes-cheminfo',
    generator: 'notes.cheminfo.org',
    documents: openNotes(),
  });

  await expect(backup.write()).resolves.toBeUndefined();

  const stray = await writeArchive([{ path: 'readme.txt', content: 'hello' }]);

  await expect(backup.read(stray)).resolves.toBeUndefined();
});

test('a document the site cannot read is left out of a restore', async () => {
  const notes = openNotes();
  const archive = await writeArchive([
    {
      path: 'manifest.json',
      content: JSON.stringify({
        generator: 'notes.cheminfo.org',
        version: 1,
        documents: [
          { id: 'a', name: 'Good', savedAt: 5, path: 'documents/a.json' },
          { id: 'b', name: 'Bad', savedAt: 6, path: 'documents/b.json' },
        ],
      }),
    },
    { path: 'documents/a.json', content: '{"text":"kept"}' },
    { path: 'documents/b.json', content: '{"words":42}' },
  ]);
  const backup = createSiteBackup({
    stem: 'notes-cheminfo',
    generator: 'notes.cheminfo.org',
    documents: notes,
  });

  await expect(backup.read(archive)).resolves.toStrictEqual({
    documents: 1,
    drafts: 0,
    copies: 0,
  });

  const listed = await notes.list();

  expect(listed.map((document) => document.name)).toStrictEqual(['Good']);
});

test('drafts come back under their identifier, a copy of one open in another tab, the one on screen shown again', async () => {
  const source = memoryDrafts();
  await source.store.putMany([
    {
      id: 'on-screen',
      document: { text: 'one' },
      createdAt: 1,
      updatedAt: 2,
      file: { name: 'one.notes.svg', modified: false },
    },
    { id: 'other-tab', document: { text: 'two' }, createdAt: 3, updatedAt: 4 },
  ]);
  const archive = await archiveOf(
    createSiteBackup({
      stem: 'notes-cheminfo',
      generator: 'notes.cheminfo.org',
      documents: openNotes(),
      drafts: { ...source, current: () => null },
    }).write(),
  );

  const target = memoryDrafts(['other-tab']);
  const restored = await createSiteBackup({
    stem: 'notes-cheminfo',
    generator: 'notes.cheminfo.org',
    documents: openNotes('notes-target'),
    drafts: { ...target, current: () => 'on-screen' },
  }).read(archive);

  expect(restored).toStrictEqual({ documents: 0, drafts: 2, copies: 1 });
  expect(target.kept.get('on-screen')).toStrictEqual({
    id: 'on-screen',
    document: { text: 'one' },
    createdAt: 1,
    updatedAt: 2,
    file: { name: 'one.notes.svg', modified: true },
  });
  expect(target.kept.has('other-tab')).toBe(false);
  expect(target.kept.size).toBe(2);
  expect(target.calls).toStrictEqual(['discard', 'changed', 'open on-screen']);
});
