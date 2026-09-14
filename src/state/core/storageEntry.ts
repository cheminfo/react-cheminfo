/**
 * The storage key an entry occupies once its schema version is appended.
 * @param key - Name of the entry, namespaced by the site, e.g. `smiles:exercises`.
 * @param version - Schema version of what is stored under it.
 * @returns The versioned key, e.g. `smiles:exercises:v1`.
 */
export function versionedStorageKey(key: string, version: number): string {
  return `${key}:v${version}`;
}

/**
 * Read one `localStorage` entry back as JSON.
 *
 * A page framed by a course may have no storage at all — third-party storage
 * is partitioned in Chrome and blocked in Safari — so touching the store may
 * throw before it is even reached. Nothing of that reaches the caller: an
 * unreadable store, a missing entry and corrupt JSON all read as nothing.
 * @param storageKey - The full key, version included.
 * @returns What was parsed, or `undefined` when there is nothing readable.
 */
export function readStorageEntry(storageKey: string): unknown {
  let raw: string | null;
  try {
    raw = globalThis.localStorage?.getItem(storageKey) ?? null;
  } catch {
    return undefined;
  }
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * Write one `localStorage` entry as JSON, replacing what was there.
 *
 * Best effort: a value that cannot be serialised, an unavailable store and a
 * refused write are all swallowed. A write refused because the store is full
 * is reported through `onQuotaExceeded`, so a page can tell its visitor that
 * what they are doing is no longer being kept.
 * @param storageKey - The full key, version included.
 * @param value - What to store; it must be JSON serialisable.
 * @param onQuotaExceeded - Called with the error when the store is full.
 */
export function writeStorageEntry(
  storageKey: string,
  value: unknown,
  onQuotaExceeded?: (error: unknown) => void,
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
      // A callback that throws must not turn a lost entry into a crash.
    }
  }
}

/**
 * Forget one `localStorage` entry. An unavailable store has nothing to forget.
 * @param storageKey - The full key, version included.
 */
export function removeStorageEntry(storageKey: string): void {
  try {
    globalThis.localStorage?.removeItem(storageKey);
  } catch {
    // Nothing to do: the entry cannot be reached, so it cannot be read either.
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
