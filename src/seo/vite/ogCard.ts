/**
 * The 1200×630 card a link to a site unfurls into, as a page to screenshot.
 *
 * The card is the site's own mark, its two colours and its name, all read from
 * its record — so it is generated rather than hand-drawn. A mark redrawn in the
 * card is a mark that drifts from the one the site shows.
 */

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { siteById } from '../../ecosystem/core/lookup.ts';
import type { EcosystemSite, SiteId } from '../../ecosystem/core/sites.ts';
import { SiteMark } from '../../ecosystem/ui/marks.tsx';
import { escapeText } from '../../share/core/escape.ts';

/** The width every card is drawn at. */
export const OG_WIDTH = 1200;

/** The height every card is drawn at. */
export const OG_HEIGHT = 630;

/** What the card says, beyond the site's own name and mark. */
export interface OgCardOptions {
  /** The site, named or passed. */
  site: EcosystemSite | SiteId;
  /**
   * The sentence under the name.
   * @default the site's tagline
   */
  description?: string;
}

/**
 * The card, as a standalone page.
 *
 * Screenshot it at {@link OG_WIDTH} × {@link OG_HEIGHT} — a headless browser is
 * the only thing here that can rasterise it, and every site already has one for
 * its end-to-end tests.
 * @param options - Which site, and what it says.
 * @returns A complete HTML document.
 */
export function ogCardHtml(options: OgCardOptions): string {
  const site =
    typeof options.site === 'string' ? siteById(options.site) : options.site;
  const description = options.description ?? site.tagline;
  const mark = renderToStaticMarkup(
    createElement(SiteMark, { site, size: 132, colors: 'literal' }),
  );
  const dot = site.name.dot === true ? '<span class="dot">.</span>' : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; }
      body {
        display: flex;
        width: ${OG_WIDTH}px;
        height: ${OG_HEIGHT}px;
        flex-direction: column;
        justify-content: center;
        padding: 88px;
        background: #ffffff;
        color: #16202c;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Helvetica, Arial, sans-serif;
        gap: 28px;
      }
      h1 { font-size: 76px; font-weight: 700; letter-spacing: -0.02em; }
      .lead { color: ${site.brand}; }
      .alt { color: ${site.brandAlt}; }
      .dot { color: #8a96a3; }
      p { max-width: 900px; color: #5b6875; font-size: 34px; line-height: 1.35; }
      .rule {
        width: 180px;
        height: 10px;
        border-radius: 5px;
        background: ${site.brandAlt};
      }
    </style>
  </head>
  <body>
    ${mark}
    <h1><span class="lead">${escapeText(site.name.lead)}</span>${dot}<span class="alt">${escapeText(site.name.alt)}</span></h1>
    <div class="rule"></div>
    <p>${escapeText(description)}</p>
  </body>
</html>
`;
}
