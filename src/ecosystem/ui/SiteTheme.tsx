import type { ReactElement } from 'react';

import type { SiteId } from '../core/sites.ts';
import { siteTokensCss } from '../core/tokens.ts';

export interface SiteThemeProps {
  /** The site whose palette the page takes. */
  siteId: SiteId;
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
 */
export function SiteTheme(props: SiteThemeProps): ReactElement {
  return <style>{siteTokensCss(props.siteId)}</style>;
}
