/**
 * The tags that tell a search engine five addresses are one page written five
 * times.
 *
 * Without them a translated site is read as five sites that happen to look
 * alike: the French tutorial competes with the English one instead of being
 * offered to a French reader, and a search engine picks one of them to keep.
 * With them each address is served to the audience it was written for, and the
 * four it was not stop diluting it.
 *
 * Every page names **every** language including itself — a set that does not
 * list the page it is on is ignored whole — plus `x-default`, which is where a
 * reader whose language we do not speak is sent.
 */

import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { withLanguagePath } from '../../language/core/languagePath.ts';
import { escapeAttribute } from '../../share/core/escape.ts';

/** Which page, in which languages, served from where. */
export interface AlternateOptions {
  /**
   * Where the site is served, mount path included and no trailing slash, e.g.
   * `https://3d.cheminfo.org`.
   */
  origin: string;
  /**
   * The page, from the site's own root and with no language prefix on it, e.g.
   * `/tutorial`.
   */
  path: string;
  /**
   * Every language the site is written in. One language alone means there is
   * nothing to point at, and no tag is written.
   */
  languages: readonly Language[];
}

/**
 * The `rel="alternate"` block for one page of a translated site.
 * @param options - The page, its languages and where the site is served.
 * @returns The tags, one per line, or `''` when the site speaks one language.
 */
export function alternateLinkTags(options: AlternateOptions): string {
  const { origin, path, languages } = options;
  if (languages.length < 2) return '';

  const tags: string[] = [];
  for (const language of languages) {
    tags.push(linkTag(language, address(origin, language, path)));
  }
  // A reader we have no language for gets the unprefixed address, which is the
  // one every link handed out before the site was translated already points at.
  tags.push(linkTag('x-default', address(origin, DEFAULT_LANGUAGE, path)));
  return tags.join('\n');
}

function address(origin: string, language: Language, path: string): string {
  return `${origin}${withLanguagePath(language, path)}`;
}

function linkTag(hreflang: string, href: string): string {
  return `<link rel="alternate" hreflang="${escapeAttribute(hreflang)}" href="${escapeAttribute(href)}" />`;
}
