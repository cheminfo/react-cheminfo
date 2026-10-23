import type { FastifyReply } from 'fastify';

import type { SiteId, SiteRecord } from '../ecosystem/core/sites.ts';
import type { NoscriptText } from '../seo/core/noscript.ts';
import type { PageContent } from '../seo/core/pageProse.ts';
import type { RobotsDisallow } from '../seo/core/robots.ts';
import type { RouteMeta } from '../seo/core/routes.ts';
import type { StructuredDataOptions } from '../seo/core/structuredData.ts';

import type { HealthRouteOptions } from './healthRoute.ts';

/** A page an address names that the route table does not: a compound, a course. */
export interface SpaPage {
  /** Its title, description and canonical path. */
  meta: RouteMeta;
  /**
   * What it says for itself in the crawl path.
   * @default its title as heading, its description as the paragraph
   */
  content?: PageContent;
}

/** What the structured-data block says beyond the site and its address. */
export type SpaStructuredData = Omit<
  StructuredDataOptions,
  'site' | 'routes' | 'origin' | 'languages'
>;

/** Options of `spaSite`. */
export interface SpaSiteOptions {
  /** The directory holding the built frontend. */
  root: string;
  /** The site, named or passed. */
  site: SiteRecord | SiteId;
  /**
   * Every address the frontend routes itself, each with its title and
   * description.
   * @default the `routes.json` the build wrote beside the page, or the site's
   * home page alone
   */
  routes?: readonly RouteMeta[];
  /**
   * Where the site is served, mount path included, e.g.
   * `https://learn.cheminfo.org/surge`. Every canonical, card and sitemap address
   * is built on it. A blank value is unset, as compose forwards `${SITE_URL:-}`.
   * @default the origin the request arrived on
   */
  siteUrl?: string;
  /**
   * The analytics snippet, put at the end of the head of every page.
   * @default undefined - nothing is loaded
   */
  trackingScript?: string;
  /**
   * Address prefixes another plugin answers, such as the API, which never
   * answer a page: an unknown address there is the API's own 404.
   * @default ['/v1/', '/docs']
   */
  reserved?: readonly string[];
  /**
   * The prose of the crawl path, and the pages it links.
   * @default the site's name and tagline, linking every indexed route
   */
  noscript?: NoscriptText;
  /**
   * The structured-data block of every page: what kind of application the site
   * is, a function writing the whole `<script>` for the origin served (an
   * author, a citation, a search action), or `false` for none.
   * @default {} - a free web application, described by the site's tagline
   */
  structuredData?: false | SpaStructuredData | ((origin: string) => string);
  /**
   * The card a link to a page unfurls into, as an absolute address or a path.
   * @default '/og.png'
   */
  image?: string;
  /**
   * Addresses `robots.txt` keeps out of the index, each optionally with the
   * sentence saying why.
   * @default ['/v1/', '/docs']
   */
  robots?: ReadonlyArray<string | RobotsDisallow>;
  /**
   * More addresses the sitemap lists after the route table: one per compound,
   * per published course.
   * @default undefined - the route table alone
   */
  sitemapPaths?: () => readonly string[] | Promise<readonly string[]>;
  /**
   * The page an address names when the route table does not: read from the
   * database, so `/compound/1234` is indexed under the compound's own name.
   * `undefined` falls back to the table.
   * @default undefined - every address is read from the table
   */
  page?: (url: string) => SpaPage | undefined | Promise<SpaPage | undefined>;
  /**
   * Whether an address is one the app routes, given its path without the query
   * and without the mount.
   * @default whether the route table claims it, or `page` named it
   */
  knownRoute?: (path: string) => boolean;
  /**
   * The status an address the app does not route is answered with. It is
   * still the page, so the app draws its own "not found", but a crawler is not
   * handed a soft 404.
   * @default 200
   */
  notFoundStatus?: number;
  /**
   * Whether search engines may index the site. An admin site sets `false`:
   * every answer then carries `X-Robots-Tag: noindex, nofollow`, `robots.txt`
   * disallows everything, there is no sitemap, and a page without the
   * `<!--cheminfo:head-->` marker is served as it is.
   * @default true
   */
  indexed?: boolean;
  /**
   * How many pages, each with its own crawl path, are kept built.
   * @default 2000
   */
  maxCachedPages?: number;
  /**
   * Whether `/health` is answered here, and with what more.
   * @default true
   */
  health?: boolean | HealthRouteOptions;
  /**
   * Headers for a file of the build, such as a cross-origin opening for the
   * decks another site fetches.
   * @default undefined - the cache headers alone
   */
  setHeaders?: (reply: FastifyReply, file: string) => void;
}
