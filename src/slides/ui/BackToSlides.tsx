import { Icon } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { isModifiedClick } from '../../chrome/ui/navItem.ts';
import type { TalkOrigin } from '../core/index.ts';

/** Where the visitor came from, and how to send them back. */
export interface BackToSlidesProps {
  /** The talk and slide a demo link was opened from, or `null` for none. */
  origin: TalkOrigin | null;
  /** The address of that slide. */
  href: string;
  /**
   * What the site does when the pill is clicked, for a site that routes in the
   * browser. A modified click is left to the browser either way.
   * @default undefined — the browser follows the address
   */
  onReturn?: () => void;
}

/**
 * The way back to the slide a demo was opened from.
 *
 * A demo link drops the presenter on an ordinary page of an ordinary site, so
 * during a talk the site stays fully browsable and the talk stays one click
 * away. It renders nothing at all when the page was not reached from a slide.
 * @param props - See {@link BackToSlidesProps}.
 * @returns The pill, or nothing.
 */
export function BackToSlides(props: BackToSlidesProps): ReactElement | null {
  const { origin, href, onReturn } = props;
  if (origin === null) return null;

  return (
    <a
      className="back-to-slides no-print"
      href={href}
      title={`Back to slide ${origin.slide + 1}`}
      onClick={(event) => {
        if (onReturn === undefined || isModifiedClick(event)) return;
        event.preventDefault();
        onReturn();
      }}
    >
      <Icon icon="presentation" size={14} />
      Back to slides
    </a>
  );
}
