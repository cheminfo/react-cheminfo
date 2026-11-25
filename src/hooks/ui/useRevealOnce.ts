import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

/**
 * Bring an element into view, once, as soon as it holds what it shows.
 *
 * A widget that builds itself after mounting — a chart drawn once its width
 * is measured (`useContainerSize`) — mounts as an empty box: scrolled
 * into view then, the box shows and what it grows into stays below the fold,
 * so the click that opened it seems to do nothing. The element is scrolled
 * the least that shows it (`block: 'nearest'`) in the commit where `laidOut`
 * first turns true, before the browser paints; later renders, and later
 * changes of `laidOut`, scroll nothing, so the reader's own scrolling is left
 * alone. The reveal waits for the measurement, never for a delay.
 * @param ref - Ref holding the element.
 * @param laidOut - Whether the element now holds what it shows: for a chart,
 *   that its size is known and it is drawn.
 */
export function useRevealOnce(
  ref: RefObject<Element | null>,
  laidOut: boolean,
): void {
  const revealed = useRef(false);
  useLayoutEffect(() => {
    if (!laidOut || revealed.current) return;
    const element = ref.current;
    if (element === null) return;
    revealed.current = true;
    element.scrollIntoView({ block: 'nearest' });
  }, [laidOut, ref]);
}
