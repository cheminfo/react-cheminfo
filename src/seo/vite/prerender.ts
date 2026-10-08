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

import type { SiteId, SiteRecord } from '../../ecosystem/core/sites.ts';
import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { withLanguagePath } from '../../language/core/languagePath.ts';
import { trimTrailingSlash } from '../../router/core/address.ts';
import type { NoscriptText } from '../core/noscript.ts';
import { noscriptIndex } from '../core/noscript.ts';
import { pageHeadTags } from '../core/pageMeta.ts';
import type { PageContent } from '../core/pageProse.ts';
import type { RobotsDisallow } from '../core/robots.ts';
import { robotsTxt } from '../core/robots.ts';
import type { RouteMeta } from '../core/routes.ts';
import { assertRoutes, homeRoute } from '../core/routes.ts';
import { sitemapXml } from '../core/siteFiles.ts';
import { structuredDataScript } from '../core/structuredData.ts';
import { PAGE_BODY_MARKER, PAGE_HEAD_MARKER, fill } from '../core/template.ts';

/** What the build needs to know to write the site's addresses. */
export interface PrerenderOptions {
  /** The site, named or passed. */
  site: SiteRecord | SiteId;
  /**
   * Every address it answers, each with its title and description.
   *
   * A translated site passes a function instead: the build calls it once per
   * language and writes that language's table, so the title and the description
   * a search result shows are in the language of the page it points at. The
   * paths are the same in every language — an id is never translated, or a
   * progress key, a share link and a bookmark would all break on a language
   * switch.
   */
  routes: readonly RouteMeta[] | ((language: Language) => readonly RouteMeta[]);
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
  noscript?:
    boolean | NoscriptText | ((language: Language) => boolean | NoscriptText);
  /**
   * What each page says for itself, above the crawl path: its own heading, its
   * prose and the facts it would show anyway, read from the same data the app
   * renders from.
   *
   * Without it every address ships the same body — the site's menu — and a
   * search engine handed a hundred identical bodies keeps one of them. It is a
   * function of the route rather than a field of it, so the prose stays out of
   * the bundle the browser downloads: only the build ever calls it.
   * @default undefined — every page carries the menu alone
   */
  content?: (route: RouteMeta, language: Language) => PageContent | undefined;
  /**
   * Every language the site is written in, the default one included.
   *
   * The build then writes one file per address per language — `/tutorial` and
   * `/fr/tutorial` — each with its own `lang`, title, description and
   * canonical, the `hreflang` set tying them together, and every variant in the
   * sitemap. That is the whole of what makes a translation findable: a site
   * keeping its language in a parameter or in storage serves five languages at
   * one address, and a crawler indexes one.
   * @default [the default language]
   */
  languages?: readonly Language[];
}

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

  const structuredData = structuredDataOf(options, routes);

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

    async closeBundle() {
      if (serve) return;
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

function structuredDataOf(
  options: PrerenderOptions,
  routes: readonly RouteMeta[],
): string {
  const { category, ...rest } = options;
  if (category === false) return '';
  const { site, origin } = rest;
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

function crawlPathOf(
  options: PrerenderOptions,
  route: RouteMeta,
  language: Language,
  routes: readonly RouteMeta[],
): string {
  const { site, origin } = options;
  // The crawl path of a translated page is that language's: its heading, its
  // intro and the label under every link. Declared as a function of the
  // language, the site writes each of them from its own catalog; declared as a
  // record, it is the same words on every language, which is what a site that
  // speaks one wants and is what it used to be.
  const declared = options.noscript ?? true;
  const noscript =
    typeof declared === 'function' ? declared(language) : declared;
  if (noscript === false) return '';
  const content = options.content?.(route, language);
  const { routes: listed, ...prose } = noscript === true ? {} : noscript;
  // The crawl path of a translated page links to that language's addresses: a
  // French page listing the English ones is a crawler's only route out of it,
  // and it would lead straight back out of the translation.
  const menu = (listed ?? routes).map((entry) => ({
    ...entry,
    path: withLanguagePath(language, entry.path),
  }));
  return noscriptIndex({
    site,
    origin,
    ...prose,
    routes: menu,
    content,
    language,
  });
}

// Two tables of one site answer the same addresses. A translated table that
// renames or drops a path leaves the `hreflang` set of every other language
// pointing at an address nothing wrote, which is a soft 404 on each of them.
function assertSamePaths(
  source: readonly RouteMeta[],
  translated: readonly RouteMeta[],
  language: Language,
): void {
  const wanted = source.map((route) => route.path).join(' ');
  const written = translated.map((route) => route.path).join(' ');
  if (wanted !== written) {
    throw new Error(
      `the ${language} route table answers different addresses than the source one: an address is the same in every language`,
    );
  }
}

// The template is written in the default language, so each file says which
// language it is actually in. A page whose `lang` lies is read aloud wrong and
// offered to the wrong reader.
function withHtmlLang(template: string, language: Language): string {
  return template.replace(
    /<html(?<attributes>[^>]*)\slang="[^"]*"/i,
    `<html$<attributes> lang="${language}"`,
  );
}
