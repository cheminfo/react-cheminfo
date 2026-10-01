/**
 * What is wrong with the prose a site is indexed under.
 *
 * A route table is the only place a search result is written, and it is written
 * once and read for years, so the limits that decide whether a result is
 * readable are checked rather than trusted: a title Google cuts in half, a
 * description too short to say anything or long enough to be clipped, two pages
 * sharing a sentence — which is how a site asks to be deduplicated down to one
 * result — and a snippet promising something the page does not carry.
 *
 * The paths are `assertRoutes`' business; this is about the words.
 */

import type { RouteMeta } from './routes.ts';

/** The longest title that survives a search result whole. */
const TITLE_LIMIT = 60;
/** The shortest description that says anything. */
const DESCRIPTION_MIN = 110;
/** The longest description a result shows without clipping it. */
const DESCRIPTION_MAX = 160;

/**
 * What a site never says about itself, in the words it would say it in. A
 * snippet naming a repository, a tracker or a licence is both a promise the
 * page does not keep and a thing we do not publish.
 */
const WITHHELD =
  /\b(?:licence|license|licensing|open[ -]source|repositor(?:y|ies)|issue tracker|source code|report a (?:problem|bug|issue))\b/i;

/**
 * The phrase in a snippet that names something a site does not publish.
 *
 * Shared with the build-time checker, which reads the same sentences back out
 * of the pages they were written into: one list of words, checked where they
 * are authored and again where they landed.
 * @param text - A title or a description.
 * @returns The phrase, or `undefined` when there is none.
 */
export function withheldPhrase(text: string): string | undefined {
  return WITHHELD.exec(text)?.[0];
}

/**
 * Check the table a site is indexed under, before a build reads it.
 *
 * Returns the problems rather than throwing, so a site asserts an empty list in
 * its own test and reads every one of them at once.
 * @param routes - Every address the site answers.
 * @returns One line per problem, empty when the table is fit to ship.
 */
export function routeProblems(routes: readonly RouteMeta[]): string[] {
  const problems: string[] = [];

  if (routes.length === 0) {
    problems.push('the table is empty: a site answers at least one route.');
    return problems;
  }

  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();

  for (const route of routes) {
    const at = route.path;

    if (route.title.trim() === '') {
      problems.push(`${at}: the title is empty.`);
    } else if (route.title.length > TITLE_LIMIT) {
      problems.push(
        `${at}: the title is ${route.title.length} characters, and the site name is appended to it — at most ${TITLE_LIMIT} survives a result whole.`,
      );
    }

    const length = route.description.length;
    if (length < DESCRIPTION_MIN) {
      problems.push(
        `${at}: the description is ${length} characters — at least ${DESCRIPTION_MIN}, or the result says half of what the page is.`,
      );
    } else if (length > DESCRIPTION_MAX) {
      problems.push(
        `${at}: the description is ${length} characters — at most ${DESCRIPTION_MAX}, or the sentence is cut off in the result itself.`,
      );
    }

    const titleFirst = titles.get(route.title);
    if (titleFirst === undefined) {
      titles.set(route.title, at);
    } else {
      problems.push(`${at}: the title repeats the one at ${titleFirst}.`);
    }

    const descriptionFirst = descriptions.get(route.description);
    if (descriptionFirst === undefined) {
      descriptions.set(route.description, at);
    } else {
      problems.push(
        `${at}: the description repeats the one at ${descriptionFirst}.`,
      );
    }

    const withheld =
      withheldPhrase(route.title) ?? withheldPhrase(route.description);
    if (withheld !== undefined) {
      problems.push(
        `${at}: the snippet says "${withheld}" — a site names no repository, tracker or licence of ours.`,
      );
    }
  }

  return problems;
}
