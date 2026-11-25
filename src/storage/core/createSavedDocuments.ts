import type { DBSchema } from 'idb';

import { openSiteDatabase } from './openSiteDatabase.ts';
import type {
  SavedDocument,
  SavedDocuments,
  SavedDocumentsOptions,
} from './savedDocumentsTypes.ts';
import { StoreRefusal, refusingWrite } from './storeRefusal.ts';

export type {
  SavedDocument,
  SavedDocuments,
  SavedDocumentsOptions,
} from './savedDocumentsTypes.ts';

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
      await refusingWrite(() => db.put('documents', document));
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
      await refusingWrite(() => db.put('documents', document));
      changed();
      return document;
    },
    rename: async (id, given) => {
      const documentName = checkedName(given);
      const holder = await named(documentName);
      if (holder && holder.id !== id) {
        throw new StoreRefusal(
          'taken',
          `A document is already saved as ${holder.name}.`,
        );
      }
      const db = await database.open();
      const row = await db.get('documents', id);
      if (!row) return;
      await refusingWrite(() =>
        db.put('documents', { ...row, name: documentName }),
      );
      changed();
    },
    remove: async (id) => {
      const db = await database.open();
      await db.delete('documents', id);
      changed();
    },
    restore: async (incoming) => {
      const kept = new Map<string, SavedDocument<TData>>();
      for (const document of await list()) {
        kept.set(nameKey(document.name), document);
      }
      const ids = new Set([...kept.values()].map((document) => document.id));
      const rows: StoredDocument[] = [];
      for (const row of incoming) {
        const document = documentOf(row, read);
        const name = document ? usableName(document.name) : undefined;
        if (!document || !name) continue;
        const holder = kept.get(nameKey(name));
        const id =
          holder?.id ??
          (ids.has(document.id) ? crypto.randomUUID() : document.id);
        const restored = { ...document, id, name };
        kept.set(nameKey(name), restored);
        ids.add(id);
        rows.push(restored);
      }
      if (rows.length === 0) return 0;
      const db = await database.open();
      const transaction = db.transaction('documents', 'readwrite');
      await refusingWrite(() =>
        Promise.all([
          ...rows.map((row) => transaction.store.put(row)),
          transaction.done,
        ]),
      );
      changed();
      return rows.length;
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
  if (trimmed === '') {
    throw new StoreRefusal('name', 'A document needs a name.');
  }
  if (trimmed.length > MAX_DOCUMENT_NAME) {
    throw new StoreRefusal(
      'name',
      `A name is at most ${MAX_DOCUMENT_NAME} characters long; this one has ${trimmed.length}.`,
    );
  }
  return trimmed;
}

function usableName(name: string): string | undefined {
  const trimmed = name.trim();
  return trimmed === '' || trimmed.length > MAX_DOCUMENT_NAME
    ? undefined
    : trimmed;
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
