/**
 * The sitemap, and what every other file a crawler fetches on its own is
 * derived from: which site is being written, where it is served, and the path
 * it is mounted at.
 *
 * A deployment names where it serves the site in full — origin and mount path
 * in one value — because the origin is what a canonical link and a sitemap
 * entry need. The mount is read back out of it here, so the addresses these
 * files hand out start where the site actually answers.
 */

import { siteById } from '../../ecosystem/core/lookup.ts';
import type { SiteId, SiteRecord } from '../../ecosystem/core/sites.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { withLanguagePath } from '../../language/core/languagePath.ts';
import { trimTrailingSlash } from '../../router/core/address.ts';
import { basePathOf } from '../../router/core/basePath.ts';
import { escapeText } from '../../share/core/escape.ts';

import type { RouteMeta } from './routes.ts';

// A crawler fetches what it is given over HTTP, so an origin is written in one
// of the two schemes it speaks. Parsing alone does not say that: `localhost:3000`
// parses, with `localhost:` as its scheme and `3000` as its path.
const HTTP_ORIGIN = /^https?:\/\//i;

/**
 * Which site is being served, and where.
 *
 * The half of the options that says nothing about the pages, so the helpers
 * that only resolve an address take this rather than the whole record — a
 * caller whose `routes` is a function of the language is then still one of
 * these.
 */
export interface SiteOrigin {
  /** The site, named or passed. */
  site: SiteRecord | SiteId;
  /**
   * Where the site is served, mount path included, e.g.
   * `https://learn.cheminfo.org/surge`.
   * @default `https://<the site's host>`
   */
  origin?: string;
}

/** What a crawler is told about the site as a whole. */
export interface SiteFilesOptions extends SiteOrigin {
  /** The site, named or passed. */
  site: SiteRecord | SiteId;
  /** Every address it answers. */
  routes: readonly RouteMeta[];
  /**
   * Where the site is served, mount path included, e.g.
   * `https://learn.cheminfo.org/surge`. Every absolute address is built on it,
   * and every path one of these files writes starts at its mount.
   * @default `https://<the site's host>`
   */
  origin?: string;
  /**
   * Every language the site is written in, the default one included.
   *
   * A translated page is a page per language, so the sitemap lists every one of
   * them: a variant it leaves out is a variant nothing points a crawler at, and
   * the translation may as well not have been written. The `hreflang` set in
   * each page's head is what then ties them back together.
   * @default [the default language]
   */
  languages?: readonly Language[];
}

/**
 * Every routed address, as the sitemap lists them.
 *
 * A sitemap names at least one address: `<url>` is required by the sitemaps.org
 * schema, and `robots.txt` advertises the file, so an empty one is reported as
 * an error on every fetch rather than read as a site with nothing to index.
 * @param options - The site and its routes.
 * @returns The `sitemap.xml` document.
 * @throws {Error} When the site answers no route, or names an origin that is
 * not an absolute address.
 */
export function sitemapXml(options: SiteFilesOptions): string {
  const origin = originOf(options);
  if (options.routes.every((route) => route.indexed === false)) {
    throw new Error('a sitemap lists at least one address');
  }
  const languages = options.languages ?? [DEFAULT_LANGUAGE];
  const lines: string[] = [];
  for (const route of options.routes) {
    if (route.indexed === false) continue;
    for (const language of languages) {
      const address = `${origin}${withLanguagePath(language, route.path)}`;
      lines.push(`  <url><loc>${escapeText(address)}</loc></url>`);
    }
  }
  const entries = lines.join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

/**
 * The site these files are being written for.
 * @param site - The site, named or passed.
 * @returns Its record.
 */
export function resolveSite(site: SiteRecord | SiteId): SiteRecord {
  return typeof site === 'string' ? siteById(site) : site;
}

/**
 * Where the site is served, as an absolute address without a trailing slash.
 *
 * It is an absolute `http` or `https` address or it is refused: a canonical
 * link, an `og:url` and a sitemap entry are addresses a crawler resolves on its
 * own, and one written from an origin missing its scheme is resolved against
 * whatever directory the page was fetched from — pointing every page of the
 * site at a sibling of itself. A dev or staging origin written `localhost:3000`
 * is refused for the same reason: it parses, but as a path under a `localhost:`
 * scheme, so the mount read back off it would be `/3000`.
 * @param options - The site and where it is served.
 * @returns The origin, mount path included when the deployment named one.
 * @throws {Error} When the deployment named something that is not an absolute
 * `http` or `https` address.
 */
export function originOf(options: SiteOrigin): string {
  const origin = options.origin ?? `https://${resolveSite(options.site).host}`;
  if (!HTTP_ORIGIN.test(origin) || !URL.canParse(origin)) {
    throw new Error(
      `an origin is an absolute address, e.g. https://surge.cheminfo.org: ${JSON.stringify(origin)}`,
    );
  }
  return trimTrailingSlash(origin);
}

/**
 * The path the deployment is mounted at, read off the address it named.
 * @param options - The site and where it is served.
 * @returns `''` for a site owning its host, `/surge` for one mounted under it.
 * @throws {Error} When the deployment named something that is not an absolute
 * address, so there is no path to read off it.
 */
export function mountPathOf(options: SiteOrigin): string {
  return basePathOf(originOf(options));
}
