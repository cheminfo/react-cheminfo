/** The subscription `useSyncExternalStore` reads a media query through. */
export interface MediaQueryStore {
  /** Listen to the query starting or stopping to match; returns the stop. */
  subscribe: (listener: () => void) => () => void;
  /** Whether the query matches now: false where there is no `matchMedia`. */
  matches: () => boolean;
}

/**
 * The store of one media query, read off `globalThis.matchMedia` each time so
 * a page without a window — a test, a prerender — reads it as not matching.
 * @param query - The media query, e.g. `(width <= 52rem)`.
 * @returns Its subscription and its snapshot.
 */
export function mediaQueryStore(query: string): MediaQueryStore {
  return {
    subscribe(listener) {
      if (typeof globalThis.matchMedia !== 'function') return noop;
      const list = globalThis.matchMedia(query);
      list.addEventListener('change', listener);
      return () => {
        list.removeEventListener('change', listener);
      };
    },
    matches() {
      return (
        typeof globalThis.matchMedia === 'function' &&
        globalThis.matchMedia(query).matches
      );
    },
  };
}

function noop(): void {
  // Nothing was listened to, so there is nothing to stop.
}
