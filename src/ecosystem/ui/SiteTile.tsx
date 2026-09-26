import type { CSSProperties, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { useSiteLanguage } from '../../language/ui/siteLanguageContext.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { siteNameColors } from '../core/nameColors.ts';
import type { EcosystemSite, SiteId } from '../core/sites.ts';
import { siteUrl } from '../core/sites.ts';

import { SiteMark } from './marks.tsx';

const TILE_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '7px 8px',
  border: '1px solid transparent',
  borderRadius: 10,
  color: TOKEN.text,
  gap: 10,
  textDecoration: 'none',
  transition: 'background 120ms, border-color 120ms, transform 120ms',
};
const MARK_HOLDER_STYLE: CSSProperties = {
  display: 'flex',
  // The name sits on the first line, so the mark answers that line rather than
  // the middle of a tagline that may run to three.
  marginTop: 1,
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
  color: TOKEN.textMuted,
  fontSize: '0.75rem',
  lineHeight: 1.35,
};

/** What one tile of the family needs. */
export interface SiteTileProps {
  /** The site the tile opens. */
  site: EcosystemSite;
  /** Whether this is the site the visitor is already on. */
  isCurrent: boolean;
  /**
   * Whether the pointer is on it, which lights it in its own colour.
   * @default false
   */
  isHovered?: boolean;
  /**
   * Told which site the pointer moved onto, or null when it left.
   * @default undefined
   */
  onHover?: (id: SiteId | null) => void;
  /**
   * Whether the link opens a tab of its own. A menu the visitor opened on
   * purpose does; a footer does not.
   * @default false
   */
  newTab?: boolean;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * One site: its mark, its name in its own colours, and what it does. The name
 * and the tagline are real text — that is what a crawler reads to know what it
 * is following, so neither is ever a `title` attribute.
 * @param props - The site, whether it is the current or the hovered one, and
 * how the link opens.
 * @returns The tile.
 */
export function SiteTile(props: SiteTileProps): ReactElement {
  const language = useSiteLanguage();
  const {
    className,
    site,
    isCurrent,
    isHovered = false,
    onHover,
    newTab = false,
  } = props;
  const t = useChromeT();
  const lit = isHovered && !isCurrent;
  const colors = siteNameColors(site);

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
            <span style={{ color: colors.lead }}>{site.name.lead}</span>
            {site.name.dot ? (
              <span style={{ color: colors.dot }}>.</span>
            ) : null}
            <span style={{ color: colors.alt }}>{site.name.alt}</span>
          </span>
          {isCurrent ? (
            <span style={{ ...HERE_STYLE, color: site.brandAlt }}>
              {t('ecosystem.youAreHere')}
            </span>
          ) : null}
        </div>
        <div style={TAGLINE_STYLE}>
          {t.or(`site.${site.id}.tagline`, site.tagline)}
        </div>
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
      className={className}
      style={style}
      href={siteUrl(site, { language })}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noreferrer' : undefined}
      onMouseEnter={() => onHover?.(site.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(site.id)}
      onBlur={() => onHover?.(null)}
    >
      {body}
    </a>
  );
}

// A tile lights up in the colour of the site it opens, never in ours: the
// pointer moving down the grid is what makes the pairs of colours read.
function tint(site: EcosystemSite, isCurrent: boolean, lit: boolean): string {
  if (isCurrent) return TOKEN.surfaceSunken;
  return lit ? `color-mix(in oklab, ${site.brand} 9%, white)` : 'transparent';
}

function borderOf(
  site: EcosystemSite,
  isCurrent: boolean,
  lit: boolean,
): string {
  if (isCurrent) return TOKEN.border;
  return lit ? `color-mix(in oklab, ${site.brand} 32%, white)` : 'transparent';
}
