import type { DBSchema } from 'idb';

import {
  readStorageEntry,
  removeStorageEntry,
  writeStorageEntry,
} from '../../state/core/storageEntry.ts';

import { chooseFolder, hasAccess, mayAccess } from './fileAccess.ts';
import { listFiles, listFolders, searchFiles } from './folderListing.ts';
import { openSiteDatabase } from './openSiteDatabase.ts';
import type { SiteFolder } from './siteFolderTypes.ts';

export type { FolderEntry, SiteFolder } from './siteFolderTypes.ts';

interface FolderSchema extends DBSchema {
  folder: { key: string; value: FileSystemDirectoryHandle };
}

const KEY = 'folder';

/**
 * The folder a site keeps its documents in, where the browser offers one:
 * chosen once, kept in IndexedDB across visits, and allowed again by the
 * visitor after each reload — Chrome offers to allow it on every visit.
 * @param site - The site, e.g. `write`; names the database, `<site>-folder`.
 * @returns The folder.
 */
export function createSiteFolder(site: string): SiteFolder {
  const database = openSiteDatabase<FolderSchema>({
    name: `${site}-folder`,
    version: 1,
    upgrade: (db) => {
      db.createObjectStore('folder');
    },
  });
  const listeners = new Set<() => void>();
  let cached: Promise<FileSystemDirectoryHandle | undefined> | undefined;
  const pathKey = `${site}:folder-path`;
  let opened = readPath(pathKey);

  function changed(): void {
    for (const listener of listeners) listener();
  }

  function current(): Promise<FileSystemDirectoryHandle | undefined> {
    cached ??= database
      .open()
      .then((db) => db.get('folder', KEY))
      .then(
        (handle) => (isFolder(handle) ? handle : undefined),
        () => undefined,
      );
    return cached;
  }

  async function keep(handle: FileSystemDirectoryHandle): Promise<void> {
    cached = Promise.resolve(handle);
    changed();
    try {
      const db = await database.open();
      await db.put('folder', handle, KEY);
    } catch {
      // Kept for this visit only: the next one asks for the folder again.
    }
  }

  async function choose(): Promise<
    FileSystemDirectoryHandle | null | undefined
  > {
    const handle = await chooseFolder();
    if (handle) {
      setPath([]);
      await keep(handle);
    }
    return handle;
  }

  function setPath(path: readonly string[]): void {
    opened = [...path];
    if (opened.length === 0) removeStorageEntry(pathKey);
    else writeStorageEntry(pathKey, opened);
  }

  // The folder open in the panel; the chosen one when the path is gone.
  async function inside(
    root: FileSystemDirectoryHandle,
  ): Promise<FileSystemDirectoryHandle> {
    let handle = root;
    try {
      for (const name of opened) {
        // eslint-disable-next-line no-await-in-loop -- each folder is inside the one before
        handle = await handle.getDirectoryHandle(name);
      }
      return handle;
    } catch {
      setPath([]);
      return root;
    }
  }

  async function readableHere(): Promise<
    FileSystemDirectoryHandle | undefined
  > {
    const handle = await current();
    if (!handle || !(await hasAccess(handle, 'read'))) return undefined;
    return inside(handle);
  }

  return {
    current,
    writable: async () => {
      const handle = await current();
      if (!handle) return choose();
      if (await mayAccess(handle, 'readwrite')) return inside(handle);
      return null;
    },
    choose,
    readable: async () => {
      const handle = await current();
      return handle ? hasAccess(handle, 'read') : false;
    },
    allow: async () => {
      const handle = await current();
      if (!handle) return false;
      const allowed = await mayAccess(handle, 'read');
      if (allowed) changed();
      return allowed;
    },
    list: async (extensions) => {
      const here = await readableHere();
      return here ? listFiles(here, extensions) : [];
    },
    search: async (extensions) => {
      const here = await readableHere();
      return here ? searchFiles(here, extensions) : [];
    },
    folders: async () => {
      const here = await readableHere();
      return here ? listFolders(here) : [];
    },
    path: () => opened,
    open: (path) => {
      setPath(path);
      changed();
    },
    createFolder: async (name) => {
      const folderName = name.trim();
      if (folderName === '' || /[/\\:]/u.test(folderName)) {
        throw new Error(`“${name}” cannot name a folder`);
      }
      const handle = await current();
      if (!handle || !(await mayAccess(handle, 'readwrite'))) {
        throw new Error('the page may not write in this folder');
      }
      const here = await inside(handle);
      await here.getDirectoryHandle(folderName, { create: true });
      changed();
    },
    forget: async () => {
      cached = Promise.resolve(undefined);
      setPath([]);
      changed();
      try {
        const db = await database.open();
        await db.delete('folder', KEY);
      } catch {
        // Nothing was kept to forget.
      }
    },
    changed,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function isFolder(value: unknown): value is FileSystemDirectoryHandle {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { kind?: unknown }).kind === 'directory'
  );
}

function readPath(key: string): string[] {
  const stored = readStorageEntry(key);
  if (!Array.isArray(stored)) return [];
  const path: string[] = [];
  for (const name of stored) {
    if (typeof name !== 'string' || name === '' || name.includes('/')) {
      return [];
    }
    path.push(name);
  }
  return path;
}
