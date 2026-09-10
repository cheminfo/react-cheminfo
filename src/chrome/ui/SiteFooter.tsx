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
  /**
   * How wide the footer's contents run, read exactly as `SiteHeader`'s: `page`
   * caps them at `--page-max`, `full` runs them to both edges. A site sets the
   * two alike, or its chrome is capped at one end of the page and not at the
   * other.
   * @default 'page'
   */
  width?: 'page' | 'full';
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
    width = 'page',
  } = props;

  if (embedded) return null;

  return (
    <footer className="app-footer no-print">
      <div className={INNER_CLASS[width]}>
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

/** The two widths the footer's contents run at, as the classes that set them. */
const INNER_CLASS = {
  page: 'app-footer__inner',
  full: 'app-footer__inner app-footer__inner--full',
} as const;
