import { Button, Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useEffect } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { pageLocation } from '../../router/core/pageAddress.ts';
import { useActionTooltip } from '../../shared/ui/useActionTooltip.ts';
import type { SitePageOptions } from '../core/cardAddress.ts';
import { sitePageUrl } from '../core/cardAddress.ts';

import {
  CARD_TOOLTIP_CLASS,
  CARD_TOOLTIP_DELAY,
  CARD_TOOLTIP_MODIFIERS,
} from './cardTooltip.ts';
import { loadEmbed, loadedEmbed } from './embed.ts';

/** What {@link CardDetailsButton} opens. */
export interface CardDetailsButtonProps {
  /**
   * Writes the address of the page the button opens, when it is pressed.
   * @default the card's own address without `card`, `embed`, `hide` and
   *   what `address` says only the card reads — `sitePageUrl` over the page's
   *   address, the one a sealed link holds in memory included
   */
  page?: () => string;
  /**
   * How the default page is read off the card's address.
   * @default {} - `card`, `embed` and `hide` are left out, and nothing else
   */
  address?: SitePageOptions;
  /**
   * What the tooltip says the button does.
   * @default the chrome's own line, `Open in a new tab`
   */
  tooltip?: string;
  /**
   * Value of the `data-testid` attribute of the button.
   * @default 'card-details'
   */
  testId?: string;
}

/**
 * The way from a card to the site's own page it stands for, with its chrome,
 * at the end of the card: a chat keeps the card's top right corner for its own
 * control. Framed by a chat, the page opens in a new tab, so the conversation
 * keeps its place; opened on its own, the card becomes the page. It never
 * prints.
 * @param props - See {@link CardDetailsButtonProps}.
 * @returns The button, with the tooltip saying where the page opens.
 */
export function CardDetailsButton(props: CardDetailsButtonProps): ReactElement {
  const { page, address, tooltip, testId = 'card-details' } = props;
  const t = useChromeT();
  const { isOpen, target } = useActionTooltip(false, CARD_TOOLTIP_DELAY);
  useEffect(() => {
    loadEmbed().catch(() => undefined);
  }, []);
  return (
    <Tooltip
      content={tooltip ?? t('card.detailsTitle')}
      placement="top-end"
      modifiers={CARD_TOOLTIP_MODIFIERS}
      popoverClassName={CARD_TOOLTIP_CLASS}
      isOpen={isOpen}
    >
      <span className="no-print" style={WRAP_STYLE} {...target}>
        <Button
          variant="minimal"
          size="small"
          icon="share"
          text={t('card.details')}
          aria-label={t('card.detailsLabel')}
          data-testid={testId}
          onClick={() => {
            const url = page === undefined ? cardSitePage(address) : page();
            const embed = loadedEmbed();
            if (embed === undefined) {
              void loadEmbed().then((module) => module.openSitePage(url));
            } else {
              embed.openSitePage(url);
            }
          }}
        />
      </span>
    </Tooltip>
  );
}

/**
 * The site's page behind the card on screen, read when the button is
 * pressed: the page's own address — held in memory under a sealed link — on
 * the origin the card is served from.
 * @param address - What only the card reads.
 * @returns The page's absolute address.
 */
function cardSitePage(address: SitePageOptions | undefined): string {
  const { origin } = globalThis.location;
  const { pathname, search } = pageLocation() ?? globalThis.location;
  return sitePageUrl({ origin, pathname, search }, address);
}

const WRAP_STYLE = { display: 'inline-flex' } as const satisfies CSSProperties;
