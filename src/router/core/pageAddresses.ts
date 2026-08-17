import { normalizePath, splitAddress } from './address.ts';
import { joinBasePath, normalizeBasePath, stripBasePath } from './basePath.ts';

/**
 * The table of everything the site answers, read by the three things that must
 * agree on it: the build, which writes one HTML file per entry and the sitemap
 * listing them; the server or the entrypoint, which titles the page it hands
 * out; and the running app, which retitles the tab after an in-app move.
 *
 * Pure and DOM-free, so the prerender script imports the same table under Node
 * that the browser imports at run time. A page missing from it is a page a
 * search engine only ever sees as the home page.
 * @param options - The pages, in the order the site presents them.
 * @returns The three lookups the build and the app share.
 */
export function createPageAddresses<Page extends PageWithPath>(
  options: PageAddressesOptions<Page>,
): PageAddresses<Page> {
  const pages = options.pages;
  const first = pages[0];
  if (first === undefined) {
    throw new Error('createPageAddresses needs at least one page');
  }
  const home: Page = first;
  const basePath = normalizeBasePath(options.basePath ?? '');

  const byPath = new Map<string, Page>();
  for (const page of pages) {
    byPath.set(normalizePath(page.path), page);
  }

  function everyPage(): readonly Page[] {
    return pages;
  }

  function canonicalPathOf(page: Page): string {
    return joinBasePath(basePath, normalizePath(page.path));
  }

  function pageAt(address: string): Page {
    const path = normalizePath(
      stripBasePath(basePath, splitAddress(address).path),
    );
    const exact = byPath.get(path);
    if (exact !== undefined) return exact;
    return deepestPageUnder(pages, path) ?? home;
  }

  return { everyPage, canonicalPathOf, pageAt };
}

/** The one thing a page must carry: the address it is reachable at. */
export interface PageWithPath {
  /** Address from the site's own root, e.g. `/exercises`. */
  path: string;
}

/** How a site's pages are turned into addresses. */
export interface PageAddressesOptions<Page extends PageWithPath> {
  /**
   * Every page, deep addresses included. The first is the home page, and is
   * what an address the site does not know opens.
   */
  pages: readonly Page[];
  /**
   * The path the site is served under: nothing on a host of its own, `/surge`
   * as one tool among several on a shared one.
   * @default ''
   */
  basePath?: string;
}

/** The lookups a site's pages answer. */
export interface PageAddresses<Page extends PageWithPath> {
  /** Every page, in the order given: what the sitemap lists and the build writes. */
  everyPage: () => readonly Page[];
  /**
   * The address a page is indexed under, mount path included and query string
   * dropped — a structure being edited and a share configuration are not pages.
   */
  canonicalPathOf: (page: Page) => string;
  /**
   * The page an address opens. An address below a page it does not list is that
   * page — a link written before an exercise was renamed still opens, and is
   * indexed as the exercises — and an address it knows nothing about is the
   * home page.
   */
  pageAt: (address: string) => Page;
}

function deepestPageUnder<Page extends PageWithPath>(
  pages: readonly Page[],
  path: string,
): Page | undefined {
  let deepest: Page | undefined;
  let depth = 0;
  for (const page of pages) {
    const candidate = normalizePath(page.path);
    if (candidate === '/' || candidate.length <= depth) continue;
    if (path.startsWith(`${candidate}/`)) {
      deepest = page;
      depth = candidate.length;
    }
  }
  return deepest;
}
