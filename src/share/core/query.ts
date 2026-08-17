/** One `key=value` pair of a query string, already decoded. */
export type QueryEntry = readonly [key: string, value: string];

/**
 * Read a query string into its pairs, in the order it wrote them.
 *
 * A `+` is a plus, not a space: a link carries structures such as
 * `CC[N+](C)(C)C`, and the form-urlencoded reading of `+` would turn one into
 * a different molecule without anything failing. A malformed escape is kept as
 * written rather than throwing, so a link somebody retyped still opens.
 * @param search - The query string, with or without its leading `?`, and without a fragment.
 * @returns The pairs, decoded.
 */
export function parseQuery(search: string): QueryEntry[] {
  const text = search.startsWith('?') ? search.slice(1) : search;
  const entries: QueryEntry[] = [];
  if (text === '') return entries;
  for (const chunk of text.split('&')) {
    if (chunk === '') continue;
    const separator = chunk.indexOf('=');
    const key = separator === -1 ? chunk : chunk.slice(0, separator);
    const value = separator === -1 ? '' : chunk.slice(separator + 1);
    entries.push([decodeComponent(key), decodeComponent(value)]);
  }
  return entries;
}

/**
 * Write pairs back into a query string, keeping the two characters a reader
 * of these links cares about legible: a comma stays a comma rather than
 * `%2C`, and a plus stays a plus rather than `%2B`. Both parse back
 * identically through {@link parseQuery}.
 * @param entries - The pairs to write, in the order they should appear.
 * @returns The query string, without its leading `?`.
 */
export function serializeQuery(entries: readonly QueryEntry[]): string {
  const chunks: string[] = [];
  for (const [key, value] of entries) {
    chunks.push(`${encodeComponent(key)}=${encodeComponent(value)}`);
  }
  return chunks.join('&');
}

/**
 * The first value each key carries, which is what a link means when it names
 * the same parameter twice.
 * @param entries - The pairs of a query string.
 * @returns One value per key.
 */
export function firstValues(
  entries: readonly QueryEntry[],
): ReadonlyMap<string, string> {
  const values = new Map<string, string>();
  for (const [key, value] of entries) {
    if (!values.has(key)) values.set(key, value);
  }
  return values;
}

function decodeComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function encodeComponent(value: string): string {
  return encodeURIComponent(value)
    .replaceAll('%2C', ',')
    .replaceAll('%2B', '+');
}
