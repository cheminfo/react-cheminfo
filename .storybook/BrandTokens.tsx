import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';

import type { SiteId } from '../src/ecosystem/core/sites.ts';
import { siteTokensCss } from '../src/ecosystem/core/tokens.ts';

export interface BrandTokensProps {
  /** The site whose two colours the story is to be read under. */
  siteId: SiteId;
  /** The story. */
  children: ReactNode;
}

const STYLE_ID = 'storybook-site-theme';

/**
 * Puts a site's palette on the document, as the rule `<SiteTheme siteId>`
 * renders. It goes in the document's head rather than around the story because
 * a Blueprint popover renders into a portal at the end of the body, and a story
 * rendering its own `<SiteTheme>` still wins, coming later in the page.
 * @param props - The site, and the story reading its colours.
 * @returns The story.
 */
export function BrandTokens(props: BrandTokensProps): ReactElement {
  const { siteId, children } = props;

  useEffect(() => {
    let element = document.querySelector(`#${STYLE_ID}`);
    if (element === null) {
      element = document.createElement('style');
      element.id = STYLE_ID;
      document.head.append(element);
    }
    element.textContent = siteTokensCss(siteId);
  }, [siteId]);

  return <>{children}</>;
}
