import type { ReactElement, ReactNode } from 'react';
import { Fragment } from 'react';

import { siteById } from '../../ecosystem/core/lookup.ts';
import type { SiteId } from '../../ecosystem/core/sites.ts';
import { Wordmark } from '../../ecosystem/ui/Wordmark.tsx';
import { SiteMark } from '../../ecosystem/ui/marks.tsx';

import { NavLink } from './NavLink.tsx';
import type { NavItem } from './navItem.ts';
import { isModifiedClick } from './navItem.ts';

export interface SiteHeaderProps {
  /** The site the bar belongs to, which draws its mark and writes its name. */
  siteId: SiteId;
  /** The pages, in the order the bar lists them. */
  nav: readonly NavItem[];
  /**
   * Which of the pages is on show, named by its `id`.
   * @default undefined
   */
  activeId?: string;
  /**
   * The utilities pushed to the right edge — Cite, Tools, Share, sign in. They
   * arrive dressed as bar items, so a plain `nav-link` and a `CiteButton` read
   * alike beside each other.
   * @default undefined
   */
  actions?: ReactNode;
  /**
   * Draws one page the site's own way, for a bar whose entries need a tooltip
   * or a wrapper of their own.
   * @default undefined
   */
  renderNavItem?: (item: NavItem, isActive: boolean) => ReactNode;
  /**
   * Whether the page is framed in another site, in which case no bar is drawn
   * at all — what a host page frames already carries its own navigation.
   * @default false
   */
  embedded?: boolean;
  /**
   * Where the brand leads.
   * @default '/'
   */
  homeHref?: string;
  /**
   * What the site does when the brand is picked, for a page that routes in
   * place. A modified click is left to the browser.
   * @default undefined
   */
  onHome?: () => void;
  /**
   * Edge of the site's mark, in pixels.
   * @default 28
   */
  markSize?: number;
}

/**
 * The bar every site of the family carries: the brand linking home at the left,
 * the pages next to it, and the utilities pushed to the right edge by the
 * spacer.
 * @param props - The site, its pages, its utilities, and whether the page is
 * framed in another site.
 * @returns The bar, or nothing at all on an embedded page.
 */
export function SiteHeader(props: SiteHeaderProps): ReactElement | null {
  const {
    siteId,
    nav,
    activeId,
    actions,
    renderNavItem,
    embedded = false,
    homeHref = '/',
    onHome,
    markSize = 28,
  } = props;

  if (embedded) return null;

  const site = siteById(siteId);

  return (
    <header className="app-header no-print">
      <div className="app-header__inner">
        <a
          className="brand"
          href={homeHref}
          title={site.host}
          onClick={(event) => {
            if (onHome === undefined || isModifiedClick(event)) return;
            event.preventDefault();
            onHome();
          }}
        >
          <SiteMark siteId={siteId} size={markSize} />
          <Wordmark siteId={siteId} />
        </a>
        <nav className="app-header-nav">
          {nav.map((item) => (
            <Fragment key={item.id}>
              {renderNavItem === undefined ? (
                <NavLink item={item} active={item.id === activeId} />
              ) : (
                renderNavItem(item, item.id === activeId)
              )}
            </Fragment>
          ))}
        </nav>
        <span className="spacer" />
        {actions === undefined ? null : (
          <div className="app-header-actions">{actions}</div>
        )}
      </div>
    </header>
  );
}
