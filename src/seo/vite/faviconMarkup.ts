/**
 * The favicon of a site: its mark in literal colours, as a standalone SVG — a
 * file served on its own cannot read the page's custom properties. A site's
 * test writes it to `public/favicon.svg` with `toMatchFileSnapshot`.
 */

import type { ReactNode } from 'react';

import type { SiteId, SiteRecord } from '../../ecosystem/core/sites.ts';
import { resolveSite } from '../core/siteFiles.ts';

/** What {@link faviconMarkup} draws beside the site. */
export interface FaviconMarkupOptions {
  /**
   * The size of the mark, in pixels.
   * @default 32
   */
  size?: number;
  /**
   * The drawing on the mark's plate, for a site the shared glyph set does not
   * hold — see `SiteMark`.
   * @default the family's drawing for that site
   */
  glyph?: (accent: string) => ReactNode;
}

/**
 * The favicon, as the text of `public/favicon.svg`.
 * @param site - The site, named or passed.
 * @param options - The size and the glyph.
 * @returns The SVG document, ending in a newline.
 */
export async function faviconMarkup(
  site: SiteId | SiteRecord,
  options: FaviconMarkupOptions = {},
): Promise<string> {
  const { size = 32, glyph } = options;
  const [{ createElement }, { renderToStaticMarkup }, { SiteMark }] =
    await Promise.all([
      import('react'),
      import('react-dom/server'),
      import('../../ecosystem/ui/marks.tsx'),
    ]);
  const mark = renderToStaticMarkup(
    createElement(SiteMark, {
      site: resolveSite(site),
      glyph,
      size,
      colors: 'literal',
    }),
  );
  const standalone = mark.includes('xmlns=')
    ? mark
    : mark.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  return `${standalone}\n`;
}
