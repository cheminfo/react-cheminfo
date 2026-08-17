import { isPlainRecord, mergeStored } from './mergeStored.ts';

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
 * @returns The three ways to use the bucket: read it, write it, forget it.
 */
export function persistBucket<T extends object>(
  options: PersistBucketOptions<T>,
): PersistedBucket<T> {
  const { key, version = 1, defaults, onQuotaExceeded } = options;
  const storageKey = `${key}:v${version}`;

  return {
    storageKey,
    read: () => {
      const stored = readEntry(storageKey);
      return {
        value: mergeStored(defaults, stored),
        firstRun: stored === undefined,
      };
    },
    write: (value: T) => {
      writeEntry(storageKey, value, onQuotaExceeded);
    },
    clear: () => {
      try {
        globalThis.localStorage?.removeItem(storageKey);
      } catch {
        // An unavailable store has nothing to forget.
      }
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
}

/** The three ways a page uses its bucket. */
export interface PersistedBucket<T extends object> {
  /** The versioned key the bucket occupies, e.g. `smiles:exercises:v1`. */
  readonly storageKey: string;
  /** What was stored, merged over the defaults. */
  read: () => BucketRead<T>;
  /** Store the bucket as it now stands, replacing what was there. */
  write: (value: T) => void;
  /** Forget the bucket, leaving whatever the page holds in memory untouched. */
  clear: () => void;
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

function readEntry(storageKey: string): unknown {
  let raw: string | null;
  try {
    raw = globalThis.localStorage?.getItem(storageKey) ?? null;
  } catch {
    return undefined;
  }
  if (raw === null) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isPlainRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function writeEntry(
  storageKey: string,
  value: unknown,
  onQuotaExceeded: ((error: unknown) => void) | undefined,
): void {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    // A value that cannot be serialised is a bug in the caller, never a reason
    // to take the page down with it.
    return;
  }
  try {
    globalThis.localStorage?.setItem(storageKey, serialized);
  } catch (error) {
    if (!isQuotaExceeded(error) || onQuotaExceeded === undefined) return;
    try {
      onQuotaExceeded(error);
    } catch {
      // A callback that throws must not turn a lost preference into a crash.
    }
  }
}

function isQuotaExceeded(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { name, code } = error as { name?: unknown; code?: unknown };
  return (
    name === 'QuotaExceededError' ||
    name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    code === 22 ||
    code === 1014
  );
}
