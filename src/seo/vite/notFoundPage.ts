/**
 * The page a site answers an address it does not have with: `404.html`, which
 * static-web-server, Cloudflare Pages and `react-cheminfo/server` all hand out,
 * with a 404, for anything that is not on disk.
 *
 * It is drawn from the site's record — its mark, its name in its two colours,
 * the family's bar and grey page — so it always names the site it is served by
 * and wears that site's colours. It needs no script and no stylesheet of the
 * build: an address with nothing behind it is exactly where the page has to
 * read on its own.
 *
 * React is reached for only to draw the mark, and only on the call, as for the
 * link card: this module sits in the entry point a site imports with none of
 * the optional peers installed.
 */

import type { ReactNode } from 'react';

import { siteDisplayName } from '../../ecosystem/core/lookup.ts';
import { siteNameColors } from '../../ecosystem/core/nameColors.ts';
import type { SiteId, SiteRecord } from '../../ecosystem/core/sites.ts';
import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { withLanguagePath } from '../../language/core/languagePath.ts';
import { escapeAttribute, escapeText } from '../../share/core/escape.ts';
import {
  FAMILY_FONT,
  FAMILY_TOKEN_VALUES,
} from '../../tokens/core/familyTokens.ts';
import { resolveSite } from '../core/siteFiles.ts';

/** What the page needs beyond the site's record. */
export interface NotFoundOptions {
  /**
   * The drawing on the mark's plate, for a site the shared glyph set does not
   * hold — see `SiteMark`.
   * @default the family's drawing for that site
   */
  glyph?: (accent: string) => ReactNode;
}

/** What {@link notFoundPageHtml} draws the page for. */
export interface NotFoundPageOptions extends NotFoundOptions {
  /** The site, named or passed. */
  site: SiteRecord | SiteId;
  /**
   * Every language the site is written in. The page says it in the default
   * one, then in a line of each other, each linking to that language's front
   * page: one file answers every address, whatever its language.
   * @default [the default language]
   */
  languages?: readonly Language[];
}

/**
 * The family's page for an address a site does not have, as a standalone
 * document.
 * @param options - Which site, its languages, and its mark when it is not one
 *   of the family.
 * @returns A complete HTML document, served with a 404.
 * @throws {Error} When the site is not one of the family and no `glyph` is
 *   given to draw its mark.
 */
export async function notFoundPageHtml(
  options: NotFoundPageOptions,
): Promise<string> {
  const site = resolveSite(options.site);
  const others: Language[] = [];
  for (const language of options.languages ?? []) {
    if (language !== DEFAULT_LANGUAGE) others.push(language);
  }
  const loads: Array<Promise<unknown>> = [];
  for (const language of others) loads.push(CHROME_CATALOG.load(language));
  await Promise.all(loads);
  const mark = await markOf(site, options.glyph);

  const title = escapeText(
    CHROME_CATALOG.translate('notFound.title', DEFAULT_LANGUAGE),
  );
  const main = wordsOf(site, DEFAULT_LANGUAGE);
  let lines = '';
  for (const language of others) {
    const words = wordsOf(site, language);
    lines += `
      <p class="other" lang="${language}">${words.text} <a href=".${withLanguagePath(language, '/')}">${words.home}</a></p>`;
  }

  return `<!doctype html>
<html lang="${DEFAULT_LANGUAGE}">
  <head>
    <base href="/" />
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${title} — ${escapeText(siteDisplayName(site))}</title>
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <style>
${pageStyle(site)}
    </style>
  </head>
  <body>
    <header>
      <a class="brand" href="./" title="${escapeAttribute(site.host)}">${mark}${wordmarkOf(site)}</a>
    </header>
    <main>
      <h1>${title}</h1>
      <p>${main.text}</p>
      <p><a href="./">${main.home}</a></p>${lines}
    </main>
  </body>
</html>
`;
}

/**
 * What the page says in one language, escaped.
 * @param site - The site it is a page of.
 * @param language - The language.
 * @returns The sentence, and the words of the link home.
 */
function wordsOf(
  site: SiteRecord,
  language: Language,
): { text: string; home: string } {
  return {
    text: escapeText(
      CHROME_CATALOG.translate('notFound.text', language, {
        values: { host: site.host },
      }),
    ),
    home: escapeText(CHROME_CATALOG.translate('notFound.home', language)),
  };
}

/**
 * The site's name in its two colours, as the header writes it.
 * @param site - The site.
 * @returns The wordmark's markup.
 */
function wordmarkOf(site: SiteRecord): string {
  const dot = site.name.dot === true ? '<span class="dot">.</span>' : '';
  return `<span class="wordmark"><span class="lead">${escapeText(site.name.lead)}</span>${dot}<span class="alt">${escapeText(site.name.alt)}</span></span>`;
}

/**
 * The site's mark, drawn once at build time with its literal colours.
 * @param site - The site.
 * @param glyph - Its drawing, when it is not one of the family.
 * @returns The mark, as an inline SVG.
 */
async function markOf(
  site: SiteRecord,
  glyph: NotFoundOptions['glyph'],
): Promise<string> {
  const [{ createElement }, { renderToStaticMarkup }, { SiteMark }] =
    await Promise.all([
      import('react'),
      import('react-dom/server'),
      import('../../ecosystem/ui/marks.tsx'),
    ]);
  try {
    return renderToStaticMarkup(
      createElement(SiteMark, { site, glyph, size: 28, colors: 'literal' }),
    );
  } catch (error) {
    throw new Error(
      `the 404.html of ${site.host} draws the site's mark: pass its drawing as notFound: { glyph }`,
      { cause: error },
    );
  }
}

/**
 * The family's bar over the family's grey page, written out: the page reads
 * no stylesheet of the build.
 * @param site - The site, for its colours.
 * @returns The rules.
 */
function pageStyle(site: SiteRecord): string {
  const token = FAMILY_TOKEN_VALUES;
  const name = siteNameColors(site, { colors: 'literal' });
  return `      :root { color-scheme: light; }
      html, body { padding: 0; margin: 0; background: ${token['--surface-sunken']}; color: ${token['--text']}; }
      body {
        display: flex;
        min-height: 100dvh;
        flex-direction: column;
        font-family: ${FAMILY_FONT};
        font-size: 15px;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
      }
      header { flex: none; border-bottom: 1px solid ${token['--border']}; background: ${token['--surface']}; }
      .brand {
        display: flex;
        height: ${token['--header-height']};
        max-width: ${token['--page-max']};
        box-sizing: border-box;
        align-items: center;
        padding: 0 1.25rem;
        margin: 0 auto;
        color: ${token['--text']};
        font-weight: 700;
        gap: 0.55rem;
        text-decoration: none;
      }
      .brand svg { display: block; flex: none; }
      .wordmark { font-size: 1.0625rem; letter-spacing: -0.01em; white-space: nowrap; }
      .lead { color: ${name.lead}; }
      .dot { color: ${name.dot}; }
      .alt { color: ${name.alt}; }
      main {
        display: grid;
        flex: 1 1 auto;
        place-content: center;
        padding: 16px;
        gap: 0.75rem;
        text-align: center;
      }
      h1 { margin: 0; font-size: 1.5rem; }
      p { margin: 0; }
      main a { color: ${site.brand}; font-weight: 600; }
      .other { color: ${token['--text-muted']}; }`;
}
