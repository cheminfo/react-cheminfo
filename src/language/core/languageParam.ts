/**
 * The language a page is read in, as the family carries it between its sites.
 *
 * A link from one site to another keeps the language the visitor is reading
 * in: the tag travels as a query parameter rather than as the path prefix a
 * translated site routes by, because the site being linked to may not speak
 * that language at all. A parameter it does not know is ignored; a `/fr/`
 * path it does not have is a 404.
 */

import { parseQueryString } from '../../router/core/query.ts';

/** Query parameter every site of the family carries its language in. */
export const LANGUAGE_PARAM = 'lang';

/**
 * Whether a string is a language a link may name: a BCP 47 tag already
 * written in its canonical form, e.g. `fr`, `pt-BR`, `zh-Hant`.
 * @param value - The candidate tag.
 * @returns True when the tag is valid and canonical.
 */
export function isLanguageTag(value: string): boolean {
  if (value.length === 0 || value.length > 35) return false;
  try {
    return Intl.getCanonicalLocales(value)[0] === value;
  } catch {
    return false;
  }
}

/**
 * The language an address names.
 * @param search - The query string, with or without its leading `?`.
 * @returns The tag, or `undefined` when the address names none or names
 *   something that is not a language.
 */
export function readLanguageParam(search: string): string | undefined {
  const value = parseQueryString(search)[LANGUAGE_PARAM];
  if (value === undefined || !isLanguageTag(value)) return undefined;
  return value;
}

/**
 * An address that names the language it should be read in.
 * @param url - The address, absolute or relative.
 * @param language - The tag to write, or `undefined` to leave the address
 *   alone — which is what a site passes while it is in the language every
 *   other site defaults to.
 * @returns The address, with the language written into its query.
 */
export function withLanguageParam(
  url: string,
  language: string | undefined,
): string {
  if (language === undefined || !isLanguageTag(language)) return url;
  let address: URL;
  try {
    address = new URL(url, RELATIVE_BASE);
  } catch {
    return url;
  }
  address.searchParams.set(LANGUAGE_PARAM, language);
  const written = address.toString();
  return written.startsWith(RELATIVE_BASE)
    ? written.slice(RELATIVE_BASE.length)
    : written;
}

// Only ever used to resolve a relative address, and stripped again after.
const RELATIVE_BASE = 'https://relative.invalid';
