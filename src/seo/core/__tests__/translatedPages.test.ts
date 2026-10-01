import { expect, test } from 'vitest';

import type { Language } from '../../../i18n/core/languages.ts';
import { pageDocumentMeta, pageHeadTags, pageLanguage } from '../pageMeta.ts';
import type { RouteMeta } from '../routes.ts';
import { sitemapXml } from '../siteFiles.ts';

const LANGUAGES: readonly Language[] = ['en', 'fr', 'de'];

const ENGLISH: RouteMeta[] = [
  {
    path: '/',
    title: 'Conformers from a drawn structure',
    description: 'Draw a structure and turn it into 3D conformers.',
  },
  {
    path: '/batch',
    title: '3D models for a list of SMILES',
    description: 'Paste a list of SMILES and get a model of each.',
  },
];

const FRENCH: RouteMeta[] = [
  {
    path: '/',
    title: 'Des conformères à partir d’une structure dessinée',
    description: 'Dessinez une structure et obtenez ses conformères 3D.',
  },
  {
    path: '/batch',
    title: 'Des modèles 3D pour une liste de SMILES',
    description: 'Collez une liste de SMILES et obtenez un modèle de chacune.',
  },
];

const tableFor = (language: Language) => (language === 'fr' ? FRENCH : ENGLISH);

test('a prefixed address is read in the language it names', () => {
  expect(
    pageLanguage({
      site: '3d',
      routes: ENGLISH,
      languages: LANGUAGES,
      url: '/fr/batch',
    }),
  ).toBe('fr');
});

test('an unprefixed address is read in the default language', () => {
  expect(
    pageLanguage({
      site: '3d',
      routes: ENGLISH,
      languages: LANGUAGES,
      url: '/batch',
    }),
  ).toBe('en');
});

test('a translated page is titled and described in its own language', () => {
  expect(
    pageDocumentMeta({
      site: '3d',
      routes: tableFor('fr'),
      languages: LANGUAGES,
      url: '/fr/batch',
    }),
  ).toStrictEqual({
    title: 'Des modèles 3D pour une liste de SMILES — 3d.cheminfo.org',
    description: 'Collez une liste de SMILES et obtenez un modèle de chacune.',
    canonical: 'https://3d.cheminfo.org/fr/batch',
    language: 'fr',
  });
});

test('a translated page is canonical to itself, never to the English one', () => {
  const { canonical } = pageDocumentMeta({
    site: '3d',
    routes: tableFor('fr'),
    languages: LANGUAGES,
    url: '/fr/',
  });

  expect(canonical).toBe('https://3d.cheminfo.org/fr');
});

test('the query string never reaches a translated canonical', () => {
  const { canonical } = pageDocumentMeta({
    site: '3d',
    routes: tableFor('fr'),
    languages: LANGUAGES,
    url: '/fr/batch?smiles=CCO',
  });

  expect(canonical).toBe('https://3d.cheminfo.org/fr/batch');
});

test('every translated page names every language and x-default', () => {
  const head = pageHeadTags({
    site: '3d',
    routes: tableFor('fr'),
    languages: LANGUAGES,
    url: '/fr/batch',
  });

  expect(head).toContain(
    '<link rel="alternate" hreflang="en" href="https://3d.cheminfo.org/batch" />',
  );
  expect(head).toContain(
    '<link rel="alternate" hreflang="fr" href="https://3d.cheminfo.org/fr/batch" />',
  );
  expect(head).toContain(
    '<link rel="alternate" hreflang="de" href="https://3d.cheminfo.org/de/batch" />',
  );
  expect(head).toContain(
    '<link rel="alternate" hreflang="x-default" href="https://3d.cheminfo.org/batch" />',
  );
});

test('a site speaking one language writes no alternate', () => {
  expect(
    pageHeadTags({ site: '3d', routes: ENGLISH, url: '/batch' }),
  ).not.toContain('hreflang');
});

test('the sitemap lists every address in every language', () => {
  const xml = sitemapXml({ site: '3d', routes: ENGLISH, languages: LANGUAGES });

  expect(xml.match(/<loc>/g)).toHaveLength(6);

  for (const address of [
    'https://3d.cheminfo.org/',
    'https://3d.cheminfo.org/fr',
    'https://3d.cheminfo.org/de',
    'https://3d.cheminfo.org/batch',
    'https://3d.cheminfo.org/fr/batch',
    'https://3d.cheminfo.org/de/batch',
  ]) {
    expect(xml).toContain(`<loc>${address}</loc>`);
  }
});

test('a page kept out of the index is out of it in every language', () => {
  const routes: RouteMeta[] = [
    ...ENGLISH,
    {
      path: '/admin',
      title: 'Admin',
      description: 'The curation queue.',
      indexed: false,
    },
  ];
  const xml = sitemapXml({ site: '3d', routes, languages: LANGUAGES });

  expect(xml).not.toContain('/admin');
  expect(xml.match(/<loc>/g)).toHaveLength(6);
});

test('a mounted translated deployment keeps its mount under the language', () => {
  const { canonical } = pageDocumentMeta({
    site: '3d',
    routes: tableFor('fr'),
    languages: LANGUAGES,
    origin: 'https://learn.cheminfo.org/3d',
    url: '/3d/fr/batch',
  });

  expect(canonical).toBe('https://learn.cheminfo.org/3d/fr/batch');
});

test('a table given as a function is read in the language of the address', () => {
  expect(
    pageDocumentMeta({
      site: '3d',
      routes: tableFor,
      languages: LANGUAGES,
      url: '/fr/batch',
    }),
  ).toStrictEqual({
    title: 'Des modèles 3D pour une liste de SMILES — 3d.cheminfo.org',
    description: 'Collez une liste de SMILES et obtenez un modèle de chacune.',
    canonical: 'https://3d.cheminfo.org/fr/batch',
    language: 'fr',
  });
});

test('the same function answers the English address in English', () => {
  const meta = pageDocumentMeta({
    site: '3d',
    routes: tableFor,
    languages: LANGUAGES,
    url: '/batch',
  });

  expect(meta.title).toBe('3D models for a list of SMILES — 3d.cheminfo.org');
  expect(meta.language).toBe('en');
});

test('the head reports the language the page is written in', () => {
  expect(
    pageDocumentMeta({
      site: '3d',
      routes: tableFor,
      languages: LANGUAGES,
      url: '/de/batch',
    }).language,
  ).toBe('de');
});
