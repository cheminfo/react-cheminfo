import { Callout, Spinner } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { SitePageOptions } from '../core/cardAddress.ts';

import { CardDetailsButton } from './CardDetailsButton.tsx';

/** What {@link CardStatus} reports. */
export interface CardStatusProps {
  /**
   * Why the answer could not be had: an error, or the reason in words.
   * @default undefined - the answer is on its way
   */
  failure?: Error | string;
  /**
   * How the site's page is read off the card's address.
   * @default {} - `card`, `embed` and `hide` are left out, and nothing else
   */
  address?: SitePageOptions;
  /**
   * Whether the way to the site's page is offered beside the status. A card
   * nested in another one, which offers its own, leaves it out.
   * @default true
   */
  details?: boolean;
}

/**
 * A card whose answer is on its way, or could not be had: a spinner, then
 * what went wrong, and the way to the site's page either way, since the page
 * may answer where the card could not. Its row is the card's first line, so
 * it leaves the chat's corner empty.
 * @param props - See {@link CardStatusProps}.
 * @returns The card's content until its answer comes.
 */
export function CardStatus(props: CardStatusProps): ReactElement {
  const { failure, address, details = true } = props;
  const t = useChromeT();
  const status =
    failure === undefined ? (
      <Spinner size={20} aria-label={t('card.loading')} />
    ) : (
      <Callout intent="warning" icon="search" compact>
        {typeof failure === 'string' ? failure : failure.message}
      </Callout>
    );
  if (!details) return status;
  return (
    <div className="card__end card__header">
      <div className="card__status">{status}</div>
      <CardDetailsButton address={address} />
    </div>
  );
}
