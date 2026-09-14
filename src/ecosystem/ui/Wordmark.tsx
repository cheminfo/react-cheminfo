import type { CSSProperties, ReactElement } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { siteById } from '../core/lookup.ts';
import { siteNameColors } from '../core/nameColors.ts';
import type { SiteId } from '../core/sites.ts';

/** What a site's written name needs. */
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
  const { lead, alt, dot } = site.name;
  const colors = siteNameColors(site);

  return (
    <span
      className={joinClassNames('wordmark', className)}
      style={{ ...WORDMARK_STYLE, fontSize: size }}
    >
      <span className="wordmark__lead" style={{ color: colors.lead }}>
        {lead}
      </span>
      {dot ? (
        <span className="wordmark__dot" style={{ color: colors.dot }}>
          .
        </span>
      ) : null}
      <span className="wordmark__alt" style={{ color: colors.alt }}>
        {alt}
      </span>
    </span>
  );
}

const WORDMARK_STYLE: CSSProperties = {
  letterSpacing: '-0.01em',
  whiteSpace: 'nowrap',
};
