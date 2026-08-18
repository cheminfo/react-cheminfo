/**
 * The addresses a site answers, each with the name and the sentence it is
 * indexed under.
 *
 * One table per site, read by three things: the build, which writes an HTML
 * file per entry and the sitemap listing them; the head injector; and the
 * running app, which retitles the tab after an in-app move. A page missing from
 * the table is a page a search engine only ever sees as the home page.
 */

import { stripBasePath } from '../../router/core/basePath.ts';

const QUERY_OR_FRAGMENT = /[?#]/;

const TRAILING_SLASHES = /\/+$/;

// A scheme and an authority: what `location.href` hands out, and the one shape
// that cannot be confused with a path. `//host/path` is left as a path, because
// a route table is free to name one.
const ABSOLUTE_URL = /^[a-z][\d+.a-z-]*:\/\//i;

/** A page, as a crawler and a shared card see it. */
export interface RouteMeta {
  /** Absolute path, without a trailing slash and without a query string. */
  path: string;
  /** Under ~60 characters: the site name is appended to it. */
  title: string;
  /** One sentence, in the words someone would search for. */
  description: string;
  /**
   * The label the page is linked under where a title written for a search
   * result is too long to read as a menu entry — the `noscript` index.
   * @default the route's own title
   */
  short?: string;
  /**
   * What the page is for, written after an em dash next to its link in the
   * `noscript` index.
   * @default undefined — the link stands on its own
   */
  note?: string;
  /**
   * Whether the route also answers every address beneath it, so a section
   * carrying more pages than a table can hold — an entry per structure, per
   * ligand, per identifier — is indexed under the section rather than under the
   * home page. Those addresses are canonical to the section itself.
   * @default false
   */
  prefix?: boolean;
}

/**
 * The route an address names.
 *
 * An address a route claims exactly always wins over one that claims it as a
 * subtree, and between two subtrees the longer claim wins, so `/molecules/HEM`
 * is a molecule rather than whatever `/` answers.
 * @param routes - Every address the site answers.
 * @param path - Absolute path, without a query string.
 * @returns Its entry, or `undefined` when the site does not know the address.
 */
export function routeFor(
  routes: readonly RouteMeta[],
  path: string,
): RouteMeta | undefined {
  return exactRoute(routes, path) ?? prefixRoute(routes, path);
}

/**
 * The page an address opens.
 *
 * An address the site does not know is described as the home page rather than
 * invented on the fly, which is what the router does with it too. The query
 * string never reaches the answer: the structure being drawn and the
 * configuration a shared link carries are not pages of their own. An absolute
 * address is read for its path, so an app handing over `location.href` after an
 * in-app move is answered rather than silently described as the home page.
 *
 * The route table is written from the site's own root, and a server behind a
 * mount is handed the address the browser asked for — `/surge/exercises` for a
 * table that names `/exercises`. So the address is read at the site's own root
 * first, and the four lookups run in this order:
 *
 * 1. the mount taken off, claimed exactly;
 * 2. the address as written, claimed exactly;
 * 3. the mount taken off, claimed as a subtree;
 * 4. the address as written, claimed as a subtree.
 *
 * Exact before subtree, or a `prefix` route — a home page answering everything
 * beneath it above all — would claim every mounted address and the mount would
 * never come off. Stripped before as-written, or the mount itself would open
 * whichever page happens to carry the mount's own name rather than the site's
 * front page. Taking the address as written second is what leaves an unmounted
 * caller answering exactly as before, and lets a table whose own paths start
 * with the mount's name still be read.
 * @param routes - Every address the site answers.
 * @param url - The address, query string and fragment included, either as a
 * path or as an absolute `scheme://host/path` address.
 * @param basePath - The path the site is mounted at, when the address carries
 * it, written `surge`, `/surge` or `/surge/`.
 * @default '' — the address is already written from the site's own root
 * @returns The route it is indexed as.
 * @throws {Error} When the table is empty, so there is no page to fall back to.
 */
export function pageMetaFor(
  routes: readonly RouteMeta[],
  url: string,
  basePath = '',
): RouteMeta {
  const home = homeRoute(routes);
  const path = pathOf(url);
  const own = stripBasePath(basePath, path);
  return (
    exactRoute(routes, own) ??
    exactRoute(routes, path) ??
    prefixRoute(routes, own) ??
    prefixRoute(routes, path) ??
    home
  );
}

/**
 * The page an unknown address falls back to.
 * @param routes - Every address the site answers.
 * @returns The `/` entry, or the first one when the table names no root.
 * @throws {Error} When the table is empty.
 */
export function homeRoute(routes: readonly RouteMeta[]): RouteMeta {
  const first = routes[0];
  if (first === undefined) throw new Error('a site answers at least one route');
  return exactRoute(routes, '/') ?? first;
}

/**
 * Check a route table before a build reads it as a set of file names.
 *
 * An address written twice ships two sitemap entries and two links to a page
 * only the first entry describes, and one carrying a `..` segment writes its
 * file outside the build output — a real build asked for `/../escaped` and got
 * a sibling of `dist`. Two addresses that differ only in an empty segment or in
 * case are the same defect wearing a disguise: `//x` and `/x` both write
 * `dist/x/index.html`, and so do `/About` and `/about` on the case-insensitive
 * filesystem macOS and Windows ship by default — one file, two sitemap entries,
 * and only one of the two descriptions survives. All of it is author
 * configuration read at build time, so it is refused where it is written rather
 * than repaired where it lands.
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

function assertPath(path: string, written: string): void {
  if (!path.startsWith('/')) {
    throw new Error(`a route path starts at the site root: ${written}`);
  }
  if (QUERY_OR_FRAGMENT.test(path)) {
    throw new Error(
      `a route path carries no query string and no fragment: ${written}`,
    );
  }
  if (path.split('/').includes('..')) {
    throw new Error(`a route path stays inside the site: ${written}`);
  }
}

// The path half of whatever the caller had at hand: an absolute address, or a
// path already, with the query string and the fragment cut off either way.
function pathOf(url: string): string {
  if (ABSOLUTE_URL.test(url) && URL.canParse(url)) return new URL(url).pathname;
  const cut = url.search(QUERY_OR_FRAGMENT);
  return cut === -1 ? url : url.slice(0, cut);
}

function exactRoute(
  routes: readonly RouteMeta[],
  path: string,
): RouteMeta | undefined {
  const wanted = trimTrailingSlash(path) || '/';
  for (const route of routes) {
    if ((trimTrailingSlash(route.path) || '/') === wanted) return route;
  }
  return undefined;
}

function prefixRoute(
  routes: readonly RouteMeta[],
  path: string,
): RouteMeta | undefined {
  const wanted = trimTrailingSlash(path) || '/';
  let claimed: RouteMeta | undefined;
  let claimedLength = -1;

  for (const route of routes) {
    if (route.prefix !== true) continue;
    const routePath = trimTrailingSlash(route.path) || '/';
    if (!isUnder(routePath, wanted)) continue;
    if (routePath.length > claimedLength) {
      claimed = route;
      claimedLength = routePath.length;
    }
  }
  return claimed;
}

function isUnder(routePath: string, path: string): boolean {
  // `/surgeon` is not a page of `/surge`, so a claim only holds when what
  // follows it is a path of its own.
  return routePath === '/' || path.startsWith(`${routePath}/`);
}
