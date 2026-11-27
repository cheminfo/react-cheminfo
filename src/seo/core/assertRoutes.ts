/**
 * The check a route table passes before a build reads it as a set of file
 * names.
 */

import {
  trimTrailingSlash,
  withoutQueryOrFragment,
} from '../../router/core/address.ts';

import type { RouteMeta } from './routes.ts';

/**
 * Check a route table before a build reads it as a set of file names.
 *
 * An address written twice ships two sitemap entries and two links to a page
 * only the first entry describes, and one carrying a `..` segment writes its
 * file outside the build output. Two addresses that differ only in an empty
 * segment or in case are the same defect wearing a disguise: `//x` and `/x`
 * both write `dist/x.html`, and so do `/About` and `/about` on the
 * case-insensitive filesystem macOS and Windows ship by default — one file, two
 * sitemap entries, and only one of the two descriptions survives. All of it is
 * author configuration read at build time, so it is refused where it is written
 * rather than repaired where it lands.
 * @param routes - Every address the site answers.
 * @throws {Error} When the table is empty, names one address twice — under any
 * of those spellings — or carries a path that is not one.
 */
export function assertRoutes(routes: readonly RouteMeta[]): void {
  if (routes.length === 0) throw new Error('a site answers at least one route');

  const claimed = new Set<string>();
  const folded = new Map<string, string>();
  for (const route of routes) {
    const written = JSON.stringify(route.path);
    assertPath(route.path, written);
    const address = trimTrailingSlash(route.path) || '/';
    if (address.includes('//')) {
      throw new Error(`a route path names no empty segment: ${written}`);
    }
    if (claimed.has(address)) {
      throw new Error(`a route path is written once: ${written}`);
    }
    const first = folded.get(address.toLowerCase());
    if (first !== undefined) {
      throw new Error(
        `two route paths name one file on a case-insensitive disk: ${first} and ${written}`,
      );
    }
    claimed.add(address);
    folded.set(address.toLowerCase(), written);
  }
}

function assertPath(path: string, written: string): void {
  if (!path.startsWith('/')) {
    throw new Error(`a route path starts at the site root: ${written}`);
  }
  if (withoutQueryOrFragment(path) !== path) {
    throw new Error(
      `a route path carries no query string and no fragment: ${written}`,
    );
  }
  if (path.split('/').includes('..')) {
    throw new Error(`a route path stays inside the site: ${written}`);
  }
}
