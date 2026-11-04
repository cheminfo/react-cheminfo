import { isPlainRecord, mergeStored } from './mergeStored.ts';

/**
 * The values of a tree of signals, as one plain object mirroring the tree.
 *
 * A bucket is a plain object whose leaves are writable signals, grouped in
 * plain objects as deeply as needed. A leaf is recognised by its shape
 * (`value`, `peek` and `subscribe`), so any `@preact/signals` flavour works; a
 * member that is neither a signal nor a plain object is left out. Reading every
 * `value` subscribes an effect running this to every leaf.
 * @param bucket - The tree of signals.
 * @returns Its values, keyed as the tree is.
 */
export function snapshotSignalBucket(bucket: object): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  for (const [name, member] of Object.entries(bucket)) {
    if (isSignalLeaf(member)) {
      snapshot[name] = member.value;
    } else if (isPlainRecord(member)) {
      snapshot[name] = snapshotSignalBucket(member);
    }
  }
  return snapshot;
}

/**
 * Write values into a tree of signals. A leaf the values do not name keeps
 * what it holds, and a name no leaf carries is ignored.
 * @param bucket - The tree of signals.
 * @param values - Its values, keyed as the tree is.
 */
export function hydrateSignalBucket(
  bucket: object,
  values: Record<string, unknown>,
): void {
  for (const [name, member] of Object.entries(bucket)) {
    const value = values[name];
    if (value === undefined) continue;
    if (isSignalLeaf(member)) {
      member.value = value;
    } else if (isPlainRecord(member) && isPlainRecord(value)) {
      hydrateSignalBucket(member, value);
    }
  }
}

/**
 * Fit values read back from anywhere — storage, a file — to a tree of signals:
 * every leaf of the tree, and nothing else, each merged over its fallback the
 * way {@link mergeStored} merges, so a missing or misshapen value falls back.
 * @param bucket - The tree whose leaves name what is kept.
 * @param values - What was read, trusted for nothing.
 * @param fallbacks - What each leaf falls back to, keyed as the tree is.
 * @default what the leaves hold now
 * @returns A value for every leaf, keyed as the tree is.
 */
export function fitSignalBucket(
  bucket: object,
  values: unknown,
  fallbacks: Record<string, unknown> = snapshotSignalBucket(bucket),
): Record<string, unknown> {
  const source = isPlainRecord(values) ? values : {};
  const fitted: Record<string, unknown> = {};
  for (const [name, member] of Object.entries(bucket)) {
    if (isSignalLeaf(member)) {
      fitted[name] = mergeStored(
        { value: fallbacks[name] },
        { value: source[name] },
      ).value;
    } else if (isPlainRecord(member)) {
      const nested = fallbacks[name];
      fitted[name] = fitSignalBucket(
        member,
        source[name],
        isPlainRecord(nested) ? nested : snapshotSignalBucket(member),
      );
    }
  }
  return fitted;
}

/** A writable signal, as a bucket holds it. */
interface SignalLeaf {
  value: unknown;
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
