import type { ReactElement, ReactNode } from 'react';

import type { SitePageOptions } from '../core/cardAddress.ts';

import { CardDetailsButton } from './CardDetailsButton.tsx';
import type { CopyTableButtonProps } from './CopyTableButton.tsx';
import { CopyTableButton } from './CopyTableButton.tsx';

/** What {@link CardFoot} holds. */
export interface CardFootProps {
  /**
   * What is folded away: one `CardFold`, or several.
   * @default undefined - nothing is folded away
   */
  folds?: ReactNode;
  /**
   * The table the button beside Details copies.
   * @default undefined - no table, and no button
   */
  table?: CopyTableButtonProps;
  /**
   * The card's own actions, before Copy as table: the copy and the download
   * of a converted file, say.
   * @default undefined
   */
  actions?: ReactNode;
  /**
   * A remark at the start of the row, e.g. `The first 12 of 9,000 drawn`.
   * @default undefined
   */
  note?: ReactNode;
  /**
   * How Details reads the site's page off the card's address.
   * @default {} - `card`, `embed` and `hide` are left out, and nothing else
   */
  address?: SitePageOptions;
  /**
   * What the tooltip of Details says.
   * @default the chrome's own line, `Open in a new tab`
   */
  detailsTooltip?: string;
}

/**
 * The last row of a card, under a line: its actions — the card's own, the
 * copy of its table, the way to the site's page — at the foot, since a chat
 * keeps the card's top right corner for a control of its own. They float
 * right, so a remark or the line of a fold keeps clear of them while what a
 * fold opens takes the card's whole width below them. None of it prints.
 * @param props - See {@link CardFootProps}.
 * @returns The row, `card__foot`.
 */
export function CardFoot(props: CardFootProps): ReactElement {
  const { folds, table, actions, note, address, detailsTooltip } = props;
  return (
    <div className="card__foot">
      <div className="card__actions no-print">
        {actions}
        {table === undefined ? null : <CopyTableButton {...table} />}
        <CardDetailsButton address={address} tooltip={detailsTooltip} />
      </div>
      {note === undefined ? null : <p className="card__note">{note}</p>}
      {folds}
    </div>
  );
}
