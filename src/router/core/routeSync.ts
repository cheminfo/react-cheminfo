/**
 * The two-way binding between a site's address and its state: the address is
 * applied as the page opens and after every move, the state is written back
 * into the address whenever it changes, and the head follows.
 *
 * The state is followed by the site's own signals `effect`, created after the
 * opening route has been applied, so it runs with the state the address just
 * set and never writes a deep link over with the defaults of a render earlier.
 */

import type { StartDocumentMetaOptions } from '../../seo/core/startDocumentMeta.ts';
import { startDocumentMeta } from '../../seo/core/startDocumentMeta.ts';

/** How a site's address and state are bound. */
export interface RouteSyncOptions<Route> {
  /** The route of the address on screen. */
  read: () => Route;
  /** Be told after every move of the address; returns the stop. */
  subscribe: (listener: () => void) => () => void;
  /** Write a route into the address. */
  write: (route: Route) => void;
  /** Set the state as a route says. */
  apply: (route: Route) => void;
  /** The route the state on screen is at. */
  current: () => Route;
  /** `effect` from the site's signals. */
  effect: (callback: () => void) => () => void;
  /**
   * The route the page opens on, where it differs from the address: a bare
   * root steered to the reader's language.
   * @default `read`
   */
  opening?: () => Route;
  /**
   * The head of every page, followed with `effect`.
   * @default undefined — the head is left alone
   */
  meta?: Omit<StartDocumentMetaOptions, 'follow'>;
}

/**
 * Bind a site's address and state, and its head.
 * @param options - How the route is read, written, applied and read back.
 * @returns The function that stops all three.
 */
export function startRouteSync<Route>(
  options: RouteSyncOptions<Route>,
): () => void {
  const { read, subscribe, write, apply, current, effect, meta } = options;
  const { opening = read } = options;
  apply(opening());
  const stopFollowing = subscribe(() => {
    apply(read());
  });
  const stopWriting = effect(() => {
    write(current());
  });
  const stopTitling = meta
    ? startDocumentMeta({ ...meta, follow: effect })
    : undefined;
  return () => {
    stopFollowing();
    stopWriting();
    stopTitling?.();
  };
}
