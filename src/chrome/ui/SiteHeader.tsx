import type { ReactElement, ReactNode } from 'react';
import { Fragment } from 'react';

import { siteById } from '../../ecosystem/core/lookup.ts';
import type { SiteId, SiteRecord } from '../../ecosystem/core/sites.ts';
import { Wordmark } from '../../ecosystem/ui/Wordmark.tsx';
import { SiteMark } from '../../ecosystem/ui/marks.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';

import { NavLink } from './NavLink.tsx';
import { NavMenuButton } from './NavMenuButton.tsx';
import type { NavItem } from './navItem.ts';
import { isModifiedClick } from './navItem.ts';

export interface SiteHeaderProps {
  /**
   * The site the bar belongs to, which draws its mark and writes its name. One
   * of `site` and `siteId` is required.
   * @default undefined
   */
  siteId?: SiteId;
  /**
   * The same site, passed rather than named — for a site that is deliberately
   * not one of `ECOSYSTEM_SITES`, and so is linked from no other site's menu.
   * @default undefined
   */
  site?: SiteRecord;
  /**
   * The site's own mark, for a site the shared glyph set does not hold. It
   * stands where `SiteMark` would, at the size the site draws it.
   * @default undefined — the family's mark for that site
   */
  mark?: ReactNode;
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
  /**
   * How wide the bar's contents run.
   *
   * `page` caps them at `--page-max` and centres them, so the brand sits over
   * the first word of a page that is capped the same way — which is what a
   * site of reading matter wants. `full` runs them to both edges, for a tool
   * that fills the window: there the cap leaves the brand floating inwards
   * with the tool running past it on both sides, and reads as a fault.
   * @default 'page'
   */
  width?: 'page' | 'full';
  /**
   * What the menu the pages fold into on a phone is called, for the pointer
   * and a screen reader.
   * @default the chrome's own word for it, in the language of the page
   */
  pagesLabel?: string;
}

/**
 * The bar every site of the family carries: the brand linking home at the left,
 * the pages next to it, and the utilities pushed to the right edge by the
 * spacer.
 *
 * The bar folds on its own width, with no hook to wire: under 48rem the
 * utilities keep only their icons, under 36rem the pages fold into one menu,
 * and under 22rem the name gives way to the mark.
 * @param props - The site, its pages, its utilities, and whether the page is
 * framed in another site.
 * @returns The bar, or nothing at all on an embedded page.
 * @throws {Error} When neither `site` nor `siteId` is given.
 */
export function SiteHeader(props: SiteHeaderProps): ReactElement | null {
  const {
    siteId,
    site: record,
    mark,
    nav,
    activeId,
    actions,
    renderNavItem,
    embedded = false,
    homeHref = '/',
    onHome,
    markSize = 28,
    width = 'page',
    pagesLabel,
  } = props;
  const t = useChromeT();

  if (embedded) return null;

  const site = record ?? (siteId === undefined ? undefined : siteById(siteId));
  if (site === undefined) {
    throw new Error('SiteHeader needs one of its `site` and `siteId` props');
  }

  return (
    <header className="app-header no-print">
      <div className={INNER_CLASS[width]}>
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
          {mark ?? <SiteMark site={site} size={markSize} />}
          <Wordmark site={site} />
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
        {nav.length > 1 ? (
          <div className="app-header-nav-menu">
            <NavMenuButton
              label={pagesLabel ?? t('chrome.pages')}
              icon="menu"
              compact
              items={nav}
              activeId={activeId}
            />
          </div>
        ) : null}
        <span className="spacer" />
        {actions === undefined ? null : (
          <div className="app-header-actions">{actions}</div>
        )}
      </div>
    </header>
  );
}

/** The two widths the bar's contents run at, as the classes that set them. */
const INNER_CLASS = {
  page: 'app-header__inner',
  full: 'app-header__inner app-header__inner--full',
} as const;
