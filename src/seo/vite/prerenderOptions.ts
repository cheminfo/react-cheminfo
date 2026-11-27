/**
 * What `cheminfoPrerender` is told: the site, its addresses, and what a
 * crawler reads on each of them.
 */

import type { SiteId, SiteRecord } from '../../ecosystem/core/sites.ts';
import type { Language } from '../../i18n/core/languages.ts';
import type { NoscriptText } from '../core/noscript.ts';
import type { PageContentRecord } from '../core/pageContent.ts';
import type { PageContent } from '../core/pageProse.ts';
import type { RobotsDisallow } from '../core/robots.ts';
import type { RouteMeta } from '../core/routes.ts';

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
   * The pages written for, by path — or a function giving them per language —
   * for a site that would otherwise write `content` only to look a path up in
   * them. Every other address then says the name and the sentence its route
   * is indexed under, so none ships the bare menu. `content`, when given, is
   * read instead.
   * @default undefined — `content` alone decides
   */
  pages?: PageContentRecord;
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
