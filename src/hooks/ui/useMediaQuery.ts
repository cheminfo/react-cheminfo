import { useMemo, useSyncExternalStore } from 'react';

import { mediaQueryStore } from './mediaQueryStore.ts';

/**
 * Whether the page matches a media query, kept in step as the window — or the
 * frame the page is embedded in — is resized. A server render reads false.
 * @param query - The media query, e.g. `(width <= 52rem)`.
 * @returns Whether it matches.
 */
export function useMediaQuery(query: string): boolean {
  const store = useMemo(() => mediaQueryStore(query), [query]);
  return useSyncExternalStore(store.subscribe, store.matches, serverSnapshot);
}

function serverSnapshot(): boolean {
  return false;
}
