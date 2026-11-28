import type { ReactElement } from 'react';

import { isModifiedClick } from '../../chrome/ui/navItem.ts';

import type { RenderSlideLink } from './DemoLink.tsx';

/** What {@link inPageSlideLink} is told about the anchor it draws. */
export interface InPageSlideLinkOptions {
  /**
   * The address the anchor carries, which a middle click or a modified click
   * opens in a tab of its own — a site under a base path writes it there.
   * @default the address itself
   */
  href?: (href: string) => string;
}

/**
 * A slide link that follows an address of the site in the page: a plain click
 * never reloads in front of a room, while a modified click is the browser's.
 * @param open - Follows the address in the page, and says whether it did; an
 *   address it declines is left to the browser.
 * @param options - See {@link InPageSlideLinkOptions}.
 * @returns The link, for the `renderLink` of the player.
 */
export function inPageSlideLink(
  open: (href: string) => boolean,
  options: InPageSlideLinkOptions = {},
): RenderSlideLink {
  const { href: anchorHref } = options;
  function renderInPageLink(
    link: Parameters<RenderSlideLink>[0],
  ): ReactElement {
    const { href, children } = link;
    return (
      <a
        className="slide-demo"
        href={anchorHref === undefined ? href : anchorHref(href)}
        onClick={(event) => {
          if (isModifiedClick(event)) return;
          if (open(href)) event.preventDefault();
        }}
      >
        {children}
      </a>
    );
  }
  return renderInPageLink;
}
