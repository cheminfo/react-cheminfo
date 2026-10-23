import type { LegacyStorageKey } from './legacyEntries.ts';
import { adoptLegacyEntries } from './legacyEntries.ts';
import { isPlainRecord, mergeStored } from './mergeStored.ts';
import {
  readStorageEntry,
  removeStorageEntry,
  versionedStorageKey,
  writeStorageEntry,
} from './storageEntry.ts';

/**
 * A bucket of preferences kept in `localStorage` under one versioned key.
 *
 * Everything here is best effort. In a page framed by a course, third-party
 * storage is partitioned in Chrome and blocked in Safari, so a read may find
 * nothing, a write may be refused, and touching the store may throw before it
 * is even reached — none of which may ever reach the interface. A visitor whose
 * quota is full still gets a working site, with their preferences lasting only
 * as long as the tab.
 * @param options - See {@link PersistBucketOptions}.
 * @returns The ways to use the bucket: read it, write it, forget it, and
 * hear another tab write it.
 */
export function persistBucket<T extends object>(
  options: PersistBucketOptions<T>,
): PersistedBucket<T> {
  const { key, version = 1, defaults, onQuotaExceeded } = options;
  const { legacyKeys = [], forgetLegacyKeys = false } = options;
  const storageKey = versionedStorageKey(key, version);
  adoptLegacyEntries(storageKey, legacyKeys, forgetLegacyKeys);

  function read(): BucketRead<T> {
    const stored = readStorageEntry(storageKey);
    const usable = isPlainRecord(stored) ? stored : undefined;
    return {
      value: mergeStored(defaults, usable),
      firstRun: usable === undefined,
    };
  }

  return {
    storageKey,
    read,
    write: (value: T) => {
      writeStorageEntry(storageKey, value, onQuotaExceeded);
    },
    clear: () => {
      removeStorageEntry(storageKey);
    },
    subscribe: (listener) => {
      function handleStorage(event: Event): void {
        const change = event as { key?: unknown; newValue?: unknown };
        if (change.key !== storageKey || change.newValue === null) return;
        listener(read());
      }
      globalThis.addEventListener?.('storage', handleStorage);
      return () => {
        globalThis.removeEventListener?.('storage', handleStorage);
      };
    },
  };
}

/** How a bucket is named, versioned and filled in. */
export interface PersistBucketOptions<T extends object> {
  /**
   * Name of the bucket, namespaced by the site, e.g. `smiles:exercises`. The
   * version is appended to it, so this never carries one itself.
   */
  key: string;
  /**
   * Schema version, appended to the key as `:v<version>`. Raise it when a new
   * shape cannot be reconciled with the old one field by field, and every entry
   * written by the previous shape is then ignored rather than migrated.
   * @default 1
   */
  version?: number;
  /**
   * What a visitor who has stored nothing gets, and what every missing or
   * unusable field of a stored payload falls back to. Must be JSON
   * serialisable, since that is how it is stored.
   */
  defaults: T;
  /**
   * Called when a write was refused because the store is full, with the error
   * the store threw. The write is swallowed either way; this only exists so a
   * page can tell its visitor that what they are doing is no longer being kept.
   * @default undefined
   */
  onQuotaExceeded?: (error: unknown) => void;
  /**
   * The entries the bucket was kept under before this key: an unversioned
   * one, another site's, or a shape that needs a `migrate`. The first holding
   * something is copied over once, while the versioned entry does not exist.
   * @default []
   */
  legacyKeys?: readonly LegacyStorageKey[];
  /**
   * Remove every legacy entry found once it has been read, so a bucket
   * cleared later is not filled again from the old key. Left off, the old
   * entries stay where they are.
   * @default false
   */
  forgetLegacyKeys?: boolean;
}

/** The ways a page uses its bucket. */
export interface PersistedBucket<T extends object> {
  /** The versioned key the bucket occupies, e.g. `smiles:exercises:v1`. */
  readonly storageKey: string;
  /** What was stored, merged over the defaults. */
  read: () => BucketRead<T>;
  /** Store the bucket as it now stands, replacing what was there. */
  write: (value: T) => void;
  /** Forget the bucket, leaving whatever the page holds in memory untouched. */
  clear: () => void;
  /**
   * Hear another tab of the same site store the bucket. The tab writing never
   * hears its own write, and a removal is not news: the listener is handed
   * what is stored now, merged over the defaults.
   * @param listener - Called with the fresh read after each write elsewhere.
   * @returns The function that stops listening.
   */
  subscribe: (listener: (read: BucketRead<T>) => void) => () => void;
}

/** What one read of a bucket found. */
export interface BucketRead<T> {
  /** The stored payload merged over the defaults, ready to be used as is. */
  value: T;
  /**
   * True when nothing usable was there: no entry, an unreadable store, or a
   * payload that is not an object. It tells a first visit from a visitor who
   * chose exactly the defaults, which is what decides whether a page opens on
   * its welcome state or writes the bucket straight back.
   */
  firstRun: boolean;
}
