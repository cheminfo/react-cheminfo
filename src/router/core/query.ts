import { safeDecode } from './address.ts';

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
 * Read a query string.
 *
 * Forgiving by design, because the address is hand-editable and arrives from
 * bookmarks, course pages and lecture slides: a repeated key keeps its last
 * value, a key carrying nothing is kept as an empty value so a bare `?embed`
 * reads as present, and an escape that does not decode is taken literally.
 * @param search - The query string, with or without its leading `?`.
 * @param options - How the values are decoded.
 * @returns One entry per key, decoded.
 */
export function parseQueryString(
  search: string,
  options: QueryStringOptions = {},
): Record<string, string> {
  const literalPlus = options.literalPlus ?? true;
  const query: Record<string, string> = {};
  const text = search.startsWith('?') ? search.slice(1) : search;
  for (const part of text.split('&')) {
    if (part === '') continue;
    const index = part.indexOf('=');
    const rawKey = index === -1 ? part : part.slice(0, index);
    const rawValue = index === -1 ? '' : part.slice(index + 1);
    const key = decodeValue(rawKey, literalPlus);
    if (key === '') continue;
    query[key] = decodeValue(rawValue, literalPlus);
  }
  return query;
}

/**
 * Write a query string.
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
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (key === '' || value === undefined || value === null) continue;
    if (value === '') {
      if (keepEmptyValues) parts.push(encodeValue(key));
      continue;
    }
    parts.push(`${encodeValue(key)}=${encodeValue(value)}`);
  }
  return parts.join('&');
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
