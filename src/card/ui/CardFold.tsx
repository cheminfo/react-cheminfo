import type { ReactElement, ReactNode } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

/** What {@link CardFold} folds away. */
export interface CardFoldProps {
  /** The line the closed fold shows, e.g. `All 26 known isotopes`. */
  summary: ReactNode;
  /** What it opens on. */
  children: ReactNode;
  /**
   * Open the fold when the card is drawn.
   * @default false - closed until the reader opens it
   */
  defaultOpen?: boolean;
  /**
   * Told when the reader opens or closes the fold.
   * @default undefined
   */
  onToggle?: (open: boolean) => void;
  /**
   * Lay what it opens on out as a column, its parts 6px apart, for parts that
   * carry no margin of their own.
   * @default false - the parts are blocks, spaced by their own margins
   */
  stack?: boolean;
}

/**
 * A section of a card closed until the reader opens it, behind one muted line
 * saying what it holds. Put in a `CardFoot`, its line sits beside the
 * card's actions, and what it opens on starts below them, the card's whole
 * width.
 * @param props - See {@link CardFoldProps}.
 * @returns The fold, `details.card-fold`.
 */
export function CardFold(props: CardFoldProps): ReactElement {
  const {
    summary,
    children,
    defaultOpen = false,
    onToggle,
    stack = false,
  } = props;
  return (
    <details
      className="card-fold"
      open={defaultOpen || undefined}
      onToggle={
        onToggle === undefined
          ? undefined
          : (event) => onToggle(event.currentTarget.open)
      }
    >
      <summary>{summary}</summary>
      <div
        className={joinClassNames(
          'card-fold__body',
          stack && 'card-fold__body--stack',
        )}
      >
        {children}
      </div>
    </details>
  );
}
