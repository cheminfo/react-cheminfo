import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { SitePageOptions } from '../core/cardAddress.ts';

import { CardDetailsButton } from './CardDetailsButton.tsx';

/** Where {@link CardMissing} leads. */
export interface CardMissingProps {
  /**
   * How the site's page is read off the card's address.
   * @default {} - `card`, `embed` and `hide` are left out, and nothing else
   */
  address?: SitePageOptions;
}

/**
 * What a card shows for a page that has none: says so, and leads to the page
 * itself. Its row is the card's first line, so it leaves the chat's corner
 * empty.
 * @param props - See {@link CardMissingProps}.
 * @returns The card's content.
 */
export function CardMissing(props: CardMissingProps): ReactElement {
  const t = useChromeT();
  return (
    <div className="card__end card__header">
      <p className="card__note">{t('card.missing')}</p>
      <CardDetailsButton address={props.address} />
    </div>
  );
}
