import type { DBSchema } from 'idb';

import { isPlainRecord } from '../../state/core/mergeStored.ts';

import type { DocumentPartsKept } from './documentFile.ts';
import { openSiteDatabase } from './openSiteDatabase.ts';

/** The file a draft's document is kept in. */
export interface DraftFile<D> {
  /** Its name. */
  name: string;
  /**
   * Where Save writes in place, kept so Save still writes there after a crash.
   * @default undefined — a document kept in no file of this computer
   */
  handle?: FileSystemFileHandle;
  /**
   * The document saved in this browser that Save replaces.
   * @default undefined
   */
  savedId?: string;
  /** Whether the document differs from what the file holds. */
  modified: boolean;
  /**
   * The document as the file holds it, kept only when it differs.
   * @default undefined
   */
  saved?: D;
  /**
   * What the site's archive keeps beside the document, which Save writes again.
   * @default undefined — the document alone
   */
  parts?: DocumentPartsKept;
}

/** One document kept in this browser as it changes. */
export interface Draft<D> {
  /** Its identifier, the same in a backup. */
  id: string;
  /** The document. */
  document: D;
  /**
   * The file it is kept in.
   * @default undefined — a document kept in no file
   */
  file?: DraftFile<D>;
  /** When it was first kept, in milliseconds. */
  createdAt: number;
  /** When it last changed, in milliseconds. */
  updatedAt: number;
}

/** Where a site keeps its drafts. */
export interface DraftStore<D> {
  /** Whether this browser lets the page keep drafts: false where refused. */
  isAvailable: () => Promise<boolean>;
  /** Every draft that reads as a document, the most recent first. */
  list: () => Promise<Array<Draft<D>>>;
  /** One draft; undefined when there is none or it does not read. */
  get: (id: string) => Promise<Draft<D> | undefined>;
  /** Write a draft, replacing the one of the same identifier. */
  put: (draft: Draft<D>) => Promise<void>;
  /** Write several drafts at once: all of them or none. */
  putMany: (drafts: ReadonlyArray<Draft<D>>) => Promise<void>;
  /** Forget a draft. */
  delete: (id: string) => Promise<void>;
}

/** How a site's drafts are named and read. */
export interface DraftStoreOptions<D> {
  /** The site's database name, e.g. `write-cheminfo`. */
  name: string;
  /** The document a row holds, checked like a file; undefined when it is none. */
  read: (value: unknown) => D | undefined;
  /**
   * The version of the database. Drafts are never migrated: raising it
   * deletes every draft kept before, so raise it when a document kept now
   * would no longer read.
   * @default 2
   */
  version?: number;
}

type DraftsSchema<D> = DBSchema & { drafts: { key: string; value: Draft<D> } };

/**
 * The drafts of one site, in a database of their own: every document the site
 * has shown, written as it changes, so a crash, a closed tab or a reload loses
 * a moment at most. A draft is the document as the page holds it, cloned into
 * IndexedDB as is; what is read back is checked like a file, so a row that is
 * no document cannot break the page.
 * @param options - Its name, and how a row is read.
 * @returns The store.
 */
export function createDraftStore<D>(
  options: DraftStoreOptions<D>,
): DraftStore<D> {
  const { name, read, version = 2 } = options;
  const database = openSiteDatabase<DraftsSchema<D>>({
    name,
    version,
    upgrade: (db) => {
      for (const store of db.objectStoreNames) db.deleteObjectStore(store);
      db.createObjectStore('drafts', { keyPath: 'id' });
    },
  });

  function readDraft(row: unknown): Draft<D> | undefined {
    if (!isPlainRecord(row)) return undefined;
    const { id, file, createdAt, updatedAt, drawing } = row;
    if (typeof id !== 'string' || id === '') return undefined;
    // draw and glassware wrote theirs as `drawing` before the store was shared.
    const document = read(row.document ?? drawing);
    if (document === undefined) return undefined;
    const draft: Draft<D> = {
      id,
      document,
      createdAt: timeOf(createdAt),
      updatedAt: timeOf(updatedAt),
    };
    const kept = readFile(file, read);
    return kept ? { ...draft, file: kept } : draft;
  }

  return {
    isAvailable: () => database.isAvailable(),
    list: async () => {
      const db = await database.open();
      const rows: unknown[] = await db.getAll('drafts');
      const drafts: Array<Draft<D>> = [];
      for (const row of rows) {
        const draft = readDraft(row);
        if (draft) drafts.push(draft);
      }
      return drafts.toSorted((a, b) => b.updatedAt - a.updatedAt);
    },
    get: async (id) => {
      const db = await database.open();
      return readDraft(await db.get('drafts', id));
    },
    put: async (draft) => {
      const db = await database.open();
      try {
        await db.put('drafts', draft);
      } catch (error) {
        // A browser that cannot store the file handle keeps the draft without it.
        if (!draft.file?.handle || !isCloneError(error)) throw error;
        await db.put('drafts', withoutHandle(draft));
      }
    },
    putMany: async (drafts) => {
      const db = await database.open();
      const tx = db.transaction('drafts', 'readwrite');
      await Promise.all([
        ...drafts.map((draft) => tx.store.put(draft)),
        tx.done,
      ]);
    },
    delete: async (id) => {
      const db = await database.open();
      await db.delete('drafts', id);
    },
  };
}

function readFile<D>(
  value: unknown,
  read: (value: unknown) => D | undefined,
): DraftFile<D> | undefined {
  if (!isPlainRecord(value)) return undefined;
  const { name, handle, savedId, modified, saved, parts } = value;
  if (typeof name !== 'string' || name === '') return undefined;
  const file: DraftFile<D> = { name, modified: modified !== false };
  if (isFileHandle(handle)) file.handle = handle;
  if (typeof savedId === 'string' && savedId !== '') file.savedId = savedId;
  const savedDocument = read(saved);
  if (savedDocument !== undefined) file.saved = savedDocument;
  if (isPlainRecord(parts)) {
    file.parts = {
      view: parts.view === true,
      workspace: parts.workspace === true,
    };
  }
  return file;
}

function isFileHandle(value: unknown): value is FileSystemFileHandle {
  return isPlainRecord(value) && value.kind === 'file';
}

function withoutHandle<D>(draft: Draft<D>): Draft<D> {
  if (!draft.file) return draft;
  const { handle, ...file } = draft.file;
  return handle ? { ...draft, file } : draft;
}

function timeOf(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function isCloneError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'DataCloneError';
}
