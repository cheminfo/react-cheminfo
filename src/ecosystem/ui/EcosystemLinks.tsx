import type { CSSProperties, ReactElement } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { groupedSites } from '../core/lookup.ts';
import type { SiteId } from '../core/sites.ts';
import { siteUrl } from '../core/sites.ts';

import { SiteGroupGrid } from './SiteGroupGrid.tsx';
import { ECOSYSTEM_HEADING_STYLE } from './ecosystemStyles.ts';

// The menu of `EcosystemMenu` lives inside a popover, so its links only enter
// the document once somebody clicks. A crawler never clicks, so these are the
// links that carry the family: always rendered, in the page, followed — and
// each one carrying the name and the one line that says what it opens, as real
// text rather than a `title` a crawler ignores. The topic headings give it the
// one thing a flat list of addresses cannot: what they have in common.
const SECTION_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};
const ROWS_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};
const ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: '0.3rem 0.85rem',
};
const ROW_LABEL_STYLE: CSSProperties = {
  color: TOKEN.textFaint,
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};
const LINK_STYLE: CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};
const CURRENT_STYLE: CSSProperties = {
  ...LINK_STYLE,
  color: TOKEN.textFaint,
  cursor: 'default',
};

/** What the footer's list of the family needs. */
export interface EcosystemLinksProps {
  /**
   * The site the visitor is already on, which is written but never linked.
   * @default undefined
   */
  currentSiteId?: SiteId;
  /**
   * What introduces the section.
   * @default 'Our other tools'
   */
  heading?: string;
  /**
   * How much of each site is written. `grid` gives every site its mark, its
   * name and the line saying what it does — which is what a crawler reads to
   * know what it is following, so it is the default. `row` writes one line per
   * topic, the names only, for a footer with no room.
   * @default 'grid'
   */
  layout?: 'grid' | 'row';
  /**
   * Class names added to the root element, after the component's own.
   * @default undefined
   */
  className?: string;
}

/**
 * Every site of the family as a plain link, gathered under its topic, for the
 * footer of a site. It is what lets a crawler — and a visitor with no patience
 * for menus — walk from one of our tools to the next, so it is rendered on
 * every page rather than behind a button.
 * @param props - The site it sits on, what introduces the section, and how much
 * of each site is written.
 * @returns The section of links.
 */
export function EcosystemLinks(props: EcosystemLinksProps): ReactElement {
  const {
    className,
    currentSiteId,
    heading = 'Our other tools',
    layout = 'grid',
  } = props;

  return (
    <nav
      className={joinClassNames('ecosystem-links', className)}
      style={SECTION_STYLE}
      aria-label={heading}
    >
      <h2 style={ECOSYSTEM_HEADING_STYLE}>{heading}</h2>
      {layout === 'grid' ? (
        <SiteGroupGrid currentSiteId={currentSiteId} />
      ) : (
        <div style={ROWS_STYLE}>
          {groupedSites().map(({ group, sites }) => (
            <div key={group.id} style={ROW_STYLE}>
              <span style={ROW_LABEL_STYLE}>{group.label}</span>
              {sites.map((site) =>
                site.id === currentSiteId ? (
                  <span key={site.id} style={CURRENT_STYLE}>
                    {site.host}
                  </span>
                ) : (
                  <a
                    key={site.id}
                    style={{ ...LINK_STYLE, color: site.brand }}
                    href={siteUrl(site)}
                  >
                    {site.host}
                  </a>
                ),
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
