import type { TooltipProps } from '@blueprintjs/core';
import { useEffect, useState } from 'react';

import { HELP_CARD_TOOLTIP_PROPS } from './helpCardTooltipProps.ts';
import { helpCardMayOpen, watchPresses } from './pointerIntent.ts';

/** What one help card takes as its tooltip's props. */
export type HelpCardTooltipProps = typeof HELP_CARD_TOOLTIP_PROPS &
  Pick<TooltipProps, 'isOpen' | 'onInteraction'>;

/**
 * The help cards of a toolbar or a bar, one open at a time: each opens as the
 * family's help card, after the family's help delay, for a pointer that moved
 * over its target or a keyboard's focus — never for a control the layout moved
 * under a pointer standing still, which would cover the result the reader is
 * looking at — and a press closes it until the pointer has left the target
 * and come back (`pointerIntent.ts`).
 * @returns For an item's key, what its tooltip takes: a react-science
 *   `Toolbar.Item`'s `tooltipProps`, or a Blueprint `Tooltip`'s props.
 */
export function useHelpCards(): (key: string) => HelpCardTooltipProps {
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => watchPresses(() => setOpen(null)), []);
  return (key) => ({
    ...HELP_CARD_TOOLTIP_PROPS,
    isOpen: open === key,
    onInteraction: (next, event) => {
      if (!next) {
        setOpen((current) => (current === key ? null : current));
      } else if (helpCardMayOpen(event)) {
        setOpen(key);
      }
    },
  });
}
