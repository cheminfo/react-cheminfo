import type { LegacyStorageKey } from './legacyEntries.ts';
import { isPlainRecord } from './mergeStored.ts';
import { persistBucket } from './persistBucket.ts';
import { readStorageText } from './storageEntry.ts';

/**
 * Keep a tree of signals in `localStorage`, under one versioned key.
 *
 * A bucket is a plain object whose leaves are writable signals, grouped in
 * plain objects as deeply as needed. The whole tree is stored as one JSON
 * mirror of itself, so the stability contract is the property names, never a
 * key per signal. On the way in, the stored payload is merged over the bucket
 * as it was declared ({@link persistBucket}), so a leaf added since the last
 * save keeps its default and a stored value of the wrong shape is discarded.
 * On the way out, `effect` re-runs whenever a leaf changes and the whole tree
 * is written again; its first run only subscribes, so opening a page never
 * writes the defaults back.
 *
 * The leaves are recognised by their shape (`value`, `peek` and `subscribe`),
 * so any `@preact/signals` flavour works, and `effect` is the page's own, so
 * the tracking is always done by the copy of the library that made the
 * signals. A member that is neither a signal nor a plain object is ignored.
 * Never put a `computed()` in a bucket: it cannot be written back.
 *
 * With `syncAcrossTabs`, every tab follows the entry: a tab opened before
 * another one stored its work would otherwise write its stale copy over it. A
 * write that would store what is already there is skipped, so two tabs cannot
 * echo each other, and nothing is written while another tab's copy is being
 * taken on.
 * @param options - See {@link PersistSignalBucketOptions}.
 * @returns The same bucket, rehydrated, so it can be exported directly.
 */
export function persistSignalBucket<TBucket extends object>(
  options: PersistSignalBucketOptions<TBucket>,
): TBucket {
  const { key, version, bucket, effect, onQuotaExceeded } = options;
  const { legacyKeys, forgetLegacyKeys, syncAcrossTabs = false } = options;
  const stored = persistBucket({
    key,
    version,
    defaults: snapshotBucket(bucket),
    onQuotaExceeded,
    legacyKeys,
    forgetLegacyKeys,
  });

  const { value, firstRun } = stored.read();
  if (!firstRun) hydrateBucket(bucket, value);

  let subscribed = false;
  let adopting = false;
  effect(() => {
    const snapshot = snapshotBucket(bucket);
    if (!subscribed) {
      subscribed = true;
      return;
    }
    if (adopting) return;
    if (
      syncAcrossTabs !== false &&
      readStorageText(stored.storageKey) === JSON.stringify(snapshot)
    ) {
      return;
    }
    stored.write(snapshot);
  });

  if (syncAcrossTabs !== false) {
    stored.subscribe((read) => {
      if (typeof syncAcrossTabs === 'function' && !syncAcrossTabs(bucket)) {
        return;
      }
      adopting = true;
      try {
        hydrateBucket(bucket, read.value);
      } finally {
        adopting = false;
      }
    });
  }

  return bucket;
}

/**
 * Runs a callback now and again whenever a signal it read changes, as
 * `effect` from `@preact/signals-react` does.
 */
export type SignalEffect = (callback: () => void) => unknown;

/** What {@link persistSignalBucket} is given. */
export interface PersistSignalBucketOptions<TBucket extends object> {
  /**
   * Name of the bucket, namespaced by the site and without its version, e.g.
   * `vcl:preferences`.
   */
  key: string;
  /**
   * Schema version, appended to the key as `:v<version>`. Raise it when a new
   * shape cannot be reconciled with the old one field by field.
   * @default 1
   */
  version?: number;
  /** The tree of signals, rehydrated in place and followed from then on. */
  bucket: TBucket;
  /** The page's own `effect`, imported from its signals package. */
  effect: SignalEffect;
  /**
   * Called when a write was refused because the store is full.
   * @default undefined
   */
  onQuotaExceeded?: (error: unknown) => void;
  /**
   * The entries the bucket was kept under before this key, the preferred one
   * first; see `persistBucket`.
   * @default []
   */
  legacyKeys?: readonly LegacyStorageKey[];
  /**
   * Remove every legacy entry found once it has been read.
   * @default false
   */
  forgetLegacyKeys?: boolean;
  /**
   * Take on what another tab stores, and skip a write that would store what is
   * already there. A function decides each time, handed the bucket as this tab
   * holds it: a bucket of work in progress keeps its own while it has some,
   * rather than two tabs overwriting each other in turn.
   * @default false
   */
  syncAcrossTabs?: boolean | ((bucket: TBucket) => boolean);
}

interface SignalLeaf {
  value: unknown;
}

function snapshotBucket(node: object): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  for (const [name, member] of Object.entries(node)) {
    if (isSignalLeaf(member)) {
      snapshot[name] = member.value;
    } else if (isPlainRecord(member)) {
      snapshot[name] = snapshotBucket(member);
    }
  }
  return snapshot;
}

function hydrateBucket(node: object, stored: Record<string, unknown>): void {
  for (const [name, member] of Object.entries(node)) {
    const value = stored[name];
    if (value === undefined) continue;
    if (isSignalLeaf(member)) {
      member.value = value;
    } else if (isPlainRecord(member) && isPlainRecord(value)) {
      hydrateBucket(member, value);
    }
  }
}

function isSignalLeaf(member: unknown): member is SignalLeaf {
  if (typeof member !== 'object' || member === null) return false;
  const candidate = member as { peek?: unknown; subscribe?: unknown };
  return (
    'value' in member &&
    typeof candidate.peek === 'function' &&
    typeof candidate.subscribe === 'function'
  );
}
