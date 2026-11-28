import type { PageContent } from '../../seo/core/pageProse.ts';
import type { RouteMeta } from '../../seo/core/routes.ts';

import { slideHeading } from './slideHeading.ts';
import type { Talk, TalkMeta } from './talk.ts';

/**
 * The head of a talk's page: titled by its deck, described by its
 * `description:` line. A deck without one is described by its title, which
 * `routeProblems` then reports as too short to ship.
 * @param id - The talk, as its file names it.
 * @param meta - What its front matter says.
 * @param path - Where the site plays it; `/talks/<id>` when left out.
 * @returns Its route.
 */
export function talkRoute(
  id: string,
  meta: TalkMeta,
  path = `/talks/${id}`,
): RouteMeta {
  return {
    path,
    title: meta.title,
    description: meta.description ?? meta.title,
  };
}

/**
 * The text a talk's page is indexed on: its title, what it is about, and the
 * heading of each of its slides but the title slides, in order.
 * @param talk - The talk, as its deck parses.
 * @returns Its page content, for the `content` of `cheminfoPrerender`.
 */
export function talkPageContent(talk: Talk): PageContent {
  const headings: string[] = [];
  for (const slide of talk.slides) {
    if (slide.layout === 'title') continue;
    const heading = slideHeading(slide.body);
    if (heading !== '') headings.push(heading);
  }
  const { title, description } = talk.meta;
  return description === undefined
    ? { heading: title, list: headings }
    : { heading: title, paragraphs: [description], list: headings };
}
