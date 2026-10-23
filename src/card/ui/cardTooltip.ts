import type { PopoverProps } from '@blueprintjs/core';

/**
 * The family's help card, at the width of the few words a card's action
 * says: `styles/card.css` lets `card-tooltip` shrink to its text.
 */
export const CARD_TOOLTIP_CLASS = 'help-tooltip card-tooltip';

/**
 * Where a card's tooltip goes when the frame has no room above its control:
 * beside it, rather than cut by the frame's edge.
 */
export const CARD_TOOLTIP_MODIFIERS: PopoverProps['modifiers'] = {
  flip: { options: { fallbackPlacements: ['left'] } },
};

/** How long the pointer rests on an action of a card before it is named. */
export const CARD_TOOLTIP_DELAY = 300;
