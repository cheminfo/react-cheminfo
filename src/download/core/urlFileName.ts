/**
 * The name of the file at an address: the last segment of its path, decoded,
 * which is what a browser saves it under and what a sentence calls it. A
 * relative address is read against any base, and the query and the fragment
 * are no part of the name.
 * @param address - The address, absolute or relative.
 * @param fallback - Name used when the path has no segment.
 * @returns The name, `%20` read as a space; a malformed escape kept as written.
 */
export function urlFileName(address: string | URL, fallback = ''): string {
  const { pathname } = new URL(address, ANY_BASE);
  const last = pathname.split('/').findLast((part) => part !== '') ?? '';
  if (last === '') return fallback;
  try {
    return decodeURIComponent(last);
  } catch (error) {
    if (error instanceof URIError) return last;
    throw error;
  }
}

/** A base every relative address resolves against; its own path never shows. */
const ANY_BASE = 'https://host.invalid/';
