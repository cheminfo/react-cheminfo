/**
 * A key no row is using yet.
 *
 * A row of the settings — a zone, a matrix step, a range — carries no identity
 * of its own, so one is kept beside the list. Without it React reuses a removed
 * row's box for the row that slides up, and the half-typed number in it goes
 * with the wrong entry.
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

/**
 * A list with one entry moved to another position.
 * @param list - What to reorder.
 * @param index - Which entry to move.
 * @param target - Where it lands.
 * @returns A new list.
 */
export function reorder<T>(
  list: readonly T[],
  index: number,
  target: number,
): T[] {
  const moved = [...list];
  const [entry] = moved.splice(index, 1);
  if (entry !== undefined) moved.splice(target, 0, entry);
  return moved;
}
