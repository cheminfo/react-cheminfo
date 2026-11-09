/**
 * The checks every value read from a file goes through before it is trusted.
 */

/**
 * The items of an array that parse, the others dropped.
 * @param value - What should be an array.
 * @param parse - The parser of one item.
 * @returns The parsed items.
 */
export function arrayOf<T>(
  value: unknown,
  parse: (item: unknown) => T | undefined,
): T[] {
  const items: T[] = [];
  if (!Array.isArray(value)) return items;
  for (const item of value) {
    const parsed = parse(item);
    if (parsed) items.push(parsed);
  }
  return items;
}

/**
 * Whether a value is a plain object.
 * @param value - Anything.
 * @returns True for an object that is not an array.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Whether a value is a finite number.
 * @param value - Anything.
 * @returns True for a number that is neither infinite nor NaN.
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
