/**
 * Moving the documents saved in this browser to the site's folder: each
 * becomes a file under its own name, numbered when the name is taken, and
 * leaves the browser only once written; the one on screen follows its file.
 */

import { expect, test, vi } from 'vitest';

import type { SavedDocument, SavedDocuments } from '../createSavedDocuments.ts';
import type { Cell, DocumentFile } from '../documentFile.ts';
import type { SaveFormat } from '../documentSaverTypes.ts';
import { moveToFolder } from '../moveToFolder.ts';
import type { SiteFolder } from '../siteFolderTypes.ts';

const TEXT: SaveFormat<string> = {
  id: 'text',
  label: 'Text',
  extension: '.notes.txt',
  picker: { description: 'Text', accept: { 'text/plain': ['.txt'] } },
  write: (text, _parts, name) => `${name}: ${text}`,
};

function cell<T>(value: T): Cell<T> {
  const holder = { value, peek: () => holder.value };
  return holder;
}

function fakeDirectory(taken: string[], failOn?: string) {
  const written = new Map<string, string>();
  const names = new Set(taken);
  const directory = {
    kind: 'directory',
    name: 'Course',
    getFileHandle: (name: string, options?: { create?: boolean }) => {
      if (!names.has(name) && !options?.create) {
        return Promise.reject(new DOMException('absent', 'NotFoundError'));
      }
      names.add(name);
      return Promise.resolve({
        kind: 'file',
        name,
        queryPermission: () => Promise.resolve('granted'),
        createWritable: () =>
          Promise.resolve({
            write: (content: string) => {
              if (name === failOn) {
                return Promise.reject(new Error('disk full'));
              }
              written.set(name, content);
              return Promise.resolve();
            },
            close: () => Promise.resolve(),
            abort: () => Promise.resolve(),
          }),
      });
    },
  } as unknown as FileSystemDirectoryHandle;
  return { directory, written };
}

function fakeFolder(
  directory: FileSystemDirectoryHandle | null | undefined,
): SiteFolder {
  return {
    writable: () => Promise.resolve(directory),
    current: () => Promise.resolve(directory ?? undefined),
    path: () => ['Week 3'],
    changed: vi.fn(),
  } as unknown as SiteFolder;
}

function memoryStore(documents: Array<SavedDocument<string>>) {
  const kept = [...documents];
  const store = {
    list: () => Promise.resolve([...kept]),
    remove: (id: string) => {
      const index = kept.findIndex((document) => document.id === id);
      if (index !== -1) kept.splice(index, 1);
      return Promise.resolve();
    },
  } as unknown as SavedDocuments<string>;
  return { store, kept };
}

const NOTES = { id: 'n', name: 'Notes', savedAt: 2, data: 'orbitals' };
const PLAN = { id: 'p', name: 'Plan', savedAt: 1, data: 'week 3' };

test('every document becomes a file and leaves the browser', async () => {
  const { directory, written } = fakeDirectory(['Plan.notes.txt']);
  const { store, kept } = memoryStore([NOTES, PLAN]);
  const file = cell<DocumentFile<string> | null>({
    name: 'Notes',
    savedId: 'n',
    saved: 'orbitals',
  });

  const outcome = await moveToFolder({
    folder: fakeFolder(directory),
    store,
    format: TEXT,
    file,
  });

  expect(outcome).toStrictEqual({
    kind: 'moved',
    count: 2,
    folder: ['Course', 'Week 3'],
  });
  expect(Object.fromEntries(written)).toStrictEqual({
    'Notes.notes.txt': 'Notes.notes.txt: orbitals',
    'Plan (2).notes.txt': 'Plan (2).notes.txt: week 3',
  });
  expect(kept).toStrictEqual([]);
  expect(file.value?.name).toBe('Notes.notes.txt');
  expect(file.value?.savedId).toBeUndefined();
  expect(file.value?.handle?.name).toBe('Notes.notes.txt');
  expect(file.value?.saved).toBe('orbitals');
});

test('only the documents asked for are moved', async () => {
  const { directory, written } = fakeDirectory([]);
  const { store, kept } = memoryStore([NOTES, PLAN]);
  const file = cell<DocumentFile<string> | null>(null);

  const outcome = await moveToFolder({
    folder: fakeFolder(directory),
    store,
    format: TEXT,
    file,
    ids: ['p'],
  });

  expect(outcome).toStrictEqual({
    kind: 'moved',
    count: 1,
    folder: ['Course', 'Week 3'],
  });
  expect([...written.keys()]).toStrictEqual(['Plan.notes.txt']);
  expect(kept).toStrictEqual([NOTES]);
  expect(file.value).toBeNull();
});

test('a document that cannot be written stays in the browser', async () => {
  const { directory } = fakeDirectory([], 'Plan.notes.txt');
  const { store, kept } = memoryStore([NOTES, PLAN]);

  const outcome = await moveToFolder({
    folder: fakeFolder(directory),
    store,
    format: TEXT,
    file: cell<DocumentFile<string> | null>(null),
  });

  expect(outcome).toStrictEqual({
    kind: 'failed',
    count: 1,
    name: 'Plan',
    message: 'disk full',
  });
  expect(kept).toStrictEqual([PLAN]);
});

test('no folder picked moves nothing', async () => {
  const { store, kept } = memoryStore([NOTES]);
  const file = cell<DocumentFile<string> | null>(null);

  const cancelled = await moveToFolder({
    folder: fakeFolder(null),
    store,
    format: TEXT,
    file,
  });
  const unavailable = await moveToFolder({
    folder: fakeFolder(undefined),
    store,
    format: TEXT,
    file,
  });

  expect(cancelled).toStrictEqual({ kind: 'cancelled' });
  expect(unavailable).toStrictEqual({ kind: 'unavailable' });
  expect(kept).toStrictEqual([NOTES]);
});

test('a name kept with a time becomes a file name the disk takes', async () => {
  const { directory, written } = fakeDirectory([]);
  const { store, kept } = memoryStore([
    { id: 't', name: 'Caffeine, 16 Nov 2026, 07:01', savedAt: 3, data: 'x' },
  ]);

  const outcome = await moveToFolder({
    folder: fakeFolder(directory),
    store,
    format: TEXT,
    file: cell<DocumentFile<string> | null>(null),
  });

  expect(outcome.kind).toBe('moved');
  expect([...written.keys()]).toStrictEqual([
    'Caffeine, 16 Nov 2026, 0701.notes.txt',
  ]);
  expect(kept).toStrictEqual([]);
});

test('a folder no longer on the disk is named, and nothing leaves the browser', async () => {
  const directory = {
    kind: 'directory',
    name: 'export',
    getFileHandle: folderGone,
    keys: () => ({ next: folderGone }),
  } as unknown as FileSystemDirectoryHandle;
  const { store, kept } = memoryStore([NOTES]);

  const outcome = await moveToFolder({
    folder: fakeFolder(directory),
    store,
    format: TEXT,
    file: cell<DocumentFile<string> | null>(null),
  });

  expect(outcome).toStrictEqual({
    kind: 'failed',
    count: 0,
    name: 'Notes',
    message: 'gone',
    missingFolder: 'export',
  });
  expect(kept).toStrictEqual([NOTES]);
});

function folderGone(): Promise<never> {
  return Promise.reject(new DOMException('gone', 'NotFoundError'));
}
