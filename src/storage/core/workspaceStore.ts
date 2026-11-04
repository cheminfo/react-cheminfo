import type { DBSchema } from 'idb';

import { isPlainRecord } from '../../state/core/mergeStored.ts';
import { persistBucket } from '../../state/core/persistBucket.ts';

import { openSiteDatabase } from './openSiteDatabase.ts';
import type { StoredWorkspace, WorkspaceEntry } from './workspaceRows.ts';
import { rowOf } from './workspaceRows.ts';

/** What the store held when the page started. */
export interface StoredRead {
  /** Every workspace row, unchecked. */
  rows: unknown[];
  /** The workspace that was on screen, unchecked. */
  active: unknown;
}

/** The IndexedDB database the workspaces of a site are kept in. */
export interface WorkspaceStore {
  /**
   * Read every row, or give up after `timeout` milliseconds; from then on
   * nothing is written, so what the store holds is never overwritten by a page
   * that went on without it.
   */
  read: (timeout: number) => Promise<StoredRead | undefined>;
  /** Write a workspace, when the store was read. */
  put: (entry: WorkspaceEntry) => Promise<boolean>;
  /**
   * Write a row as an autosave scheduled it.
   * @returns Whether it was written: not when the store was given up on.
   */
  putRow: (row: StoredWorkspace) => Promise<boolean>;
  /** Write which workspace is on screen. */
  putActive: (id: string) => Promise<void>;
  /** Delete a workspace. */
  remove: (id: string) => Promise<void>;
}

interface WorkspacesSchema extends DBSchema {
  workspaces: { key: string; value: StoredWorkspace };
  meta: { key: string; value: string };
}

const ACTIVE = 'active';

/**
 * Open the store of a site's workspaces: a database of its own, so no other
 * store's upgrade ever touches it.
 * @param name - The site's database stem, e.g. `draw-cheminfo`.
 * @returns The store.
 */
export function openWorkspaceStore(name: string): WorkspaceStore {
  const database = openSiteDatabase<WorkspacesSchema>({
    name: `${name}-workspaces`,
    version: 1,
    upgrade: (db) => {
      db.createObjectStore('workspaces', { keyPath: 'id' });
      db.createObjectStore('meta');
    },
  });
  let stored = false;

  async function readAll(): Promise<StoredRead> {
    const db = await database.open();
    const [rows, active] = await Promise.all([
      db.getAll('workspaces'),
      db.get('meta', ACTIVE),
    ]);
    return { rows, active };
  }

  async function putRow(row: StoredWorkspace): Promise<boolean> {
    if (!stored) return false;
    const db = await database.open();
    await db.put('workspaces', row);
    return true;
  }

  return {
    read: async (timeout) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const late = new Promise<undefined>((resolve) => {
        timer = setTimeout(() => resolve(undefined), timeout);
      });
      const read = await Promise.race([readAll().catch(() => undefined), late]);
      clearTimeout(timer);
      stored = read !== undefined;
      return read;
    },
    put: (entry) => putRow(rowOf(entry)),
    putRow,
    putActive: async (id) => {
      if (!stored) return;
      const db = await database.open();
      await db.put('meta', id, ACTIVE);
    },
    remove: async (id) => {
      if (!stored) return;
      const db = await database.open();
      await db.delete('workspaces', id);
    },
  };
}

/** The preferences last shown, kept at once where a page can write at once. */
export interface WorkspaceJournal {
  /** What was last shown, when it is not known to be in IndexedDB. */
  read: () => { id: string; live: unknown } | undefined;
  /** Keep what is shown now. */
  write: (id: string, live: Record<string, unknown>) => void;
  /** Forget it, once IndexedDB holds it. */
  clear: () => void;
}

/**
 * Open the journal of a site's workspaces: the preferences on screen, written
 * to `localStorage` the moment they change. An IndexedDB write is not done
 * when the call returns, and a page reloaded or closed right after a change
 * may never finish it; the journal is what the next page takes them from.
 * @param name - The site's database stem, e.g. `draw-cheminfo`.
 * @returns The journal.
 */
export function openWorkspaceJournal(name: string): WorkspaceJournal {
  const entry = persistBucket<Record<string, unknown>>({
    key: `${name}:workspace`,
    version: 1,
    defaults: {},
  });
  return {
    read: () => {
      const { value, firstRun } = entry.read();
      if (firstRun || typeof value.id !== 'string') return undefined;
      return { id: value.id, live: value.live };
    },
    write: (id, live) => {
      entry.write({ id, live });
    },
    clear: entry.clear,
  };
}

/**
 * Take the stored rows into the workspaces of the page: how each of the
 * site's own was left, and the visitor's own whole. A row that does not read
 * is skipped.
 * @param rows - The rows, unchecked.
 * @param entries - The workspaces, the site's own already in.
 * @param fit - Fits stored preferences to the bucket.
 */
export function takeRows(
  rows: readonly unknown[],
  entries: Map<string, WorkspaceEntry>,
  fit: (value: unknown) => Record<string, unknown>,
): void {
  for (const row of rows) {
    if (!isPlainRecord(row) || typeof row.id !== 'string') continue;
    const { id, source, name, definition, live } = row;
    const known = entries.get(id);
    if (source === 'builtin') {
      if (known?.source === 'builtin') {
        known.live = live === undefined ? undefined : fit(live);
      }
      continue;
    }
    if (source !== 'user' || known?.source === 'builtin') continue;
    if (typeof name !== 'string' || name.trim() === '') continue;
    entries.set(id, {
      id,
      name,
      source: 'user',
      definition: fit(definition),
      live: live === undefined ? undefined : fit(live),
    });
  }
}
