import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import type { Language } from '../../../i18n/core/languages.ts';
import type { RouteMeta } from '../../core/routes.ts';
import type { PrerenderOptions } from '../prerender.ts';
import { cheminfoPrerender } from '../prerender.ts';

import { PAGE, build } from './prerenderHarness.ts';

const LANGUAGES: readonly Language[] = ['en', 'fr'];

const ENGLISH: RouteMeta[] = [
  { path: '/', title: 'Conformers in 3D', description: 'The home page.' },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

const FRENCH: RouteMeta[] = [
  { path: '/', title: 'Conformères en 3D', description: 'La page d’accueil.' },
  { path: '/about', title: 'À propos', description: 'Ce qu’il calcule.' },
];

const OPTIONS: PrerenderOptions = {
  site: '3d',
  languages: LANGUAGES,
  routes: (language: Language) => (language === 'fr' ? FRENCH : ENGLISH),
  category: false,
  noscript: false,
};

/**
 * Everything a build writes, by the path it lands at.
 * @param options - What the build was configured with.
 * @returns The files, keyed by their path under the output directory.
 */
async function files(
  options: PrerenderOptions,
): Promise<Record<string, string>> {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-languages-'));
  writeFileSync(join(out, 'index.html'), PAGE);
  await build(options, out);
  const read = (name: string) => readFileSync(join(out, name), 'utf8');
  return {
    '/': read('index.html'),
    '/about': read('about.html'),
    '/fr': read('fr.html'),
    '/fr/about': read(join('fr', 'about.html')),
    sitemap: read('sitemap.xml'),
  };
}

test('a build writes one file per address per language', async () => {
  const written = await files(OPTIONS);

  expect(written['/']).toContain('<title>Conformers in 3D — 3d.cheminfo.org');
  expect(written['/about']).toContain('<title>About — 3d.cheminfo.org');
  expect(written['/fr']).toContain(
    '<title>Conformères en 3D — 3d.cheminfo.org',
  );
  expect(written['/fr/about']).toContain('<title>À propos — 3d.cheminfo.org');
});

test('each file says which language it is actually in', async () => {
  const written = await files(OPTIONS);

  expect(written['/']).toContain('<html lang="en">');
  expect(written['/fr']).toContain('<html lang="fr">');
  expect(written['/fr/about']).toContain('<html lang="fr">');
});

test('a translated page is canonical to itself', async () => {
  const written = await files(OPTIONS);

  expect(written['/fr/about']).toContain(
    '<link rel="canonical" href="https://3d.cheminfo.org/fr/about" />',
  );
  expect(written['/about']).toContain(
    '<link rel="canonical" href="https://3d.cheminfo.org/about" />',
  );
});

test('every page names every language and x-default', async () => {
  const written = await files(OPTIONS);

  for (const page of [written['/about'], written['/fr/about']]) {
    expect(page).toContain(
      '<link rel="alternate" hreflang="en" href="https://3d.cheminfo.org/about" />',
    );
    expect(page).toContain(
      '<link rel="alternate" hreflang="fr" href="https://3d.cheminfo.org/fr/about" />',
    );
    expect(page).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://3d.cheminfo.org/about" />',
    );
  }
});

test('the description of a translated page is in its own language', async () => {
  const written = await files(OPTIONS);

  expect(written['/fr/about']).toContain(
    '<meta name="description" content="Ce qu’il calcule." />',
  );
  expect(written['/about']).toContain(
    '<meta name="description" content="What it computes." />',
  );
});

test('the sitemap lists every address in every language', async () => {
  const written = await files(OPTIONS);
  const sitemap = written.sitemap ?? '';

  expect(sitemap.match(/<loc>/g)).toHaveLength(4);

  for (const address of [
    'https://3d.cheminfo.org/',
    'https://3d.cheminfo.org/about',
    'https://3d.cheminfo.org/fr',
    'https://3d.cheminfo.org/fr/about',
  ]) {
    expect(sitemap).toContain(`<loc>${address}</loc>`);
  }
});

test('a site given one language writes exactly what it wrote before', async () => {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-one-language-'));
  writeFileSync(join(out, 'index.html'), PAGE);
  await build({ ...OPTIONS, languages: ['en'], routes: ENGLISH }, out);
  const home = readFileSync(join(out, 'index.html'), 'utf8');

  expect(home).toContain('<html lang="en">');
  expect(home).not.toContain('hreflang');
  expect(
    readFileSync(join(out, 'sitemap.xml'), 'utf8').match(/<loc>/g),
  ).toHaveLength(2);
  // Nothing was written under a language it does not speak.
  expect(existsSync(join(out, 'fr'))).toBe(false);
  expect(existsSync(join(out, 'fr.html'))).toBe(false);
});

test('a translated table answering other addresses is refused at build time', async () => {
  expect(() =>
    cheminfoPrerender({
      ...OPTIONS,
      routes: (language: Language) =>
        language === 'fr'
          ? [
              {
                path: '/a-propos',
                title: 'À propos',
                description: 'Ce qu’il calcule.',
              },
            ]
          : ENGLISH,
    }),
  ).toThrow(/different addresses/);
});

test('the crawl path of a translated page links to that language', async () => {
  const written = await files({ ...OPTIONS, noscript: true });

  expect(written['/fr/about']).toContain(
    'href="https://3d.cheminfo.org/fr/about"',
  );
});

test('the crawl path can be written in the language of the page', async () => {
  const written = await files({
    ...OPTIONS,
    noscript: (language: Language) =>
      language === 'fr'
        ? { heading: 'Conformères', intro: 'Le navigateur fait le calcul.' }
        : { heading: 'Conformers', intro: 'The browser does the computing.' },
  });

  expect(written['/fr/about']).toContain('Conformères');
  expect(written['/fr/about']).toContain('Le navigateur fait le calcul.');
  expect(written['/about']).toContain('The browser does the computing.');
});

test('a crawl path declared as a record is the same on every language', async () => {
  const written = await files({
    ...OPTIONS,
    noscript: {
      heading: 'Conformers',
      intro: 'The browser does the computing.',
    },
  });

  expect(written['/about']).toContain('The browser does the computing.');
  expect(written['/fr/about']).toContain('The browser does the computing.');
});

test('the family list names itself in the language of the page', async () => {
  const written = await files({
    ...OPTIONS,
    noscript: { ecosystem: { taglines: false } },
  });

  expect(written['/about']).toContain('<h2>Our other tools</h2>');
  expect(written['/fr/about']).toContain('<h2>Nos autres outils</h2>');
});
