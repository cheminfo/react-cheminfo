import type { TooltipProps } from '@blueprintjs/core';

import { HELP_OPEN_DELAY } from './helpDelay.ts';

/**
 * What a react-science `Toolbar.Item` takes as `tooltipProps` so that its help
 * opens as the family's help card: the card's class, after the family's help
 * delay rather than Blueprint's 100 ms, and neither the compact padding nor
 * the intent colour the item gives its tooltip, both of which Blueprint
 * styles more specifically than the card.
 */
export const HELP_CARD_TOOLTIP_PROPS = {
  popoverClassName: 'help-tooltip',
  hoverOpenDelay: HELP_OPEN_DELAY,
  compact: false,
  intent: 'none',
} as const satisfies Partial<TooltipProps>;
