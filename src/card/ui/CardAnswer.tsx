import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

import { CardFold } from './CardFold.tsx';
import type { CardFootProps } from './CardFoot.tsx';
import { CardFoot } from './CardFoot.tsx';
import { CardFrame } from './CardFrame.tsx';
import type { CopyTableButtonProps } from './CopyTableButton.tsx';

/** What a {@link CardAnswer} folds away, behind one line saying what it is. */
export interface CardMore {
  /** The line the closed fold shows. */
  summary: ReactNode;
  /** What it opens on. */
  content: ReactNode;
  /**
   * The table it shows, copied by the action beside Details while it is
   * open.
   * @default undefined - nothing to copy as a table
   */
  table?: CopyTableButtonProps;
  /**
   * Lay what it opens on out as a column, its parts 6px apart.
   * @default false - the parts are blocks, spaced by their own margins
   */
  stack?: boolean;
}

/** What {@link CardAnswer} shows. */
export interface CardAnswerProps extends Omit<CardFootProps, 'folds'> {
  /** The answer itself, read first, on the card's first line. */
  lead: ReactNode;
  /**
   * What comes under it, e.g. a figure.
   * @default undefined
   */
  children?: ReactNode;
  /**
   * The secondary information, closed until the reader opens it.
   * @default undefined - nothing is folded away
   */
  more?: CardMore;
  /**
   * Class beside `card__header` on the lead, so a site can lay it out.
   * @default undefined
   */
  leadClassName?: string;
  /**
   * Class beside `card`, so a site can reach the card from its stylesheet.
   * @default undefined
   */
  className?: string;
  /**
   * Lay the card out as a column, its parts 8px apart.
   * @default false - the parts are blocks, spaced by their own margins
   */
  stack?: boolean;
  /**
   * Value of the `data-testid` attribute of the card.
   * @default 'answer-card'
   */
  testId?: string;
}

/**
 * A whole card: the answer first, on the line that leaves the chat's corner
 * free, what comes under it, then the last row — the details folded away, the
 * copy of the card's table and the way to the site's page. The table copied is
 * the card's own when it has one, else the one the open fold shows.
 * @param props - See {@link CardAnswerProps}.
 * @returns The card, fitted to the frame a chat shows it in.
 */
export function CardAnswer(props: CardAnswerProps): ReactElement {
  const {
    lead,
    children,
    more,
    table: own,
    leadClassName,
    className,
    stack = false,
    testId = 'answer-card',
    ...foot
  } = props;
  const [open, setOpen] = useState(false);
  const table = own ?? (open ? more?.table : undefined);
  return (
    <CardFrame className={className} stack={stack} testId={testId}>
      <div className={joinClassNames('card__header', leadClassName)}>
        {lead}
      </div>
      {children}
      <CardFoot
        {...foot}
        table={table}
        folds={
          more === undefined ? undefined : (
            <CardFold
              summary={more.summary}
              stack={more.stack}
              onToggle={setOpen}
            >
              {more.content}
            </CardFold>
          )
        }
      />
    </CardFrame>
  );
}
