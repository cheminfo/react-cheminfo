import { useEffect, useRef } from 'react';

import type { RouteSyncOptions } from '../core/routeSync.ts';
import { startRouteSync } from '../core/routeSync.ts';

/**
 * Bind a site's address and state while the component is mounted: the
 * address applied as the page opens and after every move, the state written
 * back as it changes, and the head followed. Run once; the options of the
 * first render are the ones used.
 * @param options - How the route is read, written, applied and read back.
 */
export function useRouteSync<Route>(options: RouteSyncOptions<Route>): void {
  const first = useRef(options);
  useEffect(() => startRouteSync(first.current), []);
}
