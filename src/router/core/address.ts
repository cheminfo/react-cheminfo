/** An address cut into the three parts a router reads separately. */
export interface AddressParts {
  /** Path of the address, `/` when it carries none. */
  path: string;
  /** Query string, without its leading `?`. */
  search: string;
  /** Fragment, without its leading `#`. */
  fragment: string;
}

/**
 * Cut an address into its path, its query and its fragment.
 *
 * The fragment is taken first, so a `?` inside it — an old hash link of the
 * shape `#/tutorial/3?step=2` — stays part of the fragment rather than being
 * read as the query of the page.
 * @param address - A path, a full address, or a bare query string.
 * @returns The three parts, each without its separator.
 */
export function splitAddress(address: string): AddressParts {
  const hashIndex = address.indexOf('#');
  const beforeHash = hashIndex === -1 ? address : address.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : address.slice(hashIndex + 1);
  const queryIndex = beforeHash.indexOf('?');
  if (queryIndex === -1) {
    return { path: beforeHash === '' ? '/' : beforeHash, search: '', fragment };
  }
  const path = beforeHash.slice(0, queryIndex);
  return {
    path: path === '' ? '/' : path,
    search: beforeHash.slice(queryIndex + 1),
    fragment,
  };
}

/**
 * The decoded, non-empty segments of a path.
 * @param path - Path of an address, with or without its leading slash.
 * @returns One entry per segment, `[]` for the root.
 */
export function splitPath(path: string): string[] {
  const segments: string[] = [];
  for (const raw of path.split('/')) {
    if (raw !== '') segments.push(safeDecode(raw));
  }
  return segments;
}

/**
 * A path in the one shape the lookups compare: a leading slash, no trailing
 * one, its segments decoded, and neither query nor fragment.
 * @param path - Path of an address.
 * @returns The same address, normalized.
 */
export function normalizePath(path: string): string {
  const segments = splitPath(splitAddress(path).path);
  return segments.length === 0 ? '/' : `/${segments.join('/')}`;
}

/**
 * Decode one component of an address, tolerating an escape that is not one.
 *
 * `decodeURIComponent` throws on a lone `%`, and an address is hand-editable:
 * the raw text is closer to what its author meant than an error page.
 * @param value - Raw, percent-encoded text.
 * @returns The decoded text, or the raw text when it does not decode.
 */
export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
