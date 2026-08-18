/**
 * Write one real HTML file per routed address, and everything else a crawler
 * fetches on its own.
 *
 * A site served by a static image has nothing to rewrite a head per request: a
 * crawler gets whatever came off the wire. Without this every address carries
 * the same title and a search engine folds the whole site into one result.
 *
 * The build's `index.html` is the template: it declares where its head and its
 * crawl path go with `<!--cheminfo:head-->` and `<!--cheminfo:body-->`, and
 * every file written here is filled from it. The dev server is filled the same
 * way, from the home route, so what a developer opens is what the build ships.
 *
 * These files are also what makes the server's catch-all fallback unnecessary.
 * Every address the tool answers is on disk, so an address that is *not* on
 * disk is genuinely not a page and must 404 rather than serving the tool under
 * a name it does not have.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import type { Logger, Plugin } from 'vite';

import type { EcosystemSite, SiteId } from '../../ecosystem/core/sites.ts';
import type { NoscriptText } from '../core/noscript.ts';
import { noscriptIndex } from '../core/noscript.ts';
import { pageHeadTags } from '../core/pageMeta.ts';
import type { RobotsDisallow } from '../core/robots.ts';
import { robotsTxt } from '../core/robots.ts';
import type { RouteMeta } from '../core/routes.ts';
import { assertRoutes, homeRoute, trimTrailingSlash } from '../core/routes.ts';
import { sitemapXml } from '../core/siteFiles.ts';
import { structuredDataScript } from '../core/structuredData.ts';
import { PAGE_BODY_MARKER, PAGE_HEAD_MARKER, fill } from '../core/template.ts';

/** What the build needs to know to write the site's addresses. */
export interface PrerenderOptions {
  /** The site, named or passed. */
  site: EcosystemSite | SiteId;
  /** Every address it answers, each with its title and description. */
  routes: readonly RouteMeta[];
  /**
   * Where the site is served, mount path included. Every absolute address is
   * built on it, and `robots.txt` and the `noscript` index write their paths
   * under its mount. The files on disk are laid out from the build's own root
   * either way: it is the server that puts them under the mount.
   * @default `https://<the site's host>`
   */
  origin?: string;
  /**
   * Addresses `robots.txt` keeps out of the index, e.g. `/v1/`, each optionally
   * with the sentence saying why. Set to `false` to write no `robots.txt` at
   * all, for a site that ships its own.
   * @default []
   */
  robots?: false | ReadonlyArray<string | RobotsDisallow>;
  /**
   * The schema.org category of the structured-data block, or `false` to write
   * none.
   * @default 'EducationalApplication'
   */
  category?: false | string;
  /**
   * What the tool needs to run, named in the structured-data block.
   * @default 'Any modern browser'
   */
  operatingSystem?: string;
  /**
   * What the tool does, in the structured-data block.
   * @default the site's tagline
   */
  description?: string;
  /**
   * What a browser has to offer for the tool to run.
   * @default 'Requires JavaScript'
   */
  browserRequirements?: string;
  /**
   * The currency the zero price is quoted in.
   * @default 'EUR'
   */
  currency?: string;
  /**
   * Whether the built page carries a `noscript` index of the addresses, what it
   * says, which pages it lists and how it writes their addresses. It is the
   * only crawl path through a site whose body is an empty root element, so
   * `false` leaves one without any — and is also what lets a template ship no
   * `<!--cheminfo:body-->` at all.
   * @default true
   */
  noscript?: boolean | NoscriptText;
}

/**
 * Prerender every routed address of a cheminfo site.
 * @param options - The site, its routes, and what a crawler is told.
 * @returns The Vite plugin.
 * @throws {Error} When the route table names an address twice or names one that
 * is not a path, or when the origin is not an absolute address.
 */
export function cheminfoPrerender(options: PrerenderOptions): Plugin {
  const { site, routes, origin, robots = [] } = options;
  assertRoutes(routes);
  const structuredData = structuredDataOf(options);
  const crawlPath = crawlPathOf(options);

  let out = 'dist';
  let serve = false;
  let logger: Logger | null = null;

  const page = (template: string, url: string) => {
    const head = fill(
      template,
      PAGE_HEAD_MARKER,
      `${pageHeadTags({ site, routes, origin, url })}${structuredData}`,
    );
    return crawlPath === '' ? head : fill(head, PAGE_BODY_MARKER, crawlPath);
  };

  return {
    name: 'cheminfo:prerender',

    configResolved(config) {
      serve = config.command === 'serve';
      out = resolve(config.root, config.build.outDir);
      logger = config.logger;
    },

    // A dev run has no build to prerender, so the page vite serves is filled
    // from the home route rather than shipped with its markers showing.
    transformIndexHtml: {
      order: 'post',
      handler: (html: string) =>
        serve ? page(html, homeRoute(routes).path) : html,
    },

    closeBundle() {
      if (serve) return;
      const template = readFileSync(join(out, 'index.html'), 'utf8');

      const write = (url: string, file: string) => {
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, page(template, url));
      };

      let root = false;
      for (const route of routes) {
        const address = trimTrailingSlash(route.path);
        if (address === '/') root = true;
        write(
          route.path,
          address === '/'
            ? join(out, 'index.html')
            : join(out, address.slice(1), 'index.html'),
        );
      }
      // The file a static server hands out for the mount itself. A table naming
      // no root would otherwise leave the template vite built, and ship a site
      // whose front page carries its markers instead of a head.
      if (!root) write(homeRoute(routes).path, join(out, 'index.html'));

      writeFileSync(
        join(out, 'sitemap.xml'),
        sitemapXml({ site, routes, origin }),
      );
      if (robots !== false) {
        writeFileSync(
          join(out, 'robots.txt'),
          robotsTxt({ site, routes, origin }, robots),
        );
      }

      logger?.info(
        `${routes.length} pages prerendered, and listed in sitemap.xml`,
      );
    },
  };
}

function structuredDataOf(options: PrerenderOptions): string {
  const { category, ...rest } = options;
  if (category === false) return '';
  const { site, routes, origin } = rest;
  const { operatingSystem, description, browserRequirements, currency } = rest;
  return `\n${structuredDataScript({
    site,
    routes,
    origin,
    category,
    operatingSystem,
    description,
    browserRequirements,
    currency,
  })}`;
}

function crawlPathOf(options: PrerenderOptions): string {
  const { site, routes, origin, noscript = true } = options;
  if (noscript === false) return '';
  const { routes: listed, ...prose } = noscript === true ? {} : noscript;
  return noscriptIndex({ site, origin, ...prose, routes: listed ?? routes });
}
