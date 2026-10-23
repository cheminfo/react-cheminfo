/**
 * The room a search result gives the words a page is indexed under. They are
 * checked by `routeProblems` and fitted by `plainDescription` and
 * `fitDescription`, so a site that composes its own prose reads them here
 * rather than re-typing them.
 */

/**
 * The longest title that survives a search result whole, before the site name
 * is appended to it.
 */
export const TITLE_LIMIT = 60;

/**
 * The shortest description that says anything: under it a result pads the
 * snippet with whatever text the crawler found on the page.
 */
export const DESCRIPTION_MIN = 110;

/** The longest description a result shows without clipping it. */
export const DESCRIPTION_MAX = 160;

/**
 * What a grown description aims for. It sits above {@link DESCRIPTION_MIN}
 * because the floor is not the goal: a clause that fits is one the reader gets.
 */
export const DESCRIPTION_TARGET = 132;
