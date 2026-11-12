import type { DBSchema } from 'idb';

import { chooseFolder, hasAccess, mayAccess } from './fileAccess.ts';
import { openSiteDatabase } from './openSiteDatabase.ts';

/** A file of the site's folder. */
export interface FolderEntry {
  /** Its name, extension included. */
  name: string;
  /** The file, which Save writes over once it is open. */
  handle: FileSystemFileHandle;
  /** When it last changed, in epoch milliseconds. */
  modified: number;
}

/** The folder a site keeps its documents in, chosen once. */
export interface SiteFolder {
  /**
   * The folder chosen before, without asking anything.
   * @returns It, or `undefined` when none was chosen or none can be kept.
   */
  current: () => Promise<FileSystemDirectoryHandle | undefined>;
  /**
   * The folder, ready to be written: the one chosen before, asked again for
   * its permission after a reload, else one the visitor picks now. Call it
   * from a click or a key.
   * @returns The folder; null when the visitor cancelled or refused;
   * undefined when the browser keeps no folder.
   */
  writable: () => Promise<FileSystemDirectoryHandle | null | undefined>;
  /**
   * Ask for another folder, and keep it in place of the one before. Call it
   * from a click.
   * @returns The folder; null when the visitor cancelled; undefined when the
   * browser keeps no folder.
   */
  choose: () => Promise<FileSystemDirectoryHandle | null | undefined>;
  /**
   * Whether the page may read the folder now, without asking.
   * @returns False after a reload, until the visitor allows it again.
   */
  readable: () => Promise<boolean>;
  /**
   * Ask again to read the folder kept from a visit before. Call it from a
   * click.
   * @returns Whether the page may.
   */
  allow: () => Promise<boolean>;
  /**
   * The site's files in the folder, the most recently changed first.
   * @param extensions - What their names end with, e.g. `['.write.html']`.
   * @returns The files; none while the page may not read the folder.
   */
  list: (extensions: readonly string[]) => Promise<FolderEntry[]>;
  /** Forget the folder: Save asks for one again. */
  forget: () => Promise<void>;
  /** Say the folder changed, so lists read it again. */
  changed: () => void;
  /**
   * Be told when the folder or its files change.
   * @returns The function that stops it.
   */
  subscribe: (listener: () => void) => () => void;
}

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
    if (handle) await keep(handle);
    return handle;
  }

  return {
    current,
    writable: async () => {
      const handle = await current();
      if (!handle) return choose();
      if (await mayAccess(handle, 'readwrite')) return handle;
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
      const handle = await current();
      if (!handle || !(await hasAccess(handle, 'read'))) return [];
      const files: FileSystemFileHandle[] = [];
      for await (const entry of handle.values()) {
        const { kind, name } = entry;
        if (kind === 'file' && extensions.some((end) => name.endsWith(end))) {
          files.push(entry);
        }
      }
      const entries = await Promise.all(
        files.map(async (file) => {
          const { lastModified } = await file.getFile();
          return { name: file.name, handle: file, modified: lastModified };
        }),
      );
      return entries.toSorted((a, b) => b.modified - a.modified);
    },
    forget: async () => {
      cached = Promise.resolve(undefined);
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
