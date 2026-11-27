import { vi } from 'vitest';

import type { SavedDocument, SavedDocuments } from '../createSavedDocuments.ts';
import type { Cell } from '../documentFile.ts';
import type { FolderEntry, SiteFolder } from '../siteFolderTypes.ts';

/**
 * A value a test reads and writes as a signal would hold it.
 * @param value - What it holds first.
 * @returns The cell.
 */
export function cell<T>(value: T): Cell<T> {
  const holder = { value, peek: () => holder.value };
  return holder;
}

/**
 * A file of this computer, recording what is written into it.
 * @param name - Its name.
 * @returns Its handle, and what was written into it.
 */
export function fakeFile(name: string) {
  const written: string[] = [];
  const handle = {
    kind: 'file',
    name,
    queryPermission: () => Promise.resolve('granted'),
    createWritable: () =>
      Promise.resolve({
        write: (content: string) => {
          written.push(content);
          return Promise.resolve();
        },
        close: () => Promise.resolve(),
        abort: () => Promise.resolve(),
      }),
    isSameEntry: (other: { name: string }) =>
      Promise.resolve(other.name === name),
    getFile: () => Promise.resolve({ lastModified: 1 }),
  };
  return { handle: handle as unknown as FileSystemFileHandle, written };
}

/**
 * The site's folder, holding the named files.
 * @param names - The files it holds.
 * @param options - Its own name.
 * @param options.name - What the folder is called. Defaults to `'Notebook'`.
 * @returns The folder, and its files by name.
 */
export function fakeFolder(
  names: readonly string[],
  options: { name?: string } = {},
) {
  const { name: folderName = 'Notebook' } = options;
  const files = new Map<string, ReturnType<typeof fakeFile>>();
  for (const name of names) files.set(name, fakeFile(name));
  const directory = {
    kind: 'directory',
    name: folderName,
    getFileHandle: (name: string, created?: { create?: boolean }) => {
      let entry = files.get(name);
      if (!entry && created?.create) {
        entry = fakeFile(name);
        files.set(name, entry);
      }
      return entry
        ? Promise.resolve(entry.handle)
        : Promise.reject(new DOMException('absent', 'NotFoundError'));
    },
  } as unknown as FileSystemDirectoryHandle;
  const folder = {
    writable: () => Promise.resolve(directory),
    list: (): Promise<FolderEntry[]> => {
      const entries: FolderEntry[] = [];
      for (const [name, file] of files) {
        entries.push({ name, handle: file.handle, modified: 1 });
      }
      return Promise.resolve(entries);
    },
    changed: vi.fn(),
  } as unknown as SiteFolder;
  return { folder, files };
}

/**
 * Documents kept in this browser, in memory.
 * @returns The store, with the rows it holds.
 */
export function memoryDocuments(): SavedDocuments<string> & {
  rows: Array<SavedDocument<string>>;
} {
  const rows: Array<SavedDocument<string>> = [];
  return {
    rows,
    isAvailable: () => Promise.resolve(true),
    list: () => Promise.resolve([...rows]),
    named: (name) => Promise.resolve(rows.find((row) => row.name === name)),
    save: (name, data) => {
      const previous = rows.find((row) => row.name === name);
      const row = {
        id: previous?.id ?? `id-${rows.length + 1}`,
        name,
        savedAt: 1,
        data,
      };
      if (previous) rows[rows.indexOf(previous)] = row;
      else rows.push(row);
      return Promise.resolve(row);
    },
    update: (id, data) => {
      const row = rows.find((candidate) => candidate.id === id);
      if (row) row.data = data;
      return Promise.resolve(row);
    },
    rename: () => Promise.resolve(),
    remove: () => Promise.resolve(),
    restore: () => Promise.resolve(0),
    subscribe: () => stopNothing,
  };
}

/**
 * Documents a folder panel lists and never changes.
 * @param documents - What it holds, the latest first.
 * @returns The store.
 */
export function listedDocuments(
  documents: Array<SavedDocument<string>>,
): SavedDocuments<string> {
  return {
    isAvailable: () => Promise.resolve(true),
    list: () => Promise.resolve(documents),
    named: () => Promise.resolve(undefined),
    save: () => Promise.reject(new Error('not in this test')),
    update: () => Promise.resolve(undefined),
    rename: () => Promise.resolve(),
    remove: () => Promise.resolve(),
    restore: () => Promise.resolve(0),
    subscribe: () => stopNothing,
  };
}

function stopNothing(): void {
  // Nothing was subscribed to.
}
