import { useState } from 'react';

import { reorder } from '../core/filterChain.ts';

/** The keys of a list of rows, and the edits that keep them in step with it. */
interface RowKeys {
  /** One key per row, in the order the rows are drawn. */
  keys: readonly number[];
  /** Call when a row is added at the end of the list. */
  append: () => void;
  /** Call when a row is inserted just after the one at `index`. */
  insertAfter: (index: number) => void;
  /** Call when the row at `index` is removed. */
  removeAt: (index: number) => void;
  /** Call when the row at `index` moves to `target`. */
  move: (index: number, target: number) => void;
}

/**
 * A key for every row of a list whose entries carry no identity of their own.
 *
 * A row of the settings — a zone, a matrix step, a range — carries no identity
 * of its own, so one is kept beside the list. Without it React reuses a removed
 * row's box for the row that slides up, and the half-typed number in it goes
 * with the wrong entry. Call the matching edit together with every change the
 * list makes itself; a change from elsewhere — a preset, a reset — is caught up
 * with on the next render by trimming or extending the keys.
 * @param length - How many rows the list has now.
 * @returns The keys and their edits. See {@link RowKeys}.
 */
export function useRowKeys(length: number): RowKeys {
  const [keys, setKeys] = useState<readonly number[]>(() =>
    fitKeys([], length),
  );
  const current = keys.length === length ? keys : fitKeys(keys, length);
  if (current !== keys) setKeys(current);

  return {
    keys: current,
    append: () => {
      setKeys([...current, nextKey(current)]);
    },
    insertAfter: (index) => {
      setKeys(current.toSpliced(index + 1, 0, nextKey(current)));
    },
    removeAt: (index) => {
      setKeys(current.toSpliced(index, 1));
    },
    move: (index, target) => {
      setKeys(reorder(current, index, target));
    },
  };
}

/**
 * A key no row is using yet.
 * @param keys - The keys in force.
 * @returns The next free one.
 */
export function nextKey(keys: readonly number[]): number {
  let highest = -1;
  for (const key of keys) {
    if (key > highest) highest = key;
  }
  return highest + 1;
}

/**
 * The keys brought back in step with a list that changed from outside.
 * @param keys - The keys in force.
 * @param length - How many rows there now are.
 * @returns One key per row.
 */
export function fitKeys(keys: readonly number[], length: number): number[] {
  const fitted = keys.slice(0, length);
  while (fitted.length < length) fitted.push(nextKey(fitted));
  return fitted;
}
