import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { siteById } from '../core/lookup.ts';
import type { SiteId, SiteRecord } from '../core/sites.ts';

import { GLYPHS } from './glyphs.tsx';

// Every mark is drawn in the same 32×32 box, on a plate of the site's own
// colour, so every mark of the family still reads as one row. Each keeps the
// geometry of that site's own logo where it has one, and carries the site's
// answering colour on exactly one element — which is what stops it collapsing
// into a flat shape at 16 px.
const MARK_STYLE: CSSProperties = { display: 'block', flex: 'none' };

/** What a site's mark needs. */
export interface SiteMarkProps {
  /**
   * The site whose mark is drawn, with the two colours it owns. One of `site`
   * and `siteId` is required.
   * @default undefined
   */
  site?: SiteRecord;
  /**
   * The same site, named rather than passed, for a header that knows only
   * which site it is.
   * @default undefined
   */
  siteId?: SiteId;
  /**
   * What is drawn on the plate, in the same 32×32 box, given the colour its one
   * answering element takes. It is how a site that is not one of the family,
   * and so has no drawing in the shared set, still gets a mark of the family's
   * shape.
   * @default the family's drawing for that site
   */
  glyph?: (accent: string) => ReactNode;
  /**
   * Edge of the square the mark is drawn in, in pixels.
   * @default 28
   */
  size?: number;
  /**
   * Whether the drawing sits on the site's rounded plate. Several marks are
   * drawn in the plate's negative space, so dropping it suits a mark already
   * standing on a surface of the site's own colour.
   * @default true
   */
  plate?: boolean;
  /**
   * Whether the two colours are written out or read from the page. `tokens`
   * draws the plate in `var(--brand)` and the answering element in
   * `var(--brand-alt)`, so a site retuning its pair retunes its mark; it is
   * therefore for the site's own mark rather than for another site's.
   * @default 'literal'
   */
  colors?: 'literal' | 'tokens';
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * The little logo of one site of the family.
 * @param props - Which site, how big, and where its colours come from.
 * @returns The mark, as an inline SVG.
 * @throws {Error} When neither `site` nor `siteId` is given, or when the site
 *   is not one of the family and no `glyph` is.
 */
export function SiteMark(props: SiteMarkProps): ReactElement {
  const {
    className,
    site,
    siteId,
    glyph,
    size = 28,
    plate = true,
    colors = 'literal',
  } = props;

  const drawn = site ?? (siteId === undefined ? undefined : siteById(siteId));
  if (drawn === undefined) {
    throw new Error('SiteMark needs one of its `site` and `siteId` props');
  }
  const draw = glyph ?? familyGlyph(drawn.id);
  if (draw === undefined) {
    throw new Error(`SiteMark has no drawing for ${drawn.id}: pass its glyph`);
  }

  const usesTokens = colors === 'tokens';
  const plateFill = usesTokens ? 'var(--brand)' : drawn.mark.plate;
  const accent = usesTokens ? 'var(--brand-alt)' : drawn.mark.accent;
  const edge = drawn.mark.edge;

  return (
    <svg
      className={className}
      style={MARK_STYLE}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      {plate ? (
        <rect
          x={edge ? 0.5 : 0}
          y={edge ? 0.5 : 0}
          width={edge ? 31 : 32}
          height={edge ? 31 : 32}
          rx={edge ? 6.5 : 7}
          fill={plateFill}
          stroke={edge}
        />
      ) : null}
      {draw(accent)}
    </svg>
  );
}

function familyGlyph(id: string): ((accent: string) => ReactNode) | undefined {
  return Object.hasOwn(GLYPHS, id) ? GLYPHS[id as SiteId] : undefined;
}
