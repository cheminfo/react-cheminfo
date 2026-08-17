/**
 * Best-effort JSON access to `localStorage`.
 *
 * A page framed in a course may have no storage at all — third-party storage is
 * partitioned in Chrome and blocked in Safari — and a full quota must never
 * take the page down with it. So both calls swallow everything: an unreadable
 * entry reads as nothing stored, and a refused write is simply lost.
 */

/**
 * Read one entry back as JSON.
 * @param key - The storage key.
 * @returns What was parsed, or `undefined` when there is nothing readable.
 */
export function readJsonEntry(key: string): unknown {
  const storage = getStorage();
  if (storage === null) return undefined;
  try {
    const raw = storage.getItem(key);
    if (raw === null) return undefined;
    return JSON.parse(raw) as unknown;
  } catch {
    // Corrupt JSON, or a store that refuses to be read.
    return undefined;
  }
}

/**
 * Write one entry as JSON.
 * @param key - The storage key.
 * @param value - What to store.
 */
export function writeJsonEntry(key: string, value: unknown): void {
  const storage = getStorage();
  if (storage === null) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded, or a store that refuses to be written.
  }
}

function getStorage(): Storage | null {
  try {
    const candidate = globalThis.localStorage as Storage | undefined;
    return candidate ?? null;
  } catch {
    // Reading localStorage throws outright when storage is blocked.
    return null;
  }
}
