import type { DBSchema, IDBPDatabase, OpenDBCallbacks } from 'idb';
import { openDB } from 'idb';

import { toError } from '../../error/core/toError.ts';

/** What {@link openSiteDatabase} opens, and how it is laid out. */
export interface SiteDatabaseOptions<TSchema extends DBSchema | unknown> {
  /** The database's name, the same on every visit: the data is found by it. */
  name: string;
  /** Its schema version. Raise it with every change `upgrade` makes. */
  version: number;
  /** Creates the stores and indexes a version adds. */
  upgrade: NonNullable<OpenDBCallbacks<TSchema>['upgrade']>;
}

/** A site's database, opened once and on demand. */
export interface SiteDatabase<TSchema extends DBSchema | unknown> {
  /** The database's name. */
  readonly name: string;
  /**
   * The open connection. It is shared by every caller, and a failed open is
   * never kept, so the next call tries again.
   */
  open: () => Promise<IDBPDatabase<TSchema>>;
  /**
   * Whether the browser lets the page store anything here. Safari's "Block
   * all cookies", a sandboxed frame and a private window may all refuse it.
   */
  isAvailable: () => Promise<boolean>;
  /** Close the connection; the next `open` reconnects. */
  close: () => void;
}

/**
 * A site's IndexedDB database, through `idb`, with the failures that leave a
 * page hanging turned into errors.
 *
 * An upgrade blocked by another tab rejects instead of waiting forever. When
 * another tab asks for a newer version, this connection closes so that tab can
 * proceed, and the next `open` reconnects. A browser that refuses storage —
 * synchronously, as Safari does — rejects like any other failure, so a page can
 * keep working and simply save nothing.
 * @param options - See {@link SiteDatabaseOptions}.
 * @returns The database. Nothing is opened until `open` is first called.
 */
export function openSiteDatabase<TSchema extends DBSchema | unknown = unknown>(
  options: SiteDatabaseOptions<TSchema>,
): SiteDatabase<TSchema> {
  const { name, version, upgrade } = options;
  let pending: Promise<IDBPDatabase<TSchema>> | null = null;

  function forget(opening: Promise<IDBPDatabase<TSchema>>): void {
    if (pending === opening) pending = null;
  }

  function open(): Promise<IDBPDatabase<TSchema>> {
    if (pending) return pending;
    const opening = new Promise<IDBPDatabase<TSchema>>((resolve, reject) => {
      let settled = false;
      let request: Promise<IDBPDatabase<TSchema>>;
      try {
        request = openDB<TSchema>(name, version, {
          upgrade,
          blocked: () => {
            settled = true;
            reject(
              new Error(
                `${name} is open at an older version in another tab: close it, then reload this one`,
              ),
            );
          },
          blocking: () => {
            forget(opening);
            void request.then((db) => {
              db.close();
            });
          },
          terminated: () => {
            forget(opening);
          },
        });
      } catch (error) {
        reject(toError(error));
        return;
      }
      request.then(
        (db) => {
          // Opened after all, once the other tab let go: nobody waits for it.
          if (settled) db.close();
          else resolve(db);
        },
        (error: unknown) => {
          reject(toError(error));
        },
      );
    });
    pending = opening;
    opening.catch(() => {
      forget(opening);
    });
    return opening;
  }

  return {
    name,
    open,
    isAvailable: () =>
      open().then(
        () => true,
        () => false,
      ),
    close: () => {
      const opening = pending;
      pending = null;
      void opening?.then(
        (db) => {
          db.close();
        },
        () => undefined,
      );
    },
  };
}
