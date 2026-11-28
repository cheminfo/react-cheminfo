/**
 * One parameter of a query string written, replaced or taken out, every other
 * one kept as it was — a bare switch such as `?embed` included, which is what
 * keeps a framed page framed. Written through the family's own query codec, so
 * a `+` stays a plus.
 */

import type { QueryEntry } from './query.ts';
import { formatQueryEntries, parseQueryEntries } from './query.ts';

/** How {@link withQueryValue} writes the query string back. */
export interface WithQueryValueOptions {
  /**
   * Whether the string written starts with its `?` when it carries anything.
   * @default true
   */
  prefix?: boolean;
}

/**
 * A query string with one parameter written last, or taken out.
 * @param search - The query string, with or without its leading `?`.
 * @param key - The parameter.
 * @param value - What it carries, or `null` to take it out altogether.
 * @param options - Whether the `?` is written.
 * @returns The query string, empty when it carries nothing.
 */
export function withQueryValue(
  search: string,
  key: string,
  value: string | null,
  options: WithQueryValueOptions = {},
): string {
  const { prefix = true } = options;
  const entries = parseQueryEntries(search).filter(([name]) => name !== key);
  if (value !== null) entries.push([key, value]);
  const written = formatQueryEntries(entries);
  return prefix && written !== '' ? `?${written}` : written;
}

/**
 * Write values into a query string in place, leaving every other parameter —
 * and the order they were written in — alone. A value of `null` or
 * `undefined` takes its parameter out rather than writing an empty one, and a
 * parameter the string names twice is replaced once and its repeat dropped.
 * @param search - The query string, with or without its leading `?`.
 * @param patch - The parameters to set or take out.
 * @returns The query string, without its leading `?`.
 */
export function setSearchParams(
  search: string,
  patch: Readonly<Record<string, string | null | undefined>>,
): string {
  const written = new Set<string>();
  const entries: QueryEntry[] = [];
  for (const [key, value] of parseQueryEntries(search)) {
    if (!Object.hasOwn(patch, key)) {
      entries.push([key, value]);
      continue;
    }
    if (written.has(key)) continue;
    written.add(key);
    const next = patch[key];
    if (next !== null && next !== undefined) entries.push([key, next]);
  }
  for (const key in patch) {
    const next = patch[key];
    if (written.has(key) || next === null || next === undefined) continue;
    entries.push([key, next]);
  }
  return formatQueryEntries(entries);
}
