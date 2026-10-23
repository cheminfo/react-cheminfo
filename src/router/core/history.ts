/**
 * The tab router bound to the browser: read the address on screen, write a new
 * one through the History API, and hear every move.
 *
 * The router itself stays pure. Everything here reads and writes the address
 * through `pageLocation` and `pageHistory` — the browser's, or the one a sealed
 * link holds in memory — and does nothing where neither exists, so a prerender
 * script can import a module that uses it.
 */

import type { Language } from '../../i18n/core/languages.ts';
import { EMBED_PARAM, HIDE_PARAM } from '../../share/core/config.ts';

import { stripBasePath } from './basePath.ts';
import { pageHistory, pageLocation } from './pageAddress.ts';
import type { QueryEntry } from './query.ts';
import { formatQueryEntries } from './query.ts';
import type { TabRoute, TabRouteInput, TabRouter } from './tabRouter.ts';

/**
 * Fired on `globalThis` after {@link writeRoute} changes the address, because
 * neither `pushState` nor `replaceState` emits an event of its own.
 */
export const ROUTE_CHANGE_EVENT = 'cheminfo:routechange';

/**
 * Read the route the browser is showing.
 *
 * A link written before the site routed by path — `/#/tutorial/3` — is replaced
 * in place, once, by the address the router writes for it, when the router
 * adopts such links. So is a `?lang=` a sibling site handed the language over
 * in, on a router given `languages`: the language moves into the path, so one
 * reader's bookmark and the next one's are the same address. The language of a
 * prefixed address never changes: `/fr/tutorial?lang=de` stays French.
 * @param router - The site's router.
 * @returns The route of the address on screen, or of `/` where there is no browser.
 */
export function readRoute<Tab extends string>(
  router: TabRouter<Tab>,
): TabRoute<Tab> {
  const address = currentAddress();
  const legacy = router.legacyAddress(address);
  const adopted = router.languageAddress?.(legacy ?? address) ?? legacy;
  if (adopted === null) return router.parse(address);
  const history = pageHistory();
  history?.replaceState(history.state, '', adopted);
  globalThis.dispatchEvent?.(new Event(ROUTE_CHANGE_EVENT));
  return router.parse(adopted);
}

/**
 * Read the route the site opens on, the reader's own language applied to a
 * bare root.
 *
 * A bare `/` — no page, no query, no fragment — names no language, so the one
 * the reader last chose may decide which front page opens, and the address is
 * rewritten in place to say it. Nothing else is steered: a deep link opens what
 * it names for everybody, so `/tutorial` handed out in a course is English and
 * `/fr/tutorial` French, whatever either reader last read.
 * @param router - The site's router, given `languages`.
 * @param preferred - The language the reader last chose; `undefined`, or one
 * the router does not write, steers nothing.
 * @returns The route to open on.
 */
export function openingRoute<Tab extends string>(
  router: TabRouter<Tab>,
  preferred: Language | undefined,
): TabRoute<Tab> {
  const bare = isBareRoot(router);
  const route = readRoute(router);
  const steered =
    bare &&
    preferred !== undefined &&
    preferred !== route.language &&
    router.languages?.includes(preferred) === true;
  if (!steered) return route;
  const address = router.format({ ...route, language: preferred });
  const history = pageHistory();
  history?.replaceState(history.state, '', address);
  globalThis.dispatchEvent?.(new Event(ROUTE_CHANGE_EVENT));
  return router.parse(address);
}

/** How {@link writeRoute} records a move. */
export interface WriteRouteOptions {
  /**
   * `push` adds a history entry, `replace` rewrites the current one, and
   * `auto` pushes when the tab changes and replaces a move inside a tab, so
   * back walks the tabs rather than every step a visitor clicked through.
   * @default 'auto'
   */
  history?: 'push' | 'replace' | 'auto';
  /**
   * Query parameters carried over from the address on screen, besides `embed`
   * and `hide`, which always are: the names a site mirrors with
   * `syncPreferencesWithUrl`, typically `Object.keys(preferences)`.
   * @default []
   */
  keep?: readonly string[];
}

