import { writeRoute } from '../../router/core/history.ts';
import type {
  TabRouteInput,
  TabRouter,
} from '../../router/core/tabRouterTypes.ts';

/**
 * Follow an address of the site through its router, as an entry of its own in
 * the history: a demo link of a slide, which must not reload the page in front
 * of an audience.
 * @param router - The site's router.
 * @param href - The address, as the slide wrote it, relative or absolute.
 * @returns Whether the router took it. An address it routes to no page — the
 *   API, its documentation, a published file — or one on another origin than
 *   the page's, which a deck played elsewhere links to, is the browser's to
 *   follow.
 */
export function openRoutedAddress<Tab extends string>(
  router: TabRouter<Tab>,
  href: string,
): boolean {
  const location = globalThis.location as Location | undefined;
  const origin = location?.origin ?? LOCAL_ORIGIN;
  const url = new URL(href, origin);
  if (url.origin !== origin) return false;

  const route = router.parse(`${url.pathname}${url.search}${url.hash}`);
  const page: TabRouteInput<Tab> = { tab: route.tab, id: route.id };
  if (route.language !== undefined) page.language = route.language;
  if (router.format(page) !== url.pathname) return false;

  writeRoute(router, route, { history: 'push' });
  return true;
}

// Only resolves a relative address where there is no browser; never fetched.
const LOCAL_ORIGIN = 'https://site.invalid';
