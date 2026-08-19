import { expect, test } from 'vitest';

import { PLATFORM_WORK } from '../../../citation/core/platformPaper.ts';
import type { SiteId } from '../../../ecosystem/core/sites.ts';
import type { AboutContent } from '../about.ts';
import { aboutProblems, resolveAbout } from '../about.ts';

const SMILES: AboutContent = {
  siteId: 'smiles',
  what: 'Draw a structure and read the SMILES that describes it, atom by atom.',
  can: [
    'Draw a structure and read its SMILES.',
    'Paste a SMILES and see what it draws.',
    'Follow the notation one rule at a time.',
  ],
  credits: ['openchemlib', 'react'],
};

test('what the site left to the family comes from its ecosystem record', () => {
  const about = resolveAbout(SMILES);

  expect(about.site.host).toBe('smiles.cheminfo.org');
  expect(about.repository).toBe(
    'https://github.com/cheminfo/smiles.cheminfo.org',
  );
  expect(about.issues).toBe(
    'https://github.com/cheminfo/smiles.cheminfo.org/issues',
  );
  expect(about.license).toBe('MIT');
  expect(about.version).toBeUndefined();
  expect(about.paragraphs).toStrictEqual([]);
  expect(about.cite).toStrictEqual([]);
});

test('a site that publishes elsewhere is reported there, issues included', () => {
  const about = resolveAbout({
    ...SMILES,
    license: 'BSD-3-Clause',
    repository: 'https://gitlab.com/cheminfo/elsewhere/',
    version: '2.4.0',
  });

  expect(about.license).toBe('BSD-3-Clause');
  expect(about.repository).toBe('https://gitlab.com/cheminfo/elsewhere/');
  expect(about.issues).toBe('https://gitlab.com/cheminfo/elsewhere/issues');
  expect(about.version).toBe('2.4.0');
});

test('the issues link a site writes itself is the one that is used', () => {
  const about = resolveAbout({
    ...SMILES,
    issues: 'https://github.com/cheminfo/smiles.cheminfo.org/discussions',
  });

  expect(about.issues).toBe(
    'https://github.com/cheminfo/smiles.cheminfo.org/discussions',
  );
});

test('credit ids become the entries of the shared registry, in order', () => {
  const about = resolveAbout(SMILES);

  expect(about.credits).toStrictEqual([
    {
      id: 'openchemlib',
      name: 'OpenChemLib',
      href: 'https://github.com/cheminfo/openchemlib-js',
      description:
        'reads and writes structures, and computes their properties in the browser.',
      license: 'BSD-3-Clause',
    },
    {
      id: 'react',
      name: 'React',
      href: 'https://react.dev/',
      description: 'the component model the pages are written in.',
      license: 'MIT',
    },
  ]);
});

test('the works to cite are carried through as the site names them', () => {
  const about = resolveAbout({ ...SMILES, cite: [PLATFORM_WORK] });

  expect(about.cite).toStrictEqual([PLATFORM_WORK]);
});

test('a credit the registry does not hold is a mistake the site is told about', () => {
  expect(() =>
    resolveAbout({
      ...SMILES,
      credits: ['openchemlib', 'no-such-package' as 'react'],
    }),
  ).toThrow('unknown credit: no-such-package');
});

test('a site outside the family is a mistake too', () => {
  expect(() =>
    resolveAbout({ ...SMILES, siteId: 'no-such-site' as SiteId }),
  ).toThrow('unknown ecosystem site: no-such-site');
});

test('a record written the house way has nothing wrong with it', () => {
  expect(aboutProblems(SMILES)).toStrictEqual([]);
  expect(
    aboutProblems({
      ...SMILES,
      paragraphs: ['It replaces the old visualizer view of the same name.'],
    }),
  ).toStrictEqual([]);
});

test('prose that runs long, a list that runs on and a page crediting nobody', () => {
  expect(
    aboutProblems({
      ...SMILES,
      what: 'x'.repeat(200),
      can: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'],
      credits: [],
    }),
  ).toStrictEqual([
    '`what` is 200 characters: one sentence of at most 160 says what the tool is.',
    '`can` lists 7 entries: between 3 and 6 is what a visitor reads before deciding to stay.',
    '`credits` is empty: every page of ours stands on borrowed work, and naming it is what the section is for.',
  ]);
});

test('too few entries is as wrong as too many, and each one stays a line', () => {
  expect(
    aboutProblems({
      ...SMILES,
      can: ['Draw a structure and read its SMILES.', 'y'.repeat(104)],
    }),
  ).toStrictEqual([
    '`can` lists 2 entries: between 3 and 6 is what a visitor reads before deciding to stay.',
    '`can` entry 2 is 104 characters: one line of at most 90, not a sentence about it.',
  ]);
});

test('context is two short paragraphs, never a chapter', () => {
  expect(
    aboutProblems({
      ...SMILES,
      paragraphs: ['First.', 'z'.repeat(420), 'Third.'],
    }),
  ).toStrictEqual([
    '`paragraphs` holds 3: at most 2 short paragraphs of context, and the rest belongs in the README.',
    'paragraph 2 is 420 characters: at most 400, or it is documentation rather than context.',
  ]);
});
