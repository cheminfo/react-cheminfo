/**
 * Merge what came out of storage over the defaults it was stored against.
 *
 * A field the defaults name and the payload does not keeps its default, so a
 * field added after the last save lands as its default rather than as
 * `undefined`. A field whose stored value no longer has the shape of its
 * default — a number where a string is expected, an object where an array is —
 * is discarded, because a payload written by an older version of a page must
 * never reach the interface as the wrong type. A key the defaults do not name
 * is kept, so a bucket whose default is an empty dictionary keeps everything
 * that was ever put in it.
 *
 * The result shares no object and no array with `defaults`, so a caller may
 * write into it.
 * @param defaults - What every missing or unusable field falls back to.
 * @param stored - Whatever `JSON.parse` gave back, trusted for nothing.
 * @returns The defaults, with whatever was stored and is usable on top.
 */
export function mergeStored<T extends object>(defaults: T, stored: unknown): T {
  const source = isPlainRecord(stored) ? stored : {};
  return mergeRecord(defaults as Record<string, unknown>, source) as T;
}

/**
 * Whether a value is a plain object — the shape the JSON payload of a bucket
 * takes — rather than an array, a primitive or null.
 * @param value - Value to inspect.
 * @returns True for a plain object.
 */
export function isPlainRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeRecord(
  defaults: Record<string, unknown>,
  stored: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(defaults)) {
    merged[name] = cloneValue(value);
  }
  for (const [name, value] of Object.entries(stored)) {
    if (value === undefined) continue;
    merged[name] = Object.hasOwn(defaults, name)
      ? mergeValue(defaults[name], value)
      : value;
  }
  return merged;
}

function mergeValue(defaultValue: unknown, storedValue: unknown): unknown {
  if (isPlainRecord(defaultValue) && isPlainRecord(storedValue)) {
    return mergeRecord(defaultValue, storedValue);
  }
  return hasSameShape(defaultValue, storedValue)
    ? storedValue
    : cloneValue(defaultValue);
}

// A default that is `null` or absent accepts anything, since it names no shape
// of its own.
function hasSameShape(defaultValue: unknown, storedValue: unknown): boolean {
  if (defaultValue === null || defaultValue === undefined) return true;
  if (storedValue === null) return false;
  if (Array.isArray(defaultValue) !== Array.isArray(storedValue)) return false;
  return typeof defaultValue === typeof storedValue;
}

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    const copy = new Array<unknown>(value.length);
    for (let index = 0; index < value.length; index++) {
      copy[index] = cloneValue(value[index]);
    }
    return copy;
  }
  if (isPlainRecord(value)) {
    const copy: Record<string, unknown> = {};
    for (const [name, item] of Object.entries(value)) {
      copy[name] = cloneValue(item);
    }
    return copy;
  }
  return value;
}
