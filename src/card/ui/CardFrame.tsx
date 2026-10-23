import type { ReactElement, ReactNode } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

import { fitCardToFrame } from './fitCardToFrame.ts';

/** What {@link CardFrame} holds. */
export interface CardFrameProps {
  /** The card: the answer alone, compactly. */
  children: ReactNode;
  /**
   * Class beside `card`, so a site can reach the card from its stylesheet.
   * @default undefined
   */
  className?: string;
  /**
   * Value of the `data-testid` attribute.
   * @default 'card'
   */
  testId?: string;
}

/**
 * The page a chat frames inline for one answer: the card, with no header, no
 * footer and no form, as tall as what it shows. Framed, it reports its height
 * so the chat fits the frame to it, and grows while a panel it opened is open
 * so the frame holds that too; opened on its own, it is a page like any other.
 *
 * `react-cheminfo/styles/card.css` draws it: no margin on the page around it,
 * the chat's corner left free by `card__header`, and the row of actions at its
 * end, `card__end`.
 * @param props - See {@link CardFrameProps}.
 * @returns The card's root element.
 */
export function CardFrame(props: CardFrameProps): ReactElement {
  const { children, className, testId = 'card' } = props;
  return (
    <div
      ref={fitCardToFrame}
      className={joinClassNames('card', className)}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
