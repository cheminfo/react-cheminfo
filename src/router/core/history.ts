/**
 * The tab router bound to the browser: read the address on screen, write a new
 * one through the History API, and hear every move.
 *
 * The router itself stays pure. Everything here reads `globalThis.location` and
 * writes `globalThis.history`, and does nothing where neither exists, so a
 * prerender script can import a module that uses it.
 */

import { EMBED_PARAM, HIDE_PARAM } from '../../share/core/config.ts';

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
 * adopts such links.
 * @param router - The site's router.
 * @returns The route of the address on screen, or of `/` where there is no browser.
 */
export function readRoute<Tab extends string>(
  router: TabRouter<Tab>,
): TabRoute<Tab> {
  const address = currentAddress();
  const adopted = router.legacyAddress(address);
  if (adopted === null) return router.parse(address);
  const history = browserHistory();
  history?.replaceState(history.state, '', adopted);
  globalThis.dispatchEvent?.(new Event(ROUTE_CHANGE_EVENT));
  return router.parse(adopted);
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
 * remove it — is the route's. Writing the address already on screen does
 * nothing, so echoing state back into the address cannot loop.
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
  const location = browserLocation();
  const history = browserHistory();
  if (location === undefined || history === undefined) return address;

  const shown =
    router.mode === 'hash'
      ? location.hash
      : `${location.pathname}${location.search}`;
  if (shown === address) return address;

  const mode = options.history ?? 'auto';
  const sameTab = router.parse(current).tab === router.parse(address).tab;
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
  const location = browserLocation();
  if (location === undefined) return '/';
  return `${location.pathname}${location.search}${location.hash}`;
}

function withKeptParams<Tab extends string>(
  router: TabRouter<Tab>,
  route: TabRouteInput<Tab>,
  current: string,
  keep: readonly string[],
): string {
  const target = router.format(route);
  const named = route.params ?? {};
  const shown = router.parse(current).params;
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

function browserLocation(): Location | undefined {
  return globalThis.location;
}

function browserHistory(): History | undefined {
  return globalThis.history;
}
