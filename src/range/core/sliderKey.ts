/**
 * Where a key moves the value of a slider, as the WAI-ARIA slider pattern
 * has it: an arrow a step, with Shift a page; Page Up and Page Down a page;
 * Home and End to the ends. Every slider of the family — a threshold over its
 * histogram, an anchor of a colour scale — answers the same keys the same way.
 */

import { stepNumber } from '../../number/core/numberText.ts';

/** How far the keys move a slider's value, and how far it may go. */
export interface SliderKeySteps {
  /** The lowest value. */
  min: number;
  /** The highest value. */
  max: number;
  /** What an arrow key moves it by. */
  step: number;
  /**
   * What Page Up and Page Down move it by, and an arrow key with Shift.
   * @default ten steps
   */
  page?: number;
}

/** A key pressed: which, and whether Shift was held. */
export interface SliderKey {
  /** The key, as `KeyboardEvent.key` names it. */
  key: string;
  /** Shift was held. */
  shiftKey: boolean;
}

/**
 * The value a key moves a slider to, kept between its ends and rounded to
 * the decimals its value and its step carry, so stepping leaves no float dust.
 * @param value - The value now.
 * @param key - The key pressed.
 * @param steps - See {@link SliderKeySteps}.
 * @returns The value, or `null` for a key that moves nothing.
 */
export function sliderKeyValue(
  value: number,
  key: SliderKey,
  steps: SliderKeySteps,
): number | null {
  const { min, max, step, page = step * 10 } = steps;
  let next: number;
  switch (key.key) {
    case 'Home':
      next = min;
      break;
    case 'End':
      next = max;
      break;
    case 'PageUp':
      next = stepNumber(value, page);
      break;
    case 'PageDown':
      next = stepNumber(value, -page);
      break;
    default: {
      const direction = ARROWS[key.key];
      if (direction === undefined) return null;
      next = stepNumber(value, direction * (key.shiftKey ? page : step));
    }
  }
  return Math.min(max, Math.max(min, next));
}

/** Which way each arrow key moves a slider: right and up raise it. */
const ARROWS: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowUp: 1,
  ArrowLeft: -1,
  ArrowDown: -1,
};
