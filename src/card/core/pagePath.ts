/**
 * The address of a page with its parameters, as a tool server writes the link
 * of an answer and the page reads it back.
 */

import { formatQueryString } from '../../router/core/query.ts';

/**
 * A page and its parameters: the query written by `formatQueryString`, so a
 * `+` is escaped, a comma kept, and a parameter left `undefined`, `null` or
 * empty is not written. No `?` is written when nothing is.
 *
 *   pagePath('/formats', { q: 'gaussian input', direction: undefined });
 *   // '/formats?q=gaussian%20input'
 * @param path - The page, e.g. `/browse`, without a query of its own.
 * @param params - Its parameters, in the order they are written.
 * @returns The page with its query.
 */
export function pagePath(
  path: string,
  params: Readonly<Record<string, string | undefined | null>>,
): string {
  return withQuery(path, formatQueryString(params));
}

/**
 * An address with a query string appended, the address unchanged when the
 * query is empty.
 * @param address - A path or an absolute address, without a query of its own.
 * @param query - The query, without its leading `?`.
 * @returns The address with its query.
 */
export function withQuery(address: string, query: string): string {
  return query === '' ? address : `${address}?${query}`;
}
