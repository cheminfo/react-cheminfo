import { expect, test } from 'vitest';

import { PLATFORM_WORK } from '../../../citation/core/platformPaper.ts';
import type { EcosystemSite, SiteId } from '../../../ecosystem/core/sites.ts';
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

const ZAKODIUM = { name: 'Zakodium', href: 'https://www.zakodium.com' };

const OUTSIDE: EcosystemSite = {
  id: 'images' as SiteId,
  name: { lead: 'images', alt: 'cheminfo', dot: true },
  host: 'images.cheminfo.org',
  group: 'computing',
  tagline: 'Crop, rotate, adjust, resize and compress images, in your browser.',
  brand: '#a21caf',
  brandAlt: '#b45309',
  mark: { plate: '#a21caf', accent: '#f59e0b' },
};

test('a site that is not in the Tools menu may pass its own record', () => {
  const about = resolveAbout({ ...SMILES, siteId: OUTSIDE });

  expect(about.site.host).toBe('images.cheminfo.org');
  expect(about.site.tagline).toBe(OUTSIDE.tagline);
});

test('what the site left to the family comes from its ecosystem record', () => {
  const about = resolveAbout(SMILES);

  expect(about.site.host).toBe('smiles.cheminfo.org');
  expect(about.build).toBeUndefined();
  expect(about.paragraphs).toStrictEqual([]);
  expect(about.cite).toStrictEqual([]);
});

test('the build a site publishes is carried through untouched', () => {
  const about = resolveAbout({
    ...SMILES,
    build: { version: '2.4.0', builtAt: '2026-09-16T09:41:07Z' },
  });

  expect(about.build).toStrictEqual({
    version: '2.4.0',
    builtAt: '2026-09-16T09:41:07Z',
  });
});

