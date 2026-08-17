import type { ReactElement, ReactNode } from 'react';

import type { SiteId } from '../../ecosystem/core/sites.ts';
import { EcosystemLinks } from '../../ecosystem/ui/EcosystemLinks.tsx';

export interface SiteFooterProps {
  /** The site the footer sits on, which is written but never linked. */
  siteId: SiteId;
  /**
   * How much of each sibling site is written. `grid` gives every one its mark,
   * its name and the line saying what it does; `row` writes the names only.
   * @default 'grid'
   */
  layout?: 'grid' | 'row';
  /**
   * What introduces the family.
   * @default undefined
   */
  heading?: string;
  /**
   * Whether the page is framed in another site, in which case no footer is
   * drawn at all.
   * @default false
   */
  embedded?: boolean;
  /**
   * What the site adds under the family — a licence line, a version, a link to
   * the sources.
   * @default undefined
   */
  children?: ReactNode;
}

/**
 * The strip under every page of the family: each sibling site as a plain link,
 * so a crawler — and a reader with no patience for menus — walks from one of
 * our tools to the next. It carries `no-print`, because it is chrome.
 * @param props - The site it sits on, how much of each sibling is written, and
 * whatever the site adds below.
 * @returns The footer, or nothing at all on an embedded page.
 */
export function SiteFooter(props: SiteFooterProps): ReactElement | null {
  const {
    siteId,
    layout = 'grid',
    heading,
    embedded = false,
    children,
  } = props;

  if (embedded) return null;

  return (
    <footer className="app-footer no-print">
      <div className="app-footer__inner">
        <EcosystemLinks
          currentSiteId={siteId}
          layout={layout}
          heading={heading}
        />
        {children}
      </div>
    </footer>
  );
}
