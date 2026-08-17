/**
 * The addresses a site answers, each with the name and the sentence it is
 * indexed under.
 *
 * One table per site, read by three things: the build, which writes an HTML
 * file per entry and the sitemap listing them; the head injector; and the
 * running app, which retitles the tab after an in-app move. A page missing from
 * the table is a page a search engine only ever sees as the home page.
 */

/** A page, as a crawler and a shared card see it. */
export interface RouteMeta {
  /** Absolute path, without a trailing slash and without a query string. */
  path: string;
  /** Under ~60 characters: the site name is appended to it. */
  title: string;
  /** One sentence, in the words someone would search for. */
  description: string;
}

/**
 * The route an address names.
 * @param routes - Every address the site answers.
 * @param path - Absolute path, without a query string.
 * @returns Its entry, or `undefined` when the site does not know the address.
 */
export function routeFor(
  routes: readonly RouteMeta[],
  path: string,
): RouteMeta | undefined {
  const wanted = trimTrailingSlash(path) || '/';
  for (const route of routes) {
    if (trimTrailingSlash(route.path) === wanted) return route;
  }
  return undefined;
}

/**
 * The page an address opens.
 *
 * An address the site does not know is described as the home page rather than
 * invented on the fly, which is what the router does with it too. The query
 * string never reaches the answer: the structure being drawn and the
 * configuration a shared link carries are not pages of their own.
 * @param routes - Every address the site answers.
 * @param url - The address, query string and fragment included.
 * @returns The route it is indexed as.
 * @throws {Error} When the table is empty, so there is no page to fall back to.
 */
export function pageMetaFor(
  routes: readonly RouteMeta[],
  url: string,
): RouteMeta {
  const home = homeRoute(routes);
  const cut = url.search(/[?#]/);
  const path = cut === -1 ? url : url.slice(0, cut);
  return routeFor(routes, path) ?? home;
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
  return routeFor(routes, '/') ?? first;
}

/**
 * Drop a trailing slash, so `/about/` and `/about` are one page.
 * @param value - A path or an origin.
 * @returns It, without the trailing slash `/` itself keeps.
 */
export function trimTrailingSlash(value: string): string {
  return value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;
}