test('credit ids become the entries of the shared registry, in order', () => {
  const about = resolveAbout(SMILES);

  expect(about.credits).toStrictEqual([
    {
      id: 'openchemlib',
      name: 'OpenChemLib',
      href: 'https://www.npmjs.com/package/openchemlib',
      own: true,
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

test('every site lists Luc Patiny, then Michaël Zasso for the tooling and OpenChemLib', () => {
  const about = resolveAbout({ ...SMILES, people: [{ name: 'Luc Patiny' }] });

  expect(about.people).toStrictEqual([{ name: 'Luc Patiny' }]);
  expect(about.team).toStrictEqual([
    { name: 'Luc Patiny', family: { role: 'coordinates', works: [] } },
    {
      name: 'Michaël Zasso',
      family: {
        role: 'tooling',
        organisation: ZAKODIUM,
        works: ['OpenChemLib'],
      },
    },
  ]);
});

test('Daniel Kostro is listed for react-science on a site that credits it', () => {
  const about = resolveAbout({
    ...SMILES,
    credits: ['react', 'react-science'],
  });

  expect(about.team).toStrictEqual([
    { name: 'Luc Patiny', family: { role: 'coordinates', works: [] } },
    {
      name: 'Daniel Kostro',
      family: { role: 'design', organisation: ZAKODIUM, works: [] },
    },
    {
      name: 'Michaël Zasso',
      family: { role: 'tooling', organisation: ZAKODIUM, works: [] },
    },
  ]);
});

test('a site made with others lists who made it, and who maintains what it runs on apart', () => {
  const about = resolveAbout({
    ...SMILES,
    credits: ['react', 'react-science', 'react-ocl'],
    people: [{ name: 'Luc Patiny' }],
    contributors: [
      { name: 'Daniel Kostro', role: 'wrote the solver.' },
      { name: 'Régis Turin', role: 'wrote the exercises.' },
    ],
  });

  expect(about.people).toStrictEqual([{ name: 'Luc Patiny' }]);
  expect(about.team).toStrictEqual([
    { name: 'Luc Patiny', family: { role: 'coordinates', works: [] } },
    { name: 'Daniel Kostro', role: 'wrote the solver.' },
    { name: 'Régis Turin', role: 'wrote the exercises.' },
  ]);
  expect(about.maintainers).toStrictEqual([
    {
      name: 'Daniel Kostro',
      organisation: ZAKODIUM,
      works: ['react-science'],
      tooling: false,
    },
    {
      name: 'Michaël Zasso',
      organisation: ZAKODIUM,
      works: ['react-ocl', 'react-science'],
      tooling: true,
    },
  ]);
});

test('a site Luc Patiny made alone has no second list, whatever it credits', () => {
  const about = resolveAbout({
    ...SMILES,
    credits: ['openchemlib', 'react-ocl', 'react-science'],
    people: [{ name: 'Luc Patiny', role: 'ignored.' }],
  });

  expect(about.maintainers).toStrictEqual([]);
  expect(about.team.map((member) => member.name)).toStrictEqual([
    'Luc Patiny',
    'Daniel Kostro',
    'Michaël Zasso',
  ]);
});

test('the people whose work a site is come first, and Luc Patiny wrote the interface', () => {
  const student = {
    name: 'Adrian Mirza',
    role: 'developed the method, at {organisation}.',
    organisation: { name: 'LamaLab', href: 'https://lamalab.org' },
  };
  const about = resolveAbout({
    ...SMILES,
    leads: [student],
    people: [{ name: 'Adrian Mirza' }, { name: 'Luc Patiny' }],
    contributors: [{ name: 'Régis Turin', role: 'wrote the exercises.' }],
  });

  expect(about.team).toStrictEqual([
    student,
    { name: 'Luc Patiny', family: { role: 'interface', works: [] } },
    { name: 'Régis Turin', role: 'wrote the exercises.' },
  ]);
});

test('a site naming its leads may say what Luc Patiny did, in the order it names them', () => {
  const content: AboutContent = {
    ...SMILES,
    leads: [{ name: 'Mara Schilling-Wilhelmi', role: 'developed the site.' }],
    contributors: [
      { name: 'Luc Patiny', role: 'supported the web application.' },
      { name: 'Sarthak Kapoor', role: 'co-developed the plugin.' },
    ],
  };

  expect(aboutProblems(content)).toStrictEqual([]);
  expect(resolveAbout(content).team).toStrictEqual([
    { name: 'Mara Schilling-Wilhelmi', role: 'developed the site.' },
    { name: 'Luc Patiny', role: 'supported the web application.' },
    { name: 'Sarthak Kapoor', role: 'co-developed the plugin.' },
  ]);
});

test('a role for Luc Patiny is refused on a site naming no leads', () => {
  expect(
    aboutProblems({
      ...SMILES,
      people: [{ name: 'Luc Patiny', role: 'maintains the tooling.' }],
    }),
  ).toStrictEqual([
    "Luc Patiny is one of the family's people: every site lists them with the same role, so leave `role` out.",
  ]);
  // Who maintains a library may still have done something on this site.
  expect(
    aboutProblems({
      ...SMILES,
      credits: ['react', 'react-science'],
      contributors: [{ name: 'Daniel Kostro', role: 'wrote the solver.' }],
    }),
  ).toStrictEqual([]);
});

/**
 * What `aboutProblems` says of an organisation and a role that disagree.
 * @param name - Whose line it is.
 * @returns The problem.
 */
function organisationProblem(name: string): string {
  return `${name}: \`organisation\` and \`{organisation}\` in the role go together, or the link is lost or the placeholder shows.`;
}

test('an organisation and its place in the role go together', () => {
  expect(
    aboutProblems({
      ...SMILES,
      contributors: [
        { name: 'A', role: 'wrote it, at {organisation}.' },
        { name: 'B', role: 'wrote it.', organisation: ZAKODIUM },
        {
          name: 'C',
          role: 'wrote it, at {organisation}.',
          organisation: ZAKODIUM,
        },
      ],
    }),
  ).toStrictEqual([organisationProblem('A'), organisationProblem('B')]);
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
