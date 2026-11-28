/**
 * The text an address says for itself when the site writes it from its data:
 * a page it wrote for, then an item of a section — a tutorial step, an
 * exercise, an element — then the route's own words.
 */

import type { PageContent } from './pageProse.ts';
import type { RouteMeta } from './routes.ts';

/** Where {@link routePageContent} reads an address's text. */
export interface RoutePageContentOptions {
  /**
   * The pages the site wrote for, by path.
   * @default {}
   */
  pages?: Readonly<Record<string, PageContent>>;
  /**
   * Each section, by its path with the trailing slash (`/exercises/`), and
   * what one item of it says, given the item's id. An id the resolver does
   * not know returns `undefined`, and the next section is tried.
   * @default {}
   */
  sections?: Readonly<Record<string, (id: string) => PageContent | undefined>>;
}

/**
 * What one address says for itself: the page written for its path, else the
 * item of the first section it sits in that knows it, else the name and the
 * sentence the route is indexed under — so no address ships the bare menu.
 *
 * Built for `cheminfoPrerender`'s `content`:
 * `content: (route) => routePageContent(route, { pages, sections })`.
 * @param route - The address being written.
 * @param options - The pages and the sections it is read from.
 * @returns Its text.
 */
export function routePageContent(
  route: RouteMeta,
  options: RoutePageContentOptions = {},
): PageContent {
  const { pages = {}, sections = {} } = options;
  const authored = Object.hasOwn(pages, route.path)
    ? pages[route.path]
    : undefined;
  if (authored !== undefined) return authored;

  for (const [section, resolve] of Object.entries(sections)) {
    const id = routeItem(section, route.path);
    if (id === undefined) continue;
    const content = resolve(id);
    if (content !== undefined) return content;
  }

  return { heading: route.title, paragraphs: [route.description] };
}

/**
 * The one item an address names under a section: `word-boundaries` for
 * `/exercises/word-boundaries` under `/exercises/`. The section's own address,
 * an address one level deeper, and one that does not decode name none.
 * @param section - The section's path; a missing trailing slash is added.
 * @param path - The address.
 * @returns The item's id, decoded, or `undefined`.
 */
export function routeItem(section: string, path: string): string | undefined {
  const prefix = section.endsWith('/') ? section : `${section}/`;
  if (!path.startsWith(prefix)) return undefined;
  let id: string;
  try {
    id = decodeURIComponent(path.slice(prefix.length));
  } catch {
    return undefined;
  }
  return id === '' || id.includes('/') ? undefined : id;
}
