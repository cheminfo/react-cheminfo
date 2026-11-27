import { useSyncExternalStore } from 'react';

import type { TourTarget } from './tourSteps.ts';
import { resolveTourTarget } from './tourSteps.ts';

/**
 * The element a step points at, looked for again on every change of the
 * page, with no deadline: a target drawn by a lazy chunk, or one a re-render
 * replaces, is found whenever it arrives.
 * @param target - The step's target.
 * @returns The element, or null while it is missing or hidden.
 */
export function useTourTarget(target: TourTarget): Element | null {
  return useSyncExternalStore(
    subscribeToPage,
    () => resolveTourTarget(target),
    noTarget,
  );
}

function subscribeToPage(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });
  return () => {
    observer.disconnect();
  };
}

function noTarget(): null {
  return null;
}
