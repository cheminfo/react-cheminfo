import type { CSSProperties, ReactElement } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { siteById } from '../core/lookup.ts';
import { siteNameColors } from '../core/nameColors.ts';
import type { SiteId, SiteRecord } from '../core/sites.ts';

/** What a site's written name needs. */
export interface WordmarkProps {
  /**
   * The site whose name is written, passed rather than named — for a site that
   * is deliberately not one of `ECOSYSTEM_SITES`. One of `site` and `siteId` is
   * required.
   * @default undefined
   */
  site?: SiteRecord;
  /**
   * The same site, named rather than passed, which is what a header knows.
   * @default undefined
   */
  siteId?: SiteId;
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
 * @throws {Error} When neither `site` nor `siteId` is given.
 */
export function Wordmark(props: WordmarkProps): ReactElement {
  const { site, siteId, size = 17, className } = props;
  const written = site ?? (siteId === undefined ? undefined : siteById(siteId));
  if (written === undefined) {
    throw new Error('Wordmark needs one of its `site` and `siteId` props');
  }

  const { lead, alt, dot } = written.name;
  const colors = siteNameColors(written);

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
