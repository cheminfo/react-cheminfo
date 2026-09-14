import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import {
  currentAddress,
  readRoute,
  subscribeToRoute,
} from '../core/history.ts';
import type { TabRoute, TabRouter } from '../core/tabRouter.ts';

/**
 * The route the browser is showing, re-rendered on every move — back, forward,
 * and every `writeRoute` the app makes.
 *
 * A legacy hash link is replaced by its path once, after the first render, when
 * the router adopts such links.
 * @param router - The site's router, created once at module level.
 * @returns The route of the address on screen.
 */
export function useTabRoute<Tab extends string>(
  router: TabRouter<Tab>,
): TabRoute<Tab> {
  const subscribe = useCallback(
    (onChange: () => void) => subscribeToRoute(router, onChange),
    [router],
  );
  const address = useSyncExternalStore(
    subscribe,
    currentAddress,
    currentAddress,
  );
  useEffect(() => {
    readRoute(router);
  }, [router]);
  return useMemo(() => router.parse(address), [router, address]);
}
