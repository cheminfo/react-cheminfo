import { writeRoute } from '../../router/core/history.ts';
import type {
  TabRouteInput,
  TabRouter,
} from '../../router/core/tabRouterTypes.ts';

import { SLIDE_PARAM, slideParam } from './slideAddress.ts';

/**
 * The moves of a site's talks tab, on the site's own router.
 *
 * The list and the player are one tab, which a move inside it would otherwise
 * rewrite in place: opening a talk and leaving it therefore push an entry of
 * their own, so Back from a talk returns to the list, while turning a slide
 * rewrites the entry, so forty slides are not forty presses of Back.
 */

/**
 * Where a talk is played on one of its slides.
 * @param tab - The tab whose `/<id>` plays a talk.
 * @param talkId - The talk.
 * @param slide - The slide, zero-based; the first writes no `?slide=`.
 * @returns The route, for `writeRoute` or `router.format`.
 */
export function talkSlideRoute<Tab extends string>(
  tab: Tab,
  talkId: string,
  slide: number,
): TabRouteInput<Tab> {
  return { tab, id: talkId, params: { [SLIDE_PARAM]: SLIDE.serialize(slide) } };
}

/**
 * Open a talk, or the list of talks, as an entry of its own in the history.
 * @param router - The site's router.
 * @param tab - The tab of the talks.
 * @param talkId - The talk, or `null` for the list.
 * @param slide - The slide to open on, zero-based; the first, with no
 *   `?slide=` written, when left out.
 */
export function openTalk<Tab extends string>(
  router: TabRouter<Tab>,
  tab: Tab,
  talkId: string | null,
  slide?: number,
): void {
  const route =
    talkId === null || slide === undefined
      ? { tab, id: talkId }
      : talkSlideRoute(tab, talkId, slide);
  writeRoute(router, route, { history: 'push' });
}

/**
 * Show another slide of the talk on screen, rewriting the entry of the history
 * rather than stacking one.
 * @param router - The site's router.
 * @param tab - The tab of the talks.
 * @param talkId - The talk being presented.
 * @param slide - The slide, zero-based.
 */
export function showTalkSlide<Tab extends string>(
  router: TabRouter<Tab>,
  tab: Tab,
  talkId: string,
  slide: number,
): void {
  writeRoute(router, talkSlideRoute(tab, talkId, slide), {
    history: 'replace',
  });
}

const SLIDE = slideParam();
