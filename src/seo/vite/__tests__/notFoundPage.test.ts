// tokens-ok: file — the page is a document with no stylesheet, so its colours are literals.
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createElement } from 'react';
import { expect, test } from 'vitest';

import { OUTSIDE_SITE } from '../../../ecosystem/core/__tests__/outsideSite.ts';
import { notFoundPageHtml } from '../notFoundPage.ts';
import type { PrerenderOptions } from '../prerenderOptions.ts';

import { PAGE, ROUTES, build } from './prerenderHarness.ts';

/**
 * Build the specs' site into a fresh directory.
 * @param options - What the build was configured with.
 * @param own - A `404.html` the site ships itself, copied there by vite.
 * @returns The output directory.
 */
async function built(
  options: Partial<PrerenderOptions>,
  own?: string,
): Promise<string> {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-not-found-'));
  writeFileSync(join(out, 'index.html'), PAGE);
  if (own !== undefined) writeFileSync(join(out, '404.html'), own);
  await build({ site: '3d', routes: ROUTES, ...options }, out);
  return out;
}

test('the build writes no page not found unless the site asks for one', async () => {
  const out = await built({});

  expect(existsSync(join(out, '404.html'))).toBe(false);
});

test('the page not found names the site and wears its colour', async () => {
  const out = await built({ notFound: true });
  const html = readFileSync(join(out, '404.html'), 'utf8');

  expect(html.startsWith('<!doctype html>\n<html lang="en">')).toBe(true);
  expect(html).toContain('<base href="/" />');
  expect(html).toContain('<meta name="robots" content="noindex" />');
  expect(html).toContain('<title>Page not found — 3d.cheminfo.org</title>');
  expect(html).toContain(
    '<link rel="icon" type="image/svg+xml" href="./favicon.svg" />',
  );
  expect(html).toContain('<h1>Page not found</h1>');
  expect(html).toContain(
    '<p>This address is not a page of 3d.cheminfo.org.</p>',
  );
  expect(html).toContain('<p><a href="./">Go to the home page</a></p>');
  expect(html).toContain('main a { color: #155e75; font-weight: 600; }');
  expect(html).toContain(
    '<span class="wordmark"><span class="lead">3d</span><span class="dot">.</span><span class="alt">cheminfo</span></span>',
  );
  expect(html).toContain(
    '<rect x="0" y="0" width="32" height="32" rx="7" fill="#155e75"></rect>',
  );
  expect(html).not.toContain('<script');
  expect(html).not.toContain('<p class="other"');
});

test('the page not found is no page of the sitemap', async () => {
  const out = await built({ notFound: true });

  expect(readFileSync(join(out, 'sitemap.xml'), 'utf8')).not.toContain('404');
});

test('a page not found the site ships itself is kept', async () => {
  const own = '<!doctype html><title>Lost</title>';
  const out = await built({ notFound: true }, own);

  expect(readFileSync(join(out, '404.html'), 'utf8')).toBe(own);
});

test('the page not found says so in every language of the site', async () => {
  const html = await notFoundPageHtml({
    site: '3d',
    languages: ['en', 'fr', 'de'],
  });

  expect(html).toContain('<h1>Page not found</h1>');
  expect(html).toContain(
    `<p class="other" lang="fr">Cette adresse n'est pas une page de 3d.cheminfo.org. <a href="./fr">Aller à la page d'accueil</a></p>`,
  );
  expect(html).toContain(
    '<p class="other" lang="de">Diese Adresse ist keine Seite von 3d.cheminfo.org. <a href="./de">Zur Startseite</a></p>',
  );
});

test('a translated build writes the page in its languages', async () => {
  const out = await built({ notFound: true, languages: ['en', 'es'] });
  const html = readFileSync(join(out, '404.html'), 'utf8');

  expect(html).toContain(
    '<p class="other" lang="es">Esta dirección no es una página de 3d.cheminfo.org. <a href="./es">Ir a la página de inicio</a></p>',
  );
});

test('a name split on itself is titled as the pages are, with no dot', async () => {
  const html = await notFoundPageHtml({ site: 'equilibrium' });

  expect(html).toContain('<title>Page not found — EquiLibrium</title>');
  expect(html).toContain(
    '<span class="wordmark"><span class="lead">Equi</span><span class="alt">Librium</span></span>',
  );
  expect(html).toContain(
    '<p>This address is not a page of equilibrium.cheminfo.org.</p>',
  );
});

test('a site outside the family brings the drawing of its mark', async () => {
  const out = await built({
    site: OUTSIDE_SITE,
    notFound: {
      glyph: (accent) => createElement('circle', { r: 6, fill: accent }),
    },
  });
  const html = readFileSync(join(out, '404.html'), 'utf8');

  expect(html).toContain('<circle r="6" fill="#facc15"></circle>');
  expect(html).toContain(
    '<p>This address is not a page of spectra.cheminfo.org.</p>',
  );
  expect(html).toContain('main a { color: #0f5132; font-weight: 600; }');
});

test('a site outside the family with no drawing is refused', async () => {
  await expect(notFoundPageHtml({ site: OUTSIDE_SITE })).rejects.toThrow(
    "the 404.html of spectra.cheminfo.org draws the site's mark: pass its drawing as notFound: { glyph }",
  );
});

test('what a record says is escaped on the page', async () => {
  const html = await notFoundPageHtml({
    site: {
      ...OUTSIDE_SITE,
      host: 'a<b>&"c',
      name: { lead: '<i>', alt: 'x&y' },
    },
    glyph: () => null,
  });

  expect(html).toContain(
    '<p>This address is not a page of a&lt;b&gt;&amp;"c.</p>',
  );
  expect(html).toContain('title="a&lt;b&gt;&amp;&quot;c"');
  expect(html).toContain('<span class="lead">&lt;i&gt;</span>');
  expect(html).toContain('<span class="alt">x&amp;y</span>');
});
