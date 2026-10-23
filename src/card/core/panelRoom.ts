/**
 * Room in the frame for a panel a card opens over itself.
 *
 * A chat sizes the frame of a card from the card's own height, and a popover
 * or a dialog opened from the card — the panel that copies or saves a figure,
 * the notations of a structure — is drawn over the card inside that frame.
 * Taller than the card, it would be cut off at the frame's edge, its Copy
 * button with it. So while one is open the card is made as tall as the panel
 * needs, which grows the frame with it.
 */

/** What one open panel needs of the frame. */
export interface OpenPanel {
  /**
   * `dialog`: centred in the frame; `popover`: hung beside or under the
   * control that opened it.
   */
  kind: 'dialog' | 'popover';
  /**
   * Its height with nothing scrolled away, in pixels: a dialog's body scrolls
   * past 70 % of the frame, which is no height at all in a frame of 260. A
   * dialog's margins are counted in.
   */
  height: number;
  /**
   * Where a popover ends as it is placed, in pixels from the top of the card:
   * one opened at the pointer, or from a control outside the card, hangs lower
   * than the control it is reckoned from.
   * @default undefined - reckoned from the control alone
   */
  bottom?: number;
}

/**
 * Between a popover and its control, arrow included, and under the popover:
 * enough for one hung under its control, and a margin for one beside it.
 */
const POPOVER_SPACE = 24;

/** Under a popover placed where it is, so that its shadow is not cut. */
const POPOVER_GAP = 8;

/**
 * How tall the card must be for every open panel to fit in its frame.
 * @param panels - The panels on screen.
 * @param anchor - Where the lowest control whose popover is open ends, in
 *   pixels from the top of the card; a popover hangs from it.
 * @returns The least height of the card, or 0 when no panel is open.
 */
export function roomForPanels(
  panels: readonly OpenPanel[],
  anchor: number,
): number {
  let room = 0;
  for (const panel of panels) {
    let needed = panel.height;
    if (panel.kind === 'popover') {
      needed = anchor + panel.height + POPOVER_SPACE;
      if (panel.bottom !== undefined && panel.bottom + POPOVER_GAP > needed) {
        needed = panel.bottom + POPOVER_GAP;
      }
    }
    if (needed > room) room = needed;
  }
  return Math.ceil(room);
}
