import type { CSSProperties, ReactElement } from 'react';

import { siteById } from '../core/lookup.ts';
import type { SiteId } from '../core/sites.ts';

export interface WordmarkProps {
  /** The site whose name is written. */
  siteId: SiteId;
  /**
   * Size of the name, in pixels. The weight comes from the surrounding
   * context, so the same wordmark suits a header bar and a heading.
   * @default 17
   */
  size?: number;
  /**
   * Extra class names, for spacing at the place it is used. `wordmark` is
   * always carried as well.
   * @default undefined
   */
  className?: string;
}

/**
 * The name of a site, written in the two colours it owns.
 *
 * A name that splits on itself — `ChemCalc`, `EquiLibrium`, `PolyCarp` —
 * carries no domain and no dot; a one-word name takes `.cheminfo` after a faint
 * dot. The `.org` is never written, because the name is the site rather than
 * its address.
 * @param props - The site, the size of the name, and extra class names.
 * @returns The name, as one inline element that never wraps mid-address.
 */
export function Wordmark(props: WordmarkProps): ReactElement {
  const { siteId, size = 17, className } = props;
  const site = siteById(siteId);

  return (
    <span
      className={className ? `wordmark ${className}` : 'wordmark'}
      style={{ ...WORDMARK_STYLE, fontSize: size }}
    >
      <span className="wordmark__lead" style={{ color: site.brand }}>
        {site.name.lead}
      </span>
      {site.name.dot ? (
        <span className="wordmark__dot" style={{ color: DOT_COLOR }}>
          .
        </span>
      ) : null}
      <span className="wordmark__alt" style={{ color: site.brandAlt }}>
        {site.name.alt}
      </span>
    </span>
  );
}

// The separating dot is neutral so the two coloured halves read as the name
// rather than as three equal parts, and it takes the family's own token when
// the page defines one.
const DOT_COLOR = 'var(--text-faint, #8a96a3)';

const WORDMARK_STYLE: CSSProperties = {
  letterSpacing: '-0.01em',
  whiteSpace: 'nowrap',
};
