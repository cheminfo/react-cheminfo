import type { DBSchema } from 'idb';

import { openSiteDatabase } from './openSiteDatabase.ts';

/** A document kept in this browser under a name. */
export interface SavedDocument<TData> {
  /** Its identifier, kept when it is saved again or renamed. */
  id: string;
  /** The name it is listed under, unique among the site's documents. */
  name: string;
  /** When it was last saved, in epoch milliseconds. */
  savedAt: number;
  /** The document, as the site holds it. */
  data: TData;
}

/** Options of {@link createSavedDocuments}. */
export interface SavedDocumentsOptions<TData> {
  /**
   * The site's database stem, e.g. `write-cheminfo`; the documents are kept in
   * a database of their own, `<name>-documents`.
   */
  name: string;
  /**
   * The document a stored value holds, or undefined when it holds none. Rows
   * are read like a file, so one written by an older build cannot break the
   * page.
   */
  read: (value: unknown) => TData | undefined;
}

/** The documents a site keeps in this browser under a name. */
export interface SavedDocuments<TData> {
  /** Whether this browser lets the page keep them. */
  isAvailable: () => Promise<boolean>;
  /** Every document, the most recently saved first. */
  list: () => Promise<Array<SavedDocument<TData>>>;
  /** The document saved under a name, compared without case or outer spaces. */
  named: (name: string) => Promise<SavedDocument<TData> | undefined>;
  /**
   * Keep a document under a name, in place of the one saved under it before.
   * @throws {Error} When the name is empty or longer than {@link MAX_DOCUMENT_NAME}.
   */
  save: (name: string, data: TData) => Promise<SavedDocument<TData>>;
  /**
   * Save a document again under the name it has now, renamed or not.
   * @returns It, or `undefined` when it was forgotten meanwhile.
   */
  update: (
    id: string,
    data: TData,
  ) => Promise<SavedDocument<TData> | undefined>;
  /**
   * Give a document another name.
   * @throws {Error} When the name is not one a document can take, or another
   * document goes by it.
   */
  rename: (id: string, name: string) => Promise<void>;
  /** Forget a document. */
  remove: (id: string) => Promise<void>;
  /**
   * Be told when the documents change, in this tab or another.
   * @returns The function that stops it.
   */
  subscribe: (listener: () => void) => () => void;
}

/** The longest name a document takes. */
export const MAX_DOCUMENT_NAME = 120;

interface StoredDocument {
  id: string;
  name: string;
  savedAt: number;
  data: unknown;
}

interface DocumentsSchema extends DBSchema {
  documents: { key: string; value: StoredDocument };
}

/**
 * The documents a site keeps in this browser under a name: saved on purpose,
 * listed by their name, opened again later. A draft keeps what is on screen
 * as it changes; a saved document stays as it was saved until it is saved
 * again.
 * @param options - See {@link SavedDocumentsOptions}.
 * @returns See {@link SavedDocuments}.
 */
export function createSavedDocuments<TData>(
  options: SavedDocumentsOptions<TData>,
): SavedDocuments<TData> {
  const { read } = options;
  const name = `${options.name}-documents`;
  const database = openSiteDatabase<DocumentsSchema>({
    name,
    version: 1,
    upgrade: (db) => {
      db.createObjectStore('documents', { keyPath: 'id' });
    },
  });
  const listeners = new Set<() => void>();
  const channel =
    typeof BroadcastChannel === 'function' ? new BroadcastChannel(name) : null;

  function notify(): void {
    for (const listener of listeners) listener();
  }
  if (channel) channel.addEventListener('message', notify);

  function changed(): void {
    notify();
    channel?.postMessage('changed');
  }

  async function list(): Promise<Array<SavedDocument<TData>>> {
    const db = await database.open();
    const documents: Array<SavedDocument<TData>> = [];
    for (const row of await db.getAll('documents')) {
      const document = documentOf(row, read);
      if (document) documents.push(document);
    }
    return documents.toSorted((a, b) => b.savedAt - a.savedAt);
  }

  async function named(
    wanted: string,
  ): Promise<SavedDocument<TData> | undefined> {
    const key = nameKey(wanted);
    const documents = await list();
    return documents.find((document) => nameKey(document.name) === key);
  }

  return {
    isAvailable: () => database.isAvailable(),
    list,
    named,
    save: async (given, data) => {
      const documentName = checkedName(given);
      const previous = await named(documentName);
      const document: SavedDocument<TData> = {
        id: previous?.id ?? crypto.randomUUID(),
        name: documentName,
        savedAt: Date.now(),
        data,
      };
      const db = await database.open();
      await db.put('documents', document);
      changed();
      return document;
    },
    update: async (id, data) => {
      const db = await database.open();
      const row = await db.get('documents', id);
      if (!row || typeof row.name !== 'string') return undefined;
      const document: SavedDocument<TData> = {
        id,
        name: row.name,
        savedAt: Date.now(),
        data,
      };
      await db.put('documents', document);
      changed();
      return document;
    },
    rename: async (id, given) => {
      const documentName = checkedName(given);
      const holder = await named(documentName);
      if (holder && holder.id !== id) {
        throw new Error(`A document is already saved as ${holder.name}.`);
      }
      const db = await database.open();
      const row = await db.get('documents', id);
      if (!row) return;
      await db.put('documents', { ...row, name: documentName });
      changed();
    },
    remove: async (id) => {
      const db = await database.open();
      await db.delete('documents', id);
      changed();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * How two names are compared: without case and outer spaces, so `Report` and
 * ` report ` are one document.
 * @param name - A name.
 * @returns Its key.
 */
export function nameKey(name: string): string {
  return name.trim().toLocaleLowerCase();
}

function checkedName(name: string): string {
  const trimmed = name.trim();
  if (trimmed === '') throw new Error('A document needs a name.');
  if (trimmed.length > MAX_DOCUMENT_NAME) {
    throw new Error(
      `A name is at most ${MAX_DOCUMENT_NAME} characters long; this one has ${trimmed.length}.`,
    );
  }
  return trimmed;
}

function documentOf<TData>(
  row: StoredDocument,
  read: (value: unknown) => TData | undefined,
): SavedDocument<TData> | undefined {
  if (
    typeof row.id !== 'string' ||
    typeof row.name !== 'string' ||
    typeof row.savedAt !== 'number'
  ) {
    return undefined;
  }
  const data = read(row.data);
  return data === undefined
    ? undefined
    : { id: row.id, name: row.name, savedAt: row.savedAt, data };
}
