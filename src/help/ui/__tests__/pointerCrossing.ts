/**
 * The pointer crossing onto a control as every engine reports it, for the
 * tests of the family's help cards: the pointer's boundary event, then the
 * mouse's, and — for a pointer that moved there rather than a control that
 * came under it — the move (`pointerIntent.ts`). A card opens, or not, once
 * the family's help delay has passed.
 */

import { act } from 'react';
import { vi } from 'vitest';

import { HELP_OPEN_DELAY } from '../helpDelay.ts';

/** How the pointer reached the control. */
export interface CrossingOptions {
  /** The pointer moved onto it; `false` for a control that came under a pointer standing still. */
  moved: boolean;
  /**
   * Where the pointer came from.
   * @default null — from outside the document
   */
  from?: Element | null;
}

/**
 * The pointer crossing onto a control.
 * @param target - Where the pointer lands: the control, or its glyph.
 * @param options - See {@link CrossingOptions}.
 */
export function cross(target: Element, options: CrossingOptions): void {
  const { moved, from = null } = options;
  act(() => {
    target.dispatchEvent(
      new MouseEvent('pointerover', { bubbles: true, relatedTarget: from }),
    );
    target.dispatchEvent(
      new MouseEvent('mouseover', { bubbles: true, relatedTarget: from }),
    );
    if (moved) {
      target.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }));
    }
  });
}

/**
 * The cards open once the family's help delay has passed (the tests run on
 * fake timers).
 * @returns What each open card says.
 */
export function cardsAfterTheDelay(): string[] {
  act(() => {
    vi.advanceTimersByTime(HELP_OPEN_DELAY + 50);
  });
  return Array.from(
    document.querySelectorAll('.help-tooltip'),
    (card) => card.textContent ?? '',
  );
}
