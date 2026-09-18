import type { ReactElement } from 'react';

import type { SiteId, SiteRecord } from '../core/sites.ts';
import { siteTokensCss } from '../core/tokens.ts';

/** What the site palette needs. */
export interface SiteThemeProps {
  /**
   * The site whose palette the page takes, named. One of `site` and `siteId`
   * is required.
   * @default undefined
   */
  siteId?: SiteId;
  /**
   * The same site, passed rather than named — for a site that is deliberately
   * not one of `ECOSYSTEM_SITES`.
   * @default undefined
   */
  site?: SiteRecord;
}

/**
 * The two colours a site owns, put on the page as custom properties.
 *
 * Everything of the family that reads `--brand`, `--brand-alt` or `--accent` —
 * a mark drawn in token colours, a current menu item, a focus ring — follows
 * from here, so a site declares its palette once and never repeats a hex code
 * in a component.
 * @param props - The site whose palette is injected.
 * @returns The rule, as a style element that applies wherever it is rendered.
 * @throws {Error} When neither `site` nor `siteId` is given.
 */
export function SiteTheme(props: SiteThemeProps): ReactElement {
  const site = props.site ?? props.siteId;
  if (site === undefined) {
    throw new Error('SiteTheme needs one of its `site` and `siteId` props');
  }
  return <style>{siteTokensCss(site)}</style>;
}
