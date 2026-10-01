/**
 * The language a translated site routes by: a prefix on its own addresses.
 *
 * `/fr/tutorial` is the French tutorial, and English is written with no prefix
 * at all, so every link already handed out in a course stays alive and the site
 * does not acquire a second spelling of its own front page.
 *
 * This is the half of the design that makes a translation *findable*. A site
 * that keeps its language in a query parameter, in the hash or in
 * `localStorage` serves five languages at one address: a crawler sees one page,
 * indexes one language, and the other four may as well not have been written.
 * The parameter stays — it is how the language travels to a sibling that may
 * not speak it (`./languageParam.ts`) — but it is not how a translated site
 * routes.
 *
 * The prefix sits between the mount and the route, so a tool served as one of
 * several on a shared host reads `/surge/fr/exercises`: the mount comes off
 * first (`router/core/basePath.ts`), then the language, then the table is read.
 */

import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { trimTrailingSlash } from '../../router/core/address.ts';

/** An address split into the language it names and the page it opens. */
export interface LanguagePath {
  /** The language named, or the default one when the address names none. */
  language: Language;
  /** The address from the site's own root, with the prefix taken off. */
  path: string;
}

/**
 * Read the language prefix off one of the site's own addresses.
 *
 * Only a language the site actually speaks is read as a prefix: on a site with
 * no Italian, `/it` is whatever page is called `it`, not an empty Italian front
 * page. So the list is the site's, never the family's.
 * @param path - An address from the site's own root, the mount already off,
 * e.g. `/fr/tutorial`.
 * @param languages - The languages this site is written in, the default one
 * included.
 * @returns The language it names and the page it opens.
 */
export function readLanguagePath(
  path: string,
  languages: readonly Language[],
): LanguagePath {
  const opened = path.startsWith('/') ? path : `/${path}`;
  const cut = opened.indexOf('/', 1);
  const first = cut === -1 ? opened.slice(1) : opened.slice(1, cut);

  for (const language of languages) {
    if (language === DEFAULT_LANGUAGE || language !== first) continue;
    const rest = cut === -1 ? '/' : opened.slice(cut);
    return { language, path: trimTrailingSlash(rest) || '/' };
  }
  return {
    language: DEFAULT_LANGUAGE,
    path: trimTrailingSlash(opened) || '/',
  };
}

/**
 * Write one of the site's own addresses in a language.
 *
 * The default language is written with no prefix: an address naming no language
 * is English, which is what keeps every link handed out before the site was
 * translated pointing at the same page.
 * @param language - The language to write it in.
 * @param path - The address from the site's own root, e.g. `/tutorial`.
 * @returns The address under that language, e.g. `/fr/tutorial`.
 */
export function withLanguagePath(language: Language, path: string): string {
  const opened = path.startsWith('/') ? path : `/${path}`;
  if (language === DEFAULT_LANGUAGE) return opened;
  return opened === '/' ? `/${language}` : `/${language}${opened}`;
}
