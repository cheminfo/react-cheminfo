import type { RefObject } from 'react';
import { useCallback, useSyncExternalStore } from 'react';

// Below this the bar has run out of room: the utilities keep their icons and
// give up their labels rather than pushing the pages off the edge.
const COMPACT_MAX_WIDTH = 1000;

export interface UseCompactHeaderOptions {
  /**
   * Width in pixels at or below which the bar counts as narrow.
   * @default 1000
   */
  maxWidth?: number;
}

/**
 * Whether the bar has run out of room, so its utilities should be reduced to
 * their icons and its page list allowed to fold away.
 *
 * The bar is measured rather than the window whenever a reference to it is
 * given, so a tool sitting beside a panel folds on its own width; with no
 * reference, or before the first paint, the window is what is read.
 * @param ref - The bar itself, usually the `app-header__inner` element.
 * @param options - The width at which the bar counts as narrow.
 * @returns True while the bar is too narrow to write every label.
 */
export function useCompactHeader(
  ref?: RefObject<HTMLElement | null>,
  options: UseCompactHeaderOptions = {},
): boolean {
  const { maxWidth = COMPACT_MAX_WIDTH } = options;

  const subscribe = useCallback(
    (onChange: () => void) => watchWidth(ref?.current ?? null, onChange),
    [ref],
  );
  const getSnapshot = useCallback(
    () => isCompactBar(ref?.current ?? null, maxWidth),
    [ref, maxWidth],
  );

  return useSyncExternalStore(subscribe, getSnapshot, notCompact);
}

/**
 * Whether a bar of this width has run out of room. An element that has not been
 * laid out yet, and a page with no window to measure, are both taken as roomy:
 * a bar that flashes its icons before its labels is worse than one that never
 * folds.
 * @param element - The bar, when there is one to measure.
 * @param maxWidth - Width at or below which it counts as narrow.
 * @returns True when the bar is narrow.
 */
export function isCompactBar(
  element: HTMLElement | null,
  maxWidth = COMPACT_MAX_WIDTH,
): boolean {
  const measured = element === null ? 0 : element.clientWidth;
  const width = measured > 0 ? measured : globalThis.innerWidth;

  if (!Number.isFinite(width) || width <= 0) return false;
  return width <= maxWidth;
}

function watchWidth(
  element: HTMLElement | null,
  onChange: () => void,
): () => void {
  if (element !== null && typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(onChange);
    observer.observe(element);
    return () => observer.disconnect();
  }

  globalThis.addEventListener('resize', onChange);
  return () => globalThis.removeEventListener('resize', onChange);
}

function notCompact(): boolean {
  return false;
}
