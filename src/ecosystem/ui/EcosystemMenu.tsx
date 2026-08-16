import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { SiteId } from '../core/sites.ts';
import { ECOSYSTEM_SITES } from '../core/sites.ts';

import { SiteTile } from './SiteTile.tsx';

const PANEL_STYLE: CSSProperties = {
  display: 'flex',
  width: 'min(34rem, 90vw)',
  flexDirection: 'column',
  padding: 12,
  gap: 8,
};
const HEADING_STYLE: CSSProperties = {
  color: '#5b6875',
  fontSize: '0.75rem',
  fontWeight: 600,
};
const GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
  gap: 2,
};

export interface EcosystemMenuProps {
  /**
   * The site the visitor is already on, which is shown but never linked.
   * @default undefined
   */
  currentSiteId?: SiteId;
}

/**
 * What the ecosystem button opens: every site of the family, each behind its
 * own little logo and the two colours it owns. It lives in a popover, so a
 * crawler never reaches it — `EcosystemLinks` is what carries the family
 * through the page itself.
 * @param props - The site the visitor is already on.
 * @returns The grid of sites.
 */
export function EcosystemMenu(props: EcosystemMenuProps): ReactElement {
  const { currentSiteId } = props;
  const [hovered, setHovered] = useState<SiteId | null>(null);

  return (
    <div className="ecosystem-menu" style={PANEL_STYLE}>
      <div style={HEADING_STYLE}>Our other tools, all in the browser</div>
      <div style={GRID_STYLE}>
        {ECOSYSTEM_SITES.map((site) => (
          <SiteTile
            key={site.id}
            site={site}
            isCurrent={site.id === currentSiteId}
            isHovered={hovered === site.id}
            onHover={setHovered}
            newTab
          />
        ))}
      </div>
    </div>
  );
}
