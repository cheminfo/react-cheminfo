/**
 * What a stepper is drawn with: one sunken track holding two square buttons
 * and the value between them.
 *
 * They are their own module because the three rules are read together — the
 * track's padding, the button's side and the value's width have to add up to
 * the control height the rest of the card is built on, and a change to one of
 * them that is not a change to the others is a bug.
 */

import type { CSSProperties } from 'react';

import type { OverlayMetrics } from '../core/overlayMetrics.ts';

/**
 * The two buttons of a stepper and the value between them.
 *
 * They are packed tighter than the card's own gap so the three read as one
 * control rather than as two buttons that happen to sit beside a number.
 * @param metrics - The measurements the card is drawn from.
 * @returns The stepper's rules.
 */
export function overlayStepperStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0,
    height: metrics.controlHeight,
    padding: 2,
    borderRadius: metrics.controlRadius,
    background: 'var(--surface-sunken)',
  };
}

/**
 * One of a stepper's two buttons.
 *
 * Square and unpadded, because a stepper's job is to be pressed repeatedly and
 * the two buttons should sit within a thumb's width of each other. Blueprint's
 * own button carries the padding of a button that holds a word, which is what
 * made `− 2 +` measure ninety-six pixels for a single digit.
 *
 * At the end of its range the button fades and stops offering the pointer a
 * hand. A `disabled` attribute alone stops the click but says nothing before
 * it: the reader presses `+` on a four-component model, nothing happens, and
 * the only reading available to them is that the control is broken.
 * @param metrics - The measurements the card is drawn from.
 * @param spent - Whether the range has no more room in this direction.
 * @returns The button's rules.
 */
export function overlayStepperButtonStyle(
  metrics: OverlayMetrics,
  spent: boolean,
): CSSProperties {
  const side = metrics.controlHeight - 4;
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: side,
    height: side,
    padding: 0,
    border: 'none',
    borderRadius: Math.max(3, metrics.controlRadius - 2),
    background: 'transparent',
    color: spent ? 'var(--text-faint)' : 'var(--text-muted)',
    font: 'inherit',
    fontSize: metrics.fontSize + 1,
    lineHeight: 1,
    cursor: spent ? 'default' : 'pointer',
    opacity: spent ? 0.45 : 1,
  };
}

/**
 * The value a stepper is showing.
 *
 * The digits are tabular and the box is held at the width of the longest value
 * the range can produce, because a value that changes width as the reader
 * steps through it drags the buttons out from under the pointer that is
 * pressing them — and stepping from 9 to 10 is exactly when the reader is
 * pressing the same button repeatedly.
 * @param metrics - The measurements the card is drawn from.
 * @param widest - How many characters the longest value writes.
 * @returns The value's rules.
 */
export function overlayNumberValueStyle(
  metrics: OverlayMetrics,
  widest: number,
): CSSProperties {
  return {
    minWidth: Math.max(
      metrics.fontSize,
      Math.ceil(widest * metrics.fontSize * CHARACTER_WIDTH),
    ),
    padding: '0 3px',
    color: 'var(--text)',
    fontSize: metrics.fontSize,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
    userSelect: 'none',
  };
}

/**
 * How wide one tabular digit is, as a fraction of the type size.
 *
 * Six tenths of an em is what the interface faces of every platform the family
 * runs on set their figures at; a unit written in letters is narrower than
 * that, so the reserved width errs wide and the buttons never move.
 */
const CHARACTER_WIDTH = 0.6;
