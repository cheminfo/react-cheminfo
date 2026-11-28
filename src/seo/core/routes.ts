/**
 * The addresses a site answers, each with the name and the sentence it is
 * indexed under.
 *
 * One table per site, read by three things: the build, which writes an HTML
 * file per entry and the sitemap listing them; the head injector; and the
 * running app, which retitles the tab after an in-app move. A page missing from
 * the table is a page a search engine only ever sees as the home page.
 */

import {
  addressPath,
  safeDecode,
  trimTrailingSlash,
} from '../../router/core/address.ts';
import { stripBasePath } from '../../router/core/basePath.ts';

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
   * Whether a search engine is meant to list the page.
   *
   * A maintenance screen — a curation queue, an import run, an admin table — is
   * a real address a signed-in person opens, so it belongs in the table the
   * router and the tab title read. It is not a result anybody wants: it says
   * nothing a visitor searched for, and a chemist who lands on it has been sent
   * to the wrong place. Such a route is left out of the sitemap and the page
   * answers `noindex`, which is how a page is kept out of the index — never a
   * `Disallow`, which only stops the crawl and still lets the address be listed
   * from a link somewhere else.
   * @default true
   */
  indexed?: boolean;
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
 * is a molecule rather than whatever `/` answers. Segments are compared
 * decoded, so `/exercises/caf%C3%A9` is the route written `/exercises/café`.
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
  const path = addressPath(url);
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
 * The route of a tab: the entry of the table whose `tab` it is.
 * @param routes - The site's route table, each entry naming its tab.
 * @param tab - The tab asked about.
 * @param fallback - The route a tab the table does not hold falls back to.
 * @returns The route, or the fallback, or the table's first entry.
 * @throws {Error} When the table is empty and no fallback is given.
 */
export function routeOfTab<R extends { tab: string }>(
  routes: readonly R[],
  tab: R['tab'],
  fallback?: R,
): R {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i] as R;
    if (route.tab === tab) return route;
  }
  const first = fallback ?? routes[0];
  if (first === undefined) throw new Error('a site answers at least one route');
  return first;
}

// The one shape two paths are compared in: no trailing slash, and each segment
// decoded, so a browser's `caf%C3%A9` names the table's `café`. A segment whose
// escapes decode to a `/` stays escaped: `/a%2Fb` is one segment, not `/a/b`.
function comparable(path: string): string {
  const trimmed = trimTrailingSlash(path) || '/';
  if (!trimmed.includes('%')) return trimmed;
  const segments = trimmed.split('/');
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index] ?? '';
    const decoded = safeDecode(segment);
    segments[index] = decoded.includes('/') ? segment : decoded;
  }
  return segments.join('/');
}

function exactRoute(
  routes: readonly RouteMeta[],
  path: string,
): RouteMeta | undefined {
  const wanted = comparable(path);
  for (const route of routes) {
    if (comparable(route.path) === wanted) return route;
  }
  return undefined;
}

function prefixRoute(
  routes: readonly RouteMeta[],
  path: string,
): RouteMeta | undefined {
  const wanted = comparable(path);
  let claimed: RouteMeta | undefined;
  let claimedLength = -1;

  for (const route of routes) {
    if (route.prefix !== true) continue;
    const routePath = comparable(route.path);
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
