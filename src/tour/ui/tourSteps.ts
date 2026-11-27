import type { Placement } from '@floating-ui/react-dom';
import type { ReactNode } from 'react';

/** What a step points at: a CSS selector, or a function finding the element. */
export type TourTarget = string | (() => Element | null);

/** One step of a guided tour: what to do, and where. */
export interface TourStep {
  /** Names the step; the same on every render. */
  id: string;
  /**
   * The element the card points at. While it is not on the page, the card
   * waits in the corner of the window.
   */
  target: TourTarget;
  /** What to do, in a few words. */
  title: string;
  /**
   * One sentence more: what doing it shows.
   * @default undefined
   */
  body?: ReactNode;
  /**
   * The side of the target the card opens on.
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * Whether the visitor has done what the step asks. The tour moves on as
   * soon as it turns true, and comes back to the step if it turns false
   * again. Left out, the step asks for nothing and its card offers Next.
   * @default undefined
   */
  done?: boolean;
}

/**
 * The step on show: the first one that is neither done nor passed with Next.
 * @param steps - The tour.
 * @param passed - The ids of the steps passed with Next.
 * @returns Its index, or -1 once every step is behind.
 */
export function currentTourStep(
  steps: readonly TourStep[],
  passed: ReadonlySet<string>,
): number {
  for (let index = 0; index < steps.length; index++) {
    const step = steps[index];
    if (step === undefined || step.done === true) continue;
    if (step.done === undefined && passed.has(step.id)) continue;
    return index;
  }
  return -1;
}

/**
 * The element a step points at, when it is on the page and drawn.
 * @param target - The step's target.
 * @returns The element, or null while it is missing or hidden.
 */
export function resolveTourTarget(target: TourTarget): Element | null {
  const element =
    typeof target === 'string' ? document.querySelector(target) : target();
  if (element === null || element.getClientRects().length === 0) return null;
  return element;
}
