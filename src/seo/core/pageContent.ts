/**
 * The text each address says for itself, read from one record of the pages a
 * site has written for.
 */

import type { Language } from '../../i18n/core/languages.ts';

import type { PageContent } from './pageProse.ts';
import type { RouteMeta } from './routes.ts';

/**
 * The pages a site has written for, by path, or a function giving them in
 * each language.
 */
export type PageContentRecord =
  | Readonly<Record<string, PageContent>>
  | ((language: Language) => Readonly<Record<string, PageContent>>);

/**
 * What each address says for itself: the page written for its path when there
 * is one, and otherwise the name and the sentence the route is already indexed
 * under.
 *
 * The fallback repeats the snippet rather than adding to it, which is thin —
 * but the route table writes those distinctly per page, so a thin page is never
 * a duplicate of its neighbour, and no address ships the bare menu.
 * @param pages - The pages written for, by path.
 * @returns The function `cheminfoPrerender` calls once per route and language.
 */
export function pageContentOf(
  pages: PageContentRecord,
): (route: RouteMeta, language: Language) => PageContent {
  return (route, language) => {
    const written = typeof pages === 'function' ? pages(language) : pages;
    return (
      written[route.path] ?? {
        heading: route.title,
        paragraphs: [route.description],
      }
    );
  };
}
