import { expect, test } from 'vitest';

import { pageHeadTags } from '../pageMeta.ts';
import type { RouteMeta } from '../routes.ts';
import { pageMetaFor } from '../routes.ts';
import { sitemapXml } from '../siteFiles.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Home', description: 'The home page.' },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

const SECTIONS: RouteMeta[] = [
  { path: '/', title: 'Home', description: 'The home page.' },
  {
    path: '/molecules',
    title: 'The ligands',
    description: 'Every chemical component.',
    prefix: true,
  },
  { path: '/molecules/hem', title: 'HEM', description: 'One ligand.' },
];

test('the query string and the fragment never reach the lookup', () => {
  expect(pageMetaFor(ROUTES, '/about?smiles=CCO')).toStrictEqual(ROUTES[1]);
  expect(pageMetaFor(ROUTES, '/about#section')).toStrictEqual(ROUTES[1]);
});

test('an unknown address is described as the home page', () => {
  expect(pageMetaFor(ROUTES, '/nonsense')).toStrictEqual(ROUTES[0]);
});

test('an address under no section is still described as the home page', () => {
  expect(pageMetaFor(SECTIONS, '/nonsense/deep')).toStrictEqual(SECTIONS[0]);
});

test('a section answers the query string it is opened with', () => {
  expect(pageMetaFor(SECTIONS, '/molecules/CLR?view=3d')).toStrictEqual(
    SECTIONS[1],
  );
});

test('a mounted address names the page under the mount, not the home page', () => {
  expect(pageMetaFor(ROUTES, '/surge/about', '/surge')).toStrictEqual(
    ROUTES[1],
  );
  expect(
    pageMetaFor(ROUTES, '/surge/about?smiles=CCO', '/surge'),
  ).toStrictEqual(ROUTES[1]);
  expect(pageMetaFor(ROUTES, '/surge', '/surge')).toStrictEqual(ROUTES[0]);
  expect(pageMetaFor(ROUTES, '/surge/', '/surge')).toStrictEqual(ROUTES[0]);
  expect(pageMetaFor(ROUTES, '/surge/nonsense', '/surge')).toStrictEqual(
    ROUTES[0],
  );
});

test('an address written from the site own root is read under a mount too', () => {
  expect(pageMetaFor(ROUTES, '/about', '/surge')).toStrictEqual(ROUTES[1]);
  expect(pageMetaFor(ROUTES, '/', '/surge')).toStrictEqual(ROUTES[0]);
});

test('a route the mount only starts the name of keeps its own address', () => {
  const routes: RouteMeta[] = [
    { path: '/', title: 'Home', description: 'The home page.' },
    { path: '/surgeon', title: 'Surgeon', description: 'Another page.' },
  ];

  expect(pageMetaFor(routes, '/surgeon', '/surge')).toStrictEqual(routes[1]);
});

test('a mounted address is read at the site own root before a section claims it', () => {
  const routes: RouteMeta[] = [
    { path: '/', title: 'Home', description: 'The home page.', prefix: true },
    {
      path: '/exercises',
      title: 'Exercises',
      description: 'Write it yourself.',
    },
    { path: '/tutorial', title: 'Tutorial', description: 'Read it first.' },
  ];

  expect(pageMetaFor(routes, '/surge/exercises', '/surge')).toStrictEqual(
    routes[1],
  );
  expect(pageMetaFor(routes, '/surge/tutorial/3', '/surge')).toStrictEqual(
    routes[0],
  );
  expect(pageMetaFor(routes, '/surge/nonsense', '/surge')).toStrictEqual(
    routes[0],
  );
});

test('a section named after the mount does not swallow the pages under it', () => {
  const routes: RouteMeta[] = [
    { path: '/', title: 'Home', description: 'The home page.' },
    {
      path: '/surge',
      title: 'Surge',
      description: 'Isomers.',
      prefix: true,
    },
    { path: '/about', title: 'About', description: 'What it computes.' },
  ];

  expect(pageMetaFor(routes, '/surge/about', '/surge')).toStrictEqual(
    routes[2],
  );
  expect(pageMetaFor(routes, '/surge/anything')).toStrictEqual(routes[1]);
});

test('the mount root is the site home, even when a page carries the mount name', () => {
  const routes: RouteMeta[] = [
    { path: '/', title: 'Home', description: 'The home page.' },
    { path: '/surge', title: 'Surge', description: 'Isomers.' },
  ];

  expect(pageMetaFor(routes, '/surge', '/surge')).toStrictEqual(routes[0]);
  expect(pageMetaFor(routes, '/surge/', '/surge')).toStrictEqual(routes[0]);
  expect(pageMetaFor(routes, '/surge/surge', '/surge')).toStrictEqual(
    routes[1],
  );
  expect(pageMetaFor(routes, '/surge')).toStrictEqual(routes[1]);
});

test('an absolute address is read for the path it carries', () => {
  expect(pageMetaFor(ROUTES, 'https://3d.cheminfo.org/about')).toStrictEqual(
    ROUTES[1],
  );
  expect(
    pageMetaFor(
      ROUTES,
      'https://learn.cheminfo.org/surge/about?smiles=CCO#cite',
      '/surge',
    ),
  ).toStrictEqual(ROUTES[1]);
  expect(pageMetaFor(ROUTES, 'http://localhost:10609/about')).toStrictEqual(
    ROUTES[1],
  );
  expect(pageMetaFor(ROUTES, 'https://3d.cheminfo.org/')).toStrictEqual(
    ROUTES[0],
  );
});

test('a maintenance screen answers noindex and the pages around it do not', () => {
  const routes: RouteMeta[] = [
    { path: '/', title: 'Home', description: 'The home page of the site.' },
    {
      path: '/names',
      title: 'Resolve compound names',
      description: 'The curation queue.',
      indexed: false,
    },
  ];

  expect(pageHeadTags({ site: 'derepflow', routes, url: '/names' })).toContain(
    '<meta name="robots" content="noindex, nofollow" />',
  );
  expect(pageHeadTags({ site: 'derepflow', routes, url: '/' })).not.toContain(
    'noindex',
  );
});

test('a sitemap leaves out the addresses no search engine is meant to list', () => {
  const routes: RouteMeta[] = [
    { path: '/', title: 'Home', description: 'The home page of the site.' },
    {
      path: '/names',
      title: 'Resolve compound names',
      description: 'The curation queue.',
      indexed: false,
    },
  ];
  const xml = sitemapXml({ site: 'derepflow', routes });

  expect(xml).toContain('<loc>https://derepflow.cheminfo.org/</loc>');
  expect(xml).not.toContain('/names');
});
