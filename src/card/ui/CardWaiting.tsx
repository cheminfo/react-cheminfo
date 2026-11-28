import { Spinner } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

/** What {@link CardWaiting} says. */
export interface CardWaitingProps {
  /** What is being done, e.g. `Converting…`. */
  children: ReactNode;
}

/**
 * A card's line while its answer is computed: a small spinner, and a few
 * muted words saying what is being done.
 * @param props - See {@link CardWaitingProps}.
 * @returns The line, `card__wait`.
 */
export function CardWaiting(props: CardWaitingProps): ReactElement {
  return (
    <div className="card__wait">
      <Spinner size={16} aria-hidden />
      {props.children}
    </div>
  );
}
