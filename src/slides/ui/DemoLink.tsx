import type { ReactElement, ReactNode } from 'react';

import type { TalkOrigin } from '../core/index.ts';
import { withTalkOrigin } from '../core/index.ts';

/**
 * How a site draws a link that leaves a slide for one of its own pages.
 *
 * The player never navigates: a site that routes in the browser passes its own
 * link here, and the address it is given already carries the slide it was
 * opened from. The children arrive already wrapped in the deck's arrow and
 * label spans, so a site's element only has to carry `slide-demo` for the
 * styling to apply.
 */
export type RenderSlideLink = (link: {
  /** The address the link opens, `from` parameter included. */
  href: string;
  /** What the link reads. */
  children: ReactNode;
}) => ReactElement;

/** What a demo link points at, and how it is drawn. */
export interface DemoLinkProps {
  /** The in-app route the demo opens, as the slide wrote it. */
  href: string;
  /**
   * Which slide the link sits on, added to the address so the tool it opens can
   * offer the way back. Nothing is added when it is left out.
   * @default undefined
   */
  origin?: TalkOrigin;
  /**
   * The site's own link, for a site that routes in the browser.
   * @default undefined — a plain anchor
   */
  renderLink?: RenderSlideLink;
  /** The link label. */
  children: ReactNode;
}

/**
 * A link from a slide into the live tool it demonstrates.
 * @param props - See {@link DemoLinkProps}.
 * @returns The link.
 */
export function DemoLink(props: DemoLinkProps): ReactElement {
  const { href, origin, renderLink, children } = props;
  const address = origin === undefined ? href : withTalkOrigin(href, origin);
  const label = (
    <>
      <span className="slide-demo-arrow" aria-hidden="true">
        ▸
      </span>
      <span className="slide-demo-label">{children}</span>
    </>
  );

  if (renderLink !== undefined) {
    return renderLink({ href: address, children: label });
  }

  return (
    <a className="slide-demo" href={address}>
      {label}
    </a>
  );
}