/**
 * Point the browser at a route.
 *
 * The share parameters of the address on screen, and the preference names in
 * `keep`, survive the move, so an embedded page stays embedded after its first
 * click. A parameter the route names itself — even as `null` or `undefined`, to
 * remove it — is the route's. On a router given `languages`, a route naming no
 * language keeps the one on screen, and changing language counts as changing
 * tab. Writing the address already on screen does nothing, so echoing state
 * back into the address cannot loop.
 * @param router - The site's router.
 * @param route - Where to go.
 * @param options - How the move is recorded and which parameters survive it.
 * @returns The address written.
 */
export function writeRoute<Tab extends string>(
  router: TabRouter<Tab>,
  route: TabRouteInput<Tab>,
  options: WriteRouteOptions = {},
): string {
  const current = currentAddress();
  const address = withKeptParams(router, route, current, options.keep ?? []);
  const location = pageLocation();
  const history = pageHistory();
  if (location === undefined || history === undefined) return address;

  const shown =
    router.mode === 'hash'
      ? location.hash
      : `${location.pathname}${location.search}`;
  if (shown === address) return address;

  const mode = options.history ?? 'auto';
  const from = router.parse(current);
  const to = router.parse(address);
  const sameTab = from.tab === to.tab && from.language === to.language;
  if (mode === 'replace' || (mode === 'auto' && sameTab)) {
    history.replaceState(history.state, '', address);
  } else {
    history.pushState(null, '', address);
  }
  globalThis.dispatchEvent?.(new Event(ROUTE_CHANGE_EVENT));
  return address;
}

/**
 * Follow every move: the browser's own — back, forward, an edited address — and
 * the app's, through {@link writeRoute}.
 * @param router - The site's router.
 * @param listener - Called with the route after each move.
 * @returns The function that stops listening.
 */
export function subscribeToRoute<Tab extends string>(
  router: TabRouter<Tab>,
  listener: (route: TabRoute<Tab>) => void,
): () => void {
  function handleChange(): void {
    listener(readRoute(router));
  }
  globalThis.addEventListener?.('popstate', handleChange);
  globalThis.addEventListener?.(ROUTE_CHANGE_EVENT, handleChange);
  return () => {
    globalThis.removeEventListener?.('popstate', handleChange);
    globalThis.removeEventListener?.(ROUTE_CHANGE_EVENT, handleChange);
  };
}

/**
 * The address on screen: path, query string and fragment.
 * @returns It, or `/` where there is no browser.
 */
export function currentAddress(): string {
  const location = pageLocation();
  if (location === undefined) return '/';
  return `${location.pathname}${location.search}${location.hash}`;
}

function withKeptParams<Tab extends string>(
  router: TabRouter<Tab>,
  route: TabRouteInput<Tab>,
  current: string,
  keep: readonly string[],
): string {
  const onScreen = router.parse(current);
  const language = route.language ?? onScreen.language;
  const target = router.format(
    language === undefined ? route : { ...route, language },
  );
  const named = route.params ?? {};
  const shown = onScreen.params;
  const kept: QueryEntry[] = [];
  for (const key of new Set([EMBED_PARAM, HIDE_PARAM, ...keep])) {
    if (Object.hasOwn(named, key)) continue;
    const value = shown[key];
    if (value !== undefined) kept.push([key, value]);
  }
  if (kept.length === 0) return target;
  const separator = target.includes('?') ? '&' : '?';
  return `${target}${separator}${formatQueryEntries(kept)}`;
}

function isBareRoot<Tab extends string>(router: TabRouter<Tab>): boolean {
  const location = pageLocation();
  if (location === undefined) return false;
  if (location.search !== '' || location.hash !== '') return false;
  return stripBasePath(router.basePath ?? '', location.pathname) === '/';
}
