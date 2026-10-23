/**
 * The language half of a translated site's routes: the prefix a page is
 * written under, and the `?lang=` a sibling site hands the language over in.
 *
 * Inside a translated site the language is the path — `/fr/tutorial` — so each
 * language is an address of its own a crawler indexes and a course hands out.
 * Between sites it travels as a parameter, because the site being linked to
 * may not speak it, and a parameter it does not know is ignored where a prefix
 * it does not have is a 404. So a route reads the parameter only where the
 * prefix says nothing, and the prefix always wins: `/fr/tutorial?lang=de` is
 * the French tutorial for everybody.
 */

import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { LANGUAGE_PARAM } from '../../language/core/languageParam.ts';
import {
  readLanguagePath,
  withLanguagePath,
} from '../../language/core/languagePath.ts';

import { splitAddress } from './address.ts';
import { joinBasePath, stripBasePath } from './basePath.ts';
import type { QueryEntry, QueryStringOptions } from './query.ts';
import { formatQueryEntries, parseQueryEntries } from './query.ts';

/** The language a route is read in, and what is left of its address. */
export interface RouteLanguage {
  /** The language the page is read in. */
  language: Language;
  /** The path from the site's own root, the prefix taken off. */
  path: string;
  /** The parameters, without a `lang` that names a language of the site. */
  params: Record<string, string>;
}

/**
 * Read the language of a route off its path and its parameters.
 * @param path - The path from the site's own root, the mount already off.
 * @param params - The decoded query parameters.
 * @param languages - The languages the site is written in.
 * @returns The language, the path without its prefix, and the parameters.
 */
export function readRouteLanguage(
  path: string,
  params: Record<string, string>,
  languages: readonly Language[],
): RouteLanguage {
  const read = readLanguagePath(path, languages);
  const named = siteLanguage(params[LANGUAGE_PARAM], languages);
  if (named === undefined) return { ...read, params };
  const kept: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key !== LANGUAGE_PARAM) kept[key] = value;
  }
  const language = read.language === DEFAULT_LANGUAGE ? named : read.language;
  return { language, path: read.path, params: kept };
}

/**
 * Write a path from the site's own root under a language's prefix.
 * @param language - The language asked for, if any.
 * @param path - The path from the site's own root.
 * @param languages - The languages the site is written in.
 * @returns The path under the prefix; a language the site does not speak is
 * written as the default one, with no prefix.
 */
export function writeRouteLanguage(
  language: Language | undefined,
  path: string,
  languages: readonly Language[],
): string {
  const written =
    language !== undefined && languages.includes(language)
      ? language
      : DEFAULT_LANGUAGE;
  return withLanguagePath(written, path);
}

/** How {@link adoptLanguageParam} reads an address. */
export interface AdoptLanguageOptions {
  /** The mount path, normalised. */
  basePath: string;
  /** The languages the site is written in. */
  languages: readonly Language[];
  /** How the query string is read and written back. */
  queryOptions: QueryStringOptions;
}

/**
 * The address to put in place of one carrying a `?lang=` the site speaks.
 *
 * Only the language moves: the page named stays the page written, whether the
 * router knows it or not, and every other parameter and the fragment are kept.
 * @param address - A browser address: mount, prefix, page, query and fragment.
 * @param options - The mount, the languages and how the query is read.
 * @returns The address with the language in its path, or `null` when the
 * address names no language of the site in its query.
 */
export function adoptLanguageParam(
  address: string,
  options: AdoptLanguageOptions,
): string | null {
  const { basePath, languages, queryOptions } = options;
  const { path, search, fragment } = splitAddress(address);
  const entries = parseQueryEntries(search, queryOptions);
  let named: Language | undefined;
  const kept: QueryEntry[] = [];
  for (const entry of entries) {
    const language =
      entry[0] === LANGUAGE_PARAM
        ? siteLanguage(entry[1], languages)
        : undefined;
    if (language === undefined) kept.push(entry);
    else named ??= language;
  }
  if (named === undefined) return null;

  const read = readLanguagePath(stripBasePath(basePath, path), languages);
  const language = read.language === DEFAULT_LANGUAGE ? named : read.language;
  const opened = joinBasePath(basePath, withLanguagePath(language, read.path));
  const query = formatQueryEntries(kept);
  const withQuery = query === '' ? opened : `${opened}?${query}`;
  return fragment === '' ? withQuery : `${withQuery}#${fragment}`;
}

function siteLanguage(
  value: string | undefined,
  languages: readonly Language[],
): Language | undefined {
  if (value === undefined) return undefined;
  for (const language of languages) {
    if (language === value) return language;
  }
  return undefined;
}
