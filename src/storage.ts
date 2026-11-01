/**
 * What a site keeps in the visitor's browser, so a crash or a closed tab loses
 * nothing: an IndexedDB database opened safely, an autosave that writes at most
 * every few seconds, which tab holds which piece of work, a guard against
 * reopening the work that crashed the page, and backups out and back in.
 *
 * Its own door because it brings `idb` and `@zip.js/zip.js` with it, which a
 * site that stores nothing must not download. The types of `idb` come through
 * it, so a site writes its schema without depending on `idb` itself.
 */

export type {
  DBSchema,
  IDBPDatabase,
  IDBPObjectStore,
  IDBPTransaction,
  StoreNames,
  StoreValue,
} from 'idb';

export * from './storage/core/index.ts';
export * from './storage/ui/index.ts';
