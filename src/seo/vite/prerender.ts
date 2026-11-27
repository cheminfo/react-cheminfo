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
 *
 * `/about` is written to `about.html`, never `about/index.html`: a static host
 * serves a folder's index at `/about/` and redirects the address every link and
 * canonical uses to it (Cloudflare Pages does, with no way to turn it off),
 * while `about.html` is served at `/about` itself by Pages, static-web-server
 * and `vite preview` alike.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import type { Logger, Plugin } from 'vite';

import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { withLanguagePath } from '../../language/core/languagePath.ts';
import { trimTrailingSlash } from '../../router/core/address.ts';
import { assertRoutes } from '../core/assertRoutes.ts';
import { pageHeadTags } from '../core/pageMeta.ts';
import { robotsTxt } from '../core/robots.ts';
import type { RouteMeta } from '../core/routes.ts';
import { homeRoute } from '../core/routes.ts';
import { sitemapXml } from '../core/siteFiles.ts';
import { PAGE_BODY_MARKER, PAGE_HEAD_MARKER, fill } from '../core/template.ts';

import type { PrerenderOptions } from './prerenderOptions.ts';
import {
  assertSamePaths,
  crawlPathOf,
  structuredDataOf,
  withHtmlLang,
} from './prerenderPage.ts';

/**
 * Prerender every routed address of a cheminfo site.
 * @param options - The site, its routes, and what a crawler is told.
 * @returns The Vite plugin.
 * @throws {Error} When the route table names an address twice or names one that
 * is not a path, or when the origin is not an absolute address.
 */
export function cheminfoPrerender(options: PrerenderOptions): Plugin {
  const { site, origin, robots = [] } = options;
  const languages = options.languages ?? [DEFAULT_LANGUAGE];
  const tableFor = (language: Language): readonly RouteMeta[] =>
    typeof options.routes === 'function'
      ? options.routes(language)
      : options.routes;

  // Every language answers the same addresses, so each table is checked and
  // they are checked against each other: a translation that renames a path or
  // drops a page writes a file the sitemap of another language names, and the
  // `hreflang` set would point at an address that is not there.
  const routes = tableFor(DEFAULT_LANGUAGE);
  assertRoutes(routes);
  for (const language of languages) {
    if (language === DEFAULT_LANGUAGE) continue;
    assertSamePaths(routes, tableFor(language), language);
  }

  const structuredData = structuredDataOf(options);

  let out = 'dist';
  let serve = false;
  let logger: Logger | null = null;

  const page = (template: string, route: RouteMeta, language: Language) => {
    const head = fill(
      withHtmlLang(template, language),
      PAGE_HEAD_MARKER,
      `${pageHeadTags({
        site,
        routes: tableFor(language),
        origin,
        languages,
        url: withLanguagePath(language, route.path),
      })}${structuredData}`,
    );
    const crawlPath = crawlPathOf(options, route, language, tableFor(language));
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
        serve ? page(html, homeRoute(routes), DEFAULT_LANGUAGE) : html,
    },

    // A failed build wrote no page, and throwing here would replace the error
    // the bundler is about to report with an ENOENT on `index.html`.
    async closeBundle(error?: Error) {
      if (serve || error) return;
      // The crawl path names the family in the chrome's own words, and every
      // language but the default arrives as a chunk of its own, so they are all
      // fetched before a single file is written.
      await Promise.all(
        languages
          .filter((language) => language !== DEFAULT_LANGUAGE)
          .map((language) => CHROME_CATALOG.load(language)),
      );

      const template = readFileSync(join(out, 'index.html'), 'utf8');

      const write = (route: RouteMeta, language: Language, file: string) => {
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, page(template, route, language));
      };

      let written = 0;
      for (const language of languages) {
        const table = tableFor(language);
        let root = false;
        for (const route of table) {
          const address = trimTrailingSlash(
            withLanguagePath(language, route.path),
          );
          if (address === '/') root = true;
          write(
            route,
            language,
            address === '/'
              ? join(out, 'index.html')
              : join(out, `${address.slice(1)}.html`),
          );
          written++;
        }
        // The file a static server hands out for the mount itself. A table
        // naming no root would otherwise leave the template vite built, and
        // ship a site whose front page carries its markers instead of a head.
        // A language other than the default already has its own front page at
        // `/<language>`, so only the unprefixed one is ever missing.
        if (!root && language === DEFAULT_LANGUAGE) {
          write(homeRoute(table), language, join(out, 'index.html'));
          written++;
        }
      }

      writeFileSync(
        join(out, 'sitemap.xml'),
        sitemapXml({ site, routes, origin, languages }),
      );
      if (robots !== false) {
        writeFileSync(
          join(out, 'robots.txt'),
          robotsTxt({ site, routes, origin }, robots),
        );
      }

      const spoken =
        languages.length > 1 ? ` in ${languages.length} languages` : '';
      logger?.info(
        `${written} pages prerendered${spoken}, and listed in sitemap.xml`,
      );
    },
  };
}
