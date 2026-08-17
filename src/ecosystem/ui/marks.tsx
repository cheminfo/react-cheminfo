import type { CSSProperties, ReactElement } from 'react';

import type { EcosystemSite } from '../core/sites.ts';

import { GLYPHS } from './glyphs.tsx';

// Every mark is drawn in the same 32×32 box, on a plate of the site's own
// colour, so every mark of the family still reads as one row. Each keeps the
// geometry of that site's own logo where it has one, and carries the site's
// answering colour on exactly one element — which is what stops it collapsing
// into a flat shape at 16 px.
const MARK_STYLE: CSSProperties = { display: 'block', flex: 'none' };

export interface SiteMarkProps {
  /** The site whose mark is drawn, with the two colours it owns. */
  site: EcosystemSite;
  /**
   * Edge of the square the mark is drawn in, in pixels.
   * @default 28
   */
  size?: number;
}

/**
 * The little logo of one site of the family.
 * @param props - The site and the size of its mark.
 * @returns The mark, as an inline SVG.
 */
export function SiteMark(props: SiteMarkProps): ReactElement {
  const { site, size = 28 } = props;

  return (
    <svg
      style={MARK_STYLE}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x={site.mark.edge ? 0.5 : 0}
        y={site.mark.edge ? 0.5 : 0}
        width={site.mark.edge ? 31 : 32}
        height={site.mark.edge ? 31 : 32}
        rx={site.mark.edge ? 6.5 : 7}
        fill={site.mark.plate}
        stroke={site.mark.edge}
      />
      {GLYPHS[site.id](site.mark.accent)}
    </svg>
  );
}
