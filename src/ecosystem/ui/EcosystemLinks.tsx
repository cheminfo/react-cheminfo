import type { CSSProperties, ReactElement } from 'react';

import type { SiteId } from '../core/sites.ts';
import { ECOSYSTEM_SITES, siteUrl } from '../core/sites.ts';

import { SiteTile } from './SiteTile.tsx';

// The menu of `EcosystemMenu` lives inside a popover, so its links only enter
// the document once somebody clicks. A crawler never clicks, so these are the
// links that carry the family: always rendered, in the page, followed — and
// each one carrying the name and the one line that says what it opens, as real
// text rather than a `title` a crawler ignores.
const SECTION_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};
const HEADING_STYLE: CSSProperties = {
  margin: 0,
  color: '#5b6875',
  fontSize: '0.75rem',
  fontWeight: 600,
};
const GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
  gap: 2,
};
const ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: '0.35rem 0.9rem',
};
const LINK_STYLE: CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};
const CURRENT_STYLE: CSSProperties = {
  ...LINK_STYLE,
  color: '#8a96a3',
  cursor: 'default',
};

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
   * know what it is following, so it is the default. `row` writes the names
   * only, for a footer with no room.
   * @default 'grid'
   */
  layout?: 'grid' | 'row';
}

/**
 * Every site of the family as a plain link, for the footer of a site. It is
 * what lets a crawler — and a visitor with no patience for menus — walk from
 * one of our tools to the next, so it is rendered on every page rather than
 * behind a button.
 * @param props - The site it sits on, what introduces the section, and how much
 * of each site is written.
 * @returns The section of links.
 */
export function EcosystemLinks(props: EcosystemLinksProps): ReactElement {
  const { currentSiteId, heading = 'Our other tools', layout = 'grid' } = props;

  return (
    <nav className="ecosystem-links" style={SECTION_STYLE} aria-label={heading}>
      <h2 style={HEADING_STYLE}>{heading}</h2>
      {layout === 'grid' ? (
        <div style={GRID_STYLE}>
          {ECOSYSTEM_SITES.map((site) => (
            <SiteTile
              key={site.id}
              site={site}
              isCurrent={site.id === currentSiteId}
            />
          ))}
        </div>
      ) : (
        <div style={ROW_STYLE}>
          {ECOSYSTEM_SITES.map((site) =>
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
      )}
    </nav>
  );
}
