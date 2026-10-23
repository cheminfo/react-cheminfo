/**
 * The dialogs and popovers Blueprint has open over a card, measured as the
 * room each needs of the card's frame.
 */

import { Classes } from '@blueprintjs/core';

import type { OpenPanel } from '../core/panelRoom.ts';

/** The panels on screen, and the elements measured for them. */
export interface FoundPanels {
  /** What each panel needs. */
  found: OpenPanel[];
  /** The elements whose size the panels are read from. */
  elements: HTMLElement[];
}

const OPEN = `.${Classes.OVERLAY_OPEN}`;

/** A tooltip is read in passing and closes as the pointer leaves: no room. */
const POPOVERS = `${OPEN} .${Classes.POPOVER}:not(.${Classes.TOOLTIP})`;

const DIALOGS = `${OPEN} .${Classes.DIALOG}`;

/** A dialog's body, which scrolls past 70 % of the frame's height. */
const SCROLLED = `.${Classes.DIALOG_BODY_SCROLL_CONTAINER}`;

/**
 * A control whose popover is open: Blueprint marks its own target, and a
 * toolbar that renders its target itself — the 3D view's — says it is
 * expanded.
 */
const OPEN_CONTROLS = `.${Classes.POPOVER_OPEN}, [aria-expanded='true']`;

/**
 * The dialogs and popovers on screen, and the room each needs.
 * @param card - The card they are opened over.
 * @returns The panels, and the elements measured for them.
 */
export function openPanels(card: HTMLElement): FoundPanels {
  const found: OpenPanel[] = [];
  const elements: HTMLElement[] = [];
  const top = card.getBoundingClientRect().top;
  for (const dialog of document.querySelectorAll<HTMLElement>(DIALOGS)) {
    const { marginTop, marginBottom } = globalThis.getComputedStyle(dialog);
    const margins =
      (parseLength(marginTop) ?? 0) + (parseLength(marginBottom) ?? 0);
    found.push({ kind: 'dialog', height: unscrolledHeight(dialog) + margins });
    elements.push(dialog);
  }
  for (const popover of document.querySelectorAll<HTMLElement>(POPOVERS)) {
    // The box that places a popover is never scaled while it opens, so it
    // says where the popover ends; the popover itself is, at first.
    const placed = popover.parentElement?.classList.contains(
      Classes.POPOVER_TRANSITION_CONTAINER,
    )
      ? popover.parentElement
      : popover;
    const bottom = placed.getBoundingClientRect().bottom - top;
    found.push({
      kind: 'popover',
      height: unscrolledHeight(popover),
      ...(bottom > 0 && { bottom }),
    });
    elements.push(popover);
  }
  return { found, elements };
}

/**
 * Where the lowest control of the card whose popover is open ends.
 * @param card - The card.
 * @returns Its bottom edge, in pixels from the top of the card; 0 for none.
 */
export function anchorBottom(card: HTMLElement): number {
  const top = card.getBoundingClientRect().top;
  let bottom = 0;
  for (const control of card.querySelectorAll(OPEN_CONTROLS)) {
    const edge = control.getBoundingClientRect().bottom - top;
    if (edge > bottom) bottom = edge;
  }
  return bottom;
}

/**
 * The panel's height with what its body scrolls away put back.
 * @param panel - The dialog or the popover.
 * @returns Its height, in pixels.
 */
function unscrolledHeight(panel: HTMLElement): number {
  let height = panel.offsetHeight;
  for (const body of panel.querySelectorAll<HTMLElement>(SCROLLED)) {
    height += body.scrollHeight - body.clientHeight;
  }
  return height;
}

/**
 * A computed length, in pixels.
 * @param value - E.g. `30px`; empty where nothing computes it.
 * @returns The number, or undefined when it is not one.
 */
function parseLength(value: string): number | undefined {
  const length = Number.parseFloat(value);
  return Number.isFinite(length) ? length : undefined;
}
