/**
 * The parts of a prerendered page that depend on the page alone: its language,
 * its structured data and its crawl path.
 */

import type { Language } from '../../i18n/core/languages.ts';
import { withLanguagePath } from '../../language/core/languagePath.ts';
import { noscriptIndex } from '../core/noscript.ts';
import { pageContentOf } from '../core/pageContent.ts';
import type { PageContent } from '../core/pageProse.ts';
import type { RouteMeta } from '../core/routes.ts';
import { structuredDataScript } from '../core/structuredData.ts';

import type { PrerenderOptions } from './prerenderOptions.ts';

/**
 * The structured-data block every page of the site carries.
 * @param options - See {@link PrerenderOptions}.
 * @returns The script tag with a leading line break, or nothing when the site
 *   asks for none.
 */
export function structuredDataOf(options: PrerenderOptions): string {
  const { category, ...rest } = options;
  if (category === false) return '';
  const { site, origin } = rest;
  const { operatingSystem, description, browserRequirements, currency } = rest;
  return `\n${structuredDataScript({
    site,
    origin,
    category,
    operatingSystem,
    description,
    browserRequirements,
    currency,
  })}`;
}

/**
 * What a crawler that runs no script reads on one page: its own text, then
 * the links to every address of its language.
 * @param options - See {@link PrerenderOptions}.
 * @param route - The page.
 * @param language - The language it is written in.
 * @param routes - That language's route table.
 * @returns The crawl path, or nothing when the site asks for none.
 */
export function crawlPathOf(
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
  // speaks one wants.
  const declared = options.noscript ?? true;
  const noscript =
    typeof declared === 'function' ? declared(language) : declared;
  if (noscript === false) return '';
  const content = contentOf(options, route, language);
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

/**
 * Check that two tables of one site answer the same addresses. A translated
 * table that renames or drops a path leaves the `hreflang` set of every other
 * language pointing at an address nothing wrote, which is a soft 404 on each
 * of them.
 * @param source - The default language's table.
 * @param translated - Another language's table.
 * @param language - That other language.
 * @throws {Error} When the two answer different addresses.
 */
export function assertSamePaths(
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

/**
 * The template, saying which language the file is actually in: it is written
 * in the default one, and a page whose `lang` lies is read aloud wrong and
 * offered to the wrong reader.
 * @param template - The built `index.html`.
 * @param language - The language of the file.
 * @returns The template with that `lang`.
 */
export function withHtmlLang(template: string, language: Language): string {
  return template.replace(
    /<html(?<attributes>[^>]*)\slang="[^"]*"/i,
    `<html$<attributes> lang="${language}"`,
  );
}

/**
 * What a page says for itself: the site's own function when it wrote one, and
 * otherwise the page it wrote for that path, or the route's name and sentence.
 * @param options - See {@link PrerenderOptions}.
 * @param route - The page.
 * @param language - The language it is written in.
 * @returns Its content, or `undefined` for the route's own name and sentence.
 */
function contentOf(
  options: PrerenderOptions,
  route: RouteMeta,
  language: Language,
): PageContent | undefined {
  const { content, pages } = options;
  if (content !== undefined) return content(route, language);
  return pages === undefined
    ? undefined
    : pageContentOf(pages)(route, language);
}
