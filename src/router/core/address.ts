/** An address cut into the three parts a router reads separately. */
interface AddressParts {
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
 * Drop the trailing slashes, so `/about/` and `/about` are one page and an
 * origin written `https://host/surge//` composes one address rather than one
 * with an empty segment in it.
 * @param value - A path or an origin.
 * @returns It, without the trailing slashes `/` itself keeps.
 */
export function trimTrailingSlash(value: string): string {
  const trimmed = value.replace(TRAILING_SLASHES, '');
  return trimmed === '' && value !== '' ? '/' : trimmed;
}

/**
 * An address cut at its first `?` or `#`, for a lookup or a canonical link that
 * must not depend on the configuration a link carries.
 * @param address - A path or an absolute address.
 * @returns Everything before the query string and the fragment.
 */
export function withoutQueryOrFragment(address: string): string {
  const cut = address.search(QUERY_OR_FRAGMENT);
  return cut === -1 ? address : address.slice(0, cut);
}

/**
 * The path half of whatever a caller has at hand: an absolute address, or a
 * path already, with the query string and the fragment cut off either way.
 * @param url - An absolute address (`https://host/path?x`) or a path.
 * @returns The path.
 */
export function addressPath(url: string): string {
  if (ABSOLUTE_URL.test(url) && URL.canParse(url)) return new URL(url).pathname;
  return withoutQueryOrFragment(url);
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

const TRAILING_SLASHES = /\/+$/;

const QUERY_OR_FRAGMENT = /[?#]/;

// A scheme and an authority: what `location.href` hands out, and the one shape
// that cannot be confused with a path. `//host/path` is left as a path, because
// a route table is free to name one.
const ABSOLUTE_URL = /^[a-z][\d+.a-z-]*:\/\//i;
