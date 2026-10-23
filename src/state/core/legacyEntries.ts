import {
  readStorageText,
  removeStorageEntry,
  writeStorageEntry,
  writeStorageText,
} from './storageEntry.ts';

/**
 * An entry a bucket was kept under before it took its versioned key: the full
 * storage key, as written, or the key with a function turning its payload into
 * the bucket's current shape.
 */
export type LegacyStorageKey =
  | string
  | {
      /** The full storage key, e.g. `storage` or `mixonat:preferences`. */
      key: string;
      /**
       * Turn the old payload, as `JSON.parse` read it, into what the bucket
       * stores now. Answering `undefined`, or throwing, adopts nothing.
       */
      migrate: (stored: unknown) => unknown;
    };

/**
 * Carry a returning visitor's entry over to the versioned key a bucket now
 * uses, once.
 *
 * The first legacy key holding something is copied — as it is, or through its
 * `migrate` — and only while the versioned entry does not exist, so it never
 * overwrites what the bucket has written since. With `forget`, every legacy
 * entry found is removed afterwards, adopted or not, so a bucket cleared later
 * is not filled again from the old key on the next visit. Best effort, like
 * every access to the store: one that cannot be reached adopts nothing.
 * @param storageKey - The versioned key the bucket occupies.
 * @param legacyKeys - The older entries, the preferred one first.
 * @param forget - Whether to remove the legacy entries once read.
 */
export function adoptLegacyEntries(
  storageKey: string,
  legacyKeys: readonly LegacyStorageKey[],
  forget: boolean,
): void {
  if (legacyKeys.length === 0) return;
  let adopted = readStorageText(storageKey) !== null;
  for (const legacy of legacyKeys) {
    const key = typeof legacy === 'string' ? legacy : legacy.key;
    if (key === storageKey) continue;
    const text = readStorageText(key);
    if (text === null) continue;
    if (!adopted) {
      adopted =
        typeof legacy === 'string'
          ? writeStorageText(storageKey, text)
          : writeMigrated(storageKey, text, legacy.migrate);
    }
    if (forget) removeStorageEntry(key);
  }
}

function writeMigrated(
  storageKey: string,
  text: string,
  migrate: (stored: unknown) => unknown,
): boolean {
  let value: unknown;
  try {
    value = migrate(JSON.parse(text));
  } catch {
    // A payload nobody can read any more is left to the defaults.
    return false;
  }
  if (value === undefined) return false;
  writeStorageEntry(storageKey, value);
  return readStorageText(storageKey) !== null;
}
