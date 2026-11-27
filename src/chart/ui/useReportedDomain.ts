import { useLayoutEffect, useRef } from 'react';

import type { ChartDomain } from '../core/chartDomain.ts';
import { sameChartDomain } from '../core/chartDomain.ts';

/**
 * Tell the host which window a chart now shows, whenever it moves.
 *
 * Before the browser paints, so a host that stores the window and hands it
 * back does so in the frame the gesture landed in rather than the one after.
 * A chart holding nothing still builds scales on a placeholder window, and a
 * placeholder reported would become a window the host imposes on whatever is
 * added next — drawn entirely off screen — so nothing is reported then.
 * @param shown - The window the chart shows.
 * @param onDomainChange - Told each new window.
 * @param holdsNothing - Whether the chart has nothing to draw.
 */
export function useReportedDomain<Domain extends ChartDomain>(
  shown: Domain,
  onDomainChange: ((domain: Domain) => void) | undefined,
  holdsNothing: boolean,
): void {
  const reported = useRef(shown);
  useLayoutEffect(() => {
    if (holdsNothing || sameChartDomain(reported.current, shown)) return;
    reported.current = shown;
    onDomainChange?.(shown);
  }, [holdsNothing, shown, onDomainChange]);
}
