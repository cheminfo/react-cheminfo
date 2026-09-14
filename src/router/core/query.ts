import { safeDecode } from './address.ts';

/** One `key=value` pair of a query string, already decoded. */
export type QueryEntry = readonly [key: string, value: string];

/** How a query string is read and written. */
export interface QueryStringOptions {
  /**
   * Keep a `+` in a value as the character it is, rather than reading it as
   * the space `URLSearchParams` decodes it to. A SMILES carries `+` for a
   * charged atom, and `CC[N+](C)(C)C` handed out in a link has to survive.
   * @default true
   */
  literalPlus?: boolean;
  /**
   * Write a parameter carrying nothing back as the bare key, so a hand-typed
   * flag such as `?embed` survives the round trip. Left off, an empty value is
   * dropped and an unconfigured link stays clean.
   * @default false
   */
  keepEmptyValues?: boolean;
}

/**
 * Read a query string into its pairs, in the order it wrote them.
 *
 * A bare key reads as a key carrying the empty string, so `?embed` is present.
 * An empty key is not a parameter and is skipped, and an escape that does not
 * decode is taken literally, because the address is hand-editable.
 * @param search - The query string, with or without its leading `?`, and without a fragment.
 * @param options - How the values are decoded.
 * @returns The pairs, decoded.
 */
export function parseQueryEntries(
  search: string,
  options: QueryStringOptions = {},
): QueryEntry[] {
  const literalPlus = options.literalPlus ?? true;
  const entries: QueryEntry[] = [];
  const text = search.startsWith('?') ? search.slice(1) : search;
  for (const part of text.split('&')) {
    if (part === '') continue;
    const index = part.indexOf('=');
    const rawKey = index === -1 ? part : part.slice(0, index);
    const rawValue = index === -1 ? '' : part.slice(index + 1);
    const key = decodeValue(rawKey, literalPlus);
    if (key === '') continue;
    entries.push([key, decodeValue(rawValue, literalPlus)]);
  }
  return entries;
}

/**
 * Write pairs back into a query string, in the order given.
 *
 * A pair carrying the empty string is written as its bare key, which reads back
 * as itself. A `+` is written `%2B`, because every other parser of the address
 * reads a bare one as a space.
 * @param entries - The pairs to write.
 * @returns The query string, without its leading `?`.
 */
export function formatQueryEntries(entries: readonly QueryEntry[]): string {
  const parts: string[] = [];
  for (const [key, value] of entries) {
    if (key === '') continue;
    const name = encodeValue(key);
    parts.push(value === '' ? name : `${name}=${encodeValue(value)}`);
  }
  return parts.join('&');
}

/**
 * The first value each key carries, which is what a link means when it names
 * the same parameter twice.
 * @param entries - The pairs of a query string.
 * @returns One value per key, in the order the keys first appear.
 */
export function firstQueryValues(
  entries: readonly QueryEntry[],
): Map<string, string> {
  const values = new Map<string, string>();
  for (const [key, value] of entries) {
    if (!values.has(key)) values.set(key, value);
  }
  return values;
}

/**
 * Read a query string into one value per key.
 *
 * Forgiving by design, because the address arrives from bookmarks, course pages
 * and lecture slides: a repeated key keeps its first value, a bare key such as
 * `?embed` reads as present, and an escape that does not decode is taken
 * literally.
 * @param search - The query string, with or without its leading `?`.
 * @param options - How the values are decoded.
 * @returns One entry per key, decoded.
 */
export function parseQueryString(
  search: string,
  options: QueryStringOptions = {},
): Record<string, string> {
  const query: Record<string, string> = {};
  const values = firstQueryValues(parseQueryEntries(search, options));
  for (const [key, value] of values) {
    query[key] = value;
  }
  return query;
}

/**
 * Write a query string from one value per key.
 *
 * A parameter left at nothing is dropped unless `keepEmptyValues` asks for it,
 * and `undefined` or `null` removes a parameter outright, so a page can hand
 * its whole state to this function and get back only what it actually carries.
 * @param params - The parameters, in the order they should be written.
 * @param options - How the values are encoded.
 * @returns The query string, without its leading `?`, empty when nothing is carried.
 */
export function formatQueryString(
  params: Readonly<Record<string, string | undefined | null>>,
  options: QueryStringOptions = {},
): string {
  const keepEmptyValues = options.keepEmptyValues ?? false;
  const entries: QueryEntry[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (value === '' && !keepEmptyValues) continue;
    entries.push([key, value]);
  }
  return formatQueryEntries(entries);
}

// A comma is legal in a query value and is what separates the keys of `hide`
// and the formulas of a list; escaped to `%2C` a link stops being one a teacher
// can read out loud.
function encodeValue(value: string): string {
  return encodeURIComponent(value).replaceAll('%2C', ',');
}

function decodeValue(value: string, literalPlus: boolean): string {
  return safeDecode(literalPlus ? value : value.replaceAll('+', ' '));
}
