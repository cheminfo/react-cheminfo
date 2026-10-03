/**
 * When a tooltip on a control that is pressed should be on screen.
 *
 * Such a control is where a hover tooltip goes wrong, in two ways that look
 * like one. What it opens lands over the control, so the `mouseleave` that
 * would close the card is never delivered and the card is left on screen, over
 * the thing it was explaining. And the open is *scheduled*: a press within the
 * hover delay cancels nothing, so the card appears after the press, outlives
 * what was opened, and comes back when it is closed — with the pointer long
 * gone.
 *
 * Blueprint's own hover handling cannot be told either of those, so the state
 * is held here and Blueprint is told only when to draw.
 *
 * The card is a pointer affordance only, and deliberately does not open on
 * focus: what a control opens hands the focus back as it closes, which would
 * put the card on screen with the pointer long gone. Nothing is lost by it —
 * the control carries the same words as its accessible name, which is what a
 * screen reader reads.
 */

import { useEffect, useRef, useState } from 'react';

/** The handlers the target carries, which decide when the card is drawn. */
export interface ActionTooltipTarget {
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onPointerDownCapture: () => void;
  onClickCapture: () => void;
  onBlurCapture: () => void;
}

/** Whether the card is drawn, and what decides it. */
export interface ActionTooltipState {
  /** What to give the tooltip as `isOpen`. */
  isOpen: boolean;
  /** What to give the target, or the element wrapping it. */
  target: ActionTooltipTarget;
}

/** Long enough that sweeping the pointer across a row of controls opens none. */
export const ACTION_TOOLTIP_DELAY = 250;

/**
 * Hold a tooltip's hover, so a press closes it and nothing reopens it until
 * the pointer leaves the control and comes back.
 * @param opened - Whether what the control opens is on screen; while it is,
 * the card stays shut.
 * @param delay - How long the pointer rests before the card is drawn, in
 * milliseconds. A card heavier than a line of text asks for longer.
 * @returns Whether to draw the card, and the handlers that decide it.
 */
export function useActionTooltip(
  opened = false,
  delay = ACTION_TOOLTIP_DELAY,
): ActionTooltipState {
  const [shown, setShown] = useState(false);
  const waiting = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set by the press, and cleared only by the pointer actually leaving. It is
  // what the pointer never leaving looks like: the dialog lands over the
  // control, and removing it again makes the browser hand the control a fresh
  // `pointerenter` — with the pointer never having moved. Clearing the latch
  // there, or on the focus the dialog gives back as it closes, is what made
  // the card reappear the moment the dialog was dismissed.
  const pressed = useRef(false);

  function cancel(): void {
    if (waiting.current !== null) clearTimeout(waiting.current);
    waiting.current = null;
  }

  function hide(): void {
    cancel();
    setShown(false);
  }

  function press(): void {
    pressed.current = true;
    hide();
  }

  useEffect(() => cancel, []);

  return {
    isOpen: shown && !opened,
    target: {
      onPointerEnter: () => {
        if (pressed.current) return;
        cancel();
        waiting.current = setTimeout(() => setShown(true), delay);
      },
      onPointerLeave: () => {
        pressed.current = false;
        hide();
      },
      onPointerDownCapture: press,
      // Enter and Space fire no pointer event, so a control worked from the
      // keyboard is let go of here instead.
      onClickCapture: press,
      onBlurCapture: hide,
    },
  };
}
