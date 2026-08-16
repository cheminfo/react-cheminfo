import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { EcosystemSite, SiteId } from '../core/sites.ts';
import { ECOSYSTEM_SITES, siteUrl } from '../core/sites.ts';

import { SiteMark } from './marks.tsx';

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
const TILE_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '7px 8px',
  border: '1px solid transparent',
  borderRadius: 10,
  color: '#16202c',
  gap: 10,
  textDecoration: 'none',
  transition: 'background 120ms, border-color 120ms, transform 120ms',
};
const MARK_HOLDER_STYLE: CSSProperties = {
  display: 'flex',
  transition: 'transform 160ms',
};
const TEXT_STYLE: CSSProperties = { minWidth: 0 };
const NAME_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  fontSize: '0.9375rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  gap: 6,
  whiteSpace: 'nowrap',
};
const HERE_STYLE: CSSProperties = {
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};
const TAGLINE_STYLE: CSSProperties = {
  color: '#5b6875',
  fontSize: '0.75rem',
  lineHeight: 1.35,
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
 * own little logo and the two colours it owns.
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
          />
        ))}
      </div>
    </div>
  );
}

interface SiteTileProps {
  site: EcosystemSite;
  isCurrent: boolean;
  isHovered: boolean;
  onHover: (id: SiteId | null) => void;
}

/**
 * One site: its mark, its name in its own colours, and what it does.
 * @param props - The site, and whether it is the current or the hovered one.
 * @returns The tile.
 */
function SiteTile(props: SiteTileProps): ReactElement {
  const { site, isCurrent, isHovered, onHover } = props;
  const lit = isHovered && !isCurrent;

  const body = (
    <>
      <div
        style={{
          ...MARK_HOLDER_STYLE,
          transform: lit ? 'scale(1.08) rotate(-6deg)' : 'none',
        }}
      >
        <SiteMark site={site} />
      </div>
      <div style={TEXT_STYLE}>
        <div style={NAME_STYLE}>
          <span>
            <span style={{ color: site.brand }}>{site.name.lead}</span>
            {site.name.dot ? <span style={{ color: '#8a96a3' }}>.</span> : null}
            <span style={{ color: site.brandAlt }}>{site.name.alt}</span>
          </span>
          {isCurrent ? (
            <span style={{ ...HERE_STYLE, color: site.brandAlt }}>
              you are here
            </span>
          ) : null}
        </div>
        <div style={TAGLINE_STYLE}>{site.tagline}</div>
      </div>
    </>
  );

  const style: CSSProperties = {
    ...TILE_STYLE,
    background: tint(site, isCurrent, lit),
    borderColor: borderOf(site, isCurrent, lit),
    transform: lit ? 'translateY(-1px)' : 'none',
    cursor: isCurrent ? 'default' : 'pointer',
  };

  if (isCurrent) return <div style={style}>{body}</div>;

  return (
    <a
      style={style}
      href={siteUrl(site)}
      title={site.host}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => {
        onHover(site.id);
      }}
      onMouseLeave={() => {
        onHover(null);
      }}
      onFocus={() => {
        onHover(site.id);
      }}
      onBlur={() => {
        onHover(null);
      }}
    >
      {body}
    </a>
  );
}

// A tile lights up in the colour of the site it opens, never in ours: the
// pointer moving down the grid is what makes the ten pairs of colours read.
function tint(site: EcosystemSite, isCurrent: boolean, lit: boolean): string {
  if (isCurrent) return '#f5f7fa';
  return lit ? `color-mix(in oklab, ${site.brand} 9%, white)` : 'transparent';
}

function borderOf(
  site: EcosystemSite,
  isCurrent: boolean,
  lit: boolean,
): string {
  if (isCurrent) return '#dfe3e8';
  return lit ? `color-mix(in oklab, ${site.brand} 32%, white)` : 'transparent';
}
