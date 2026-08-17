/**
 * Write one real HTML file per routed address, and everything else a crawler
 * fetches on its own.
 *
 * A site served by a static image has nothing to rewrite a head per request: a
 * crawler gets whatever came off the wire. Without this every address carries
 * the same title and a search engine folds the whole site into one result.
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
import { injectPageMeta, insertBeforeHeadEnd } from '../core/pageMeta.ts';
import type { RouteMeta } from '../core/routes.ts';
import {
  noscriptIndex,
  robotsTxt,
  sitemapXml,
  structuredDataScript,
} from '../core/siteFiles.ts';

/** What the build needs to know to write the site's addresses. */
export interface PrerenderOptions {
  /** The site, named or passed. */
  site: EcosystemSite | SiteId;
  /** Every address it answers, each with its title and description. */
  routes: readonly RouteMeta[];
  /**
   * Origin every absolute address is built on.
   * @default `https://<the site's host>`
   */
  origin?: string;
  /**
   * Address prefixes `robots.txt` keeps out of the index, e.g. `/v1/`. Set to
   * `false` to write no `robots.txt` at all, for a site that ships its own.
   * @default []
   */
  robots?: false | readonly string[];
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
   * Whether the built page carries a `noscript` index of the addresses. It is
   * the only crawl path through a site whose body is an empty root element.
   * @default true
   */
  noscript?: boolean;
}

/**
 * Prerender every routed address of a cheminfo site.
 * @param options - The site, its routes, and what a crawler is told.
 * @returns The Vite plugin.
 */
export function cheminfoPrerender(options: PrerenderOptions): Plugin {
  const {
    site,
    routes,
    origin,
    robots = [],
    category,
    operatingSystem,
    noscript = true,
  } = options;
  let out = 'dist';
  let logger: Logger | null = null;

  return {
    name: 'cheminfo:prerender',
    apply: 'build',

    configResolved(config) {
      out = resolve(config.root, config.build.outDir);
      logger = config.logger;
    },

    transformIndexHtml: {
      order: 'post',
      handler(html) {
        let page = html;
        if (category !== false) {
          page = insertBeforeHeadEnd(
            page,
            structuredDataScript({
              site,
              routes,
              origin,
              category,
              operatingSystem,
            }),
          );
        }
        if (noscript) {
          page = insertBeforeBodyEnd(
            page,
            noscriptIndex({ site, routes, origin }),
          );
        }
        return page;
      },
    },

    closeBundle() {
      const index = readFileSync(join(out, 'index.html'), 'utf8');

      for (const route of routes) {
        const file =
          route.path === '/'
            ? join(out, 'index.html')
            : join(out, route.path.slice(1), 'index.html');
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(
          file,
          injectPageMeta(index, { site, routes, origin, url: route.path }),
        );
      }

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

function insertBeforeBodyEnd(html: string, addition: string): string {
  const body = html.lastIndexOf('</body>');
  if (body === -1) return `${html}\n${addition}\n`;
  return `${html.slice(0, body)}${addition}\n${html.slice(body)}`;
}
