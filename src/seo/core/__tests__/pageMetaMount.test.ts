import { expect, test } from 'vitest';

import { injectPageMeta, pageDocumentMeta } from '../pageMeta.ts';
import type { RouteMeta } from '../routes.ts';

const ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: '2D to 3D — conformers from a drawn structure',
    description: 'Draw a structure and turn it into 3D conformers.',
  },
  {
    path: '/about',
    title: 'About the browser conformer generator',
    description: 'What this tool computes, and how to cite it.',
  },
];

const PAGE = [
  '<!doctype html>',
  '<html lang="en">',
  '  <head>',
  '    <meta charset="utf-8" />',
  '    <!--cheminfo:head-->',
  '  </head>',
  '  <body><div id="root"></div><!--cheminfo:body--></body>',
  '</html>',
].join('\n');

test('a mounted deployment writes the mount into its addresses once', () => {
  const options = {
    site: '3d',
    routes: ROUTES,
    url: '/about?smiles=CCO',
    origin: 'https://learn.cheminfo.org/surge',
  } as const;

  expect(pageDocumentMeta(options)).toStrictEqual({
    title: 'About the browser conformer generator — 3d.cheminfo.org',
    description: 'What this tool computes, and how to cite it.',
    canonical: 'https://learn.cheminfo.org/surge/about',
  });

  const html = injectPageMeta(PAGE, options);

  expect(html).toContain(
    '<link rel="canonical" href="https://learn.cheminfo.org/surge/about" />',
  );
  expect(html).toContain(
    '<meta property="og:url" content="https://learn.cheminfo.org/surge/about" />',
  );
  expect(html).toContain(
    '<meta property="og:image" content="https://learn.cheminfo.org/surge/og.png" />',
  );
});

test('a mounted server titles the page it answers, not the home page', () => {
  const options = {
    site: '3d',
    routes: ROUTES,
    origin: 'https://learn.cheminfo.org/surge',
  } as const;

  expect(
    pageDocumentMeta({ ...options, url: '/surge/about?smiles=CCO' }),
  ).toStrictEqual({
    title: 'About the browser conformer generator — 3d.cheminfo.org',
    description: 'What this tool computes, and how to cite it.',
    canonical: 'https://learn.cheminfo.org/surge/about',
  });
  expect(pageDocumentMeta({ ...options, url: '/surge/' })).toStrictEqual({
    title: '2D to 3D — conformers from a drawn structure — 3d.cheminfo.org',
    description: 'Draw a structure and turn it into 3D conformers.',
    canonical: 'https://learn.cheminfo.org/surge/',
  });
});

test('a build passing an address from the site own root writes the same head', () => {
  const options = {
    site: '3d',
    routes: ROUTES,
    origin: 'https://learn.cheminfo.org/surge',
  } as const;

  expect(pageDocumentMeta({ ...options, url: '/about' })).toStrictEqual(
    pageDocumentMeta({ ...options, url: '/surge/about' }),
  );
  expect(injectPageMeta(PAGE, { ...options, url: '/about' })).toBe(
    injectPageMeta(PAGE, { ...options, url: '/surge/about' }),
  );
});

test('a home page answering everything beneath it still lets the mount come off', () => {
  const routes: RouteMeta[] = [
    { ...(ROUTES[0] as RouteMeta), prefix: true },
    ROUTES[1] as RouteMeta,
  ];
  const options = {
    site: '3d',
    routes,
    url: '/surge/about',
    origin: 'https://learn.cheminfo.org/surge',
  } as const;

  expect(pageDocumentMeta(options)).toStrictEqual({
    title: 'About the browser conformer generator — 3d.cheminfo.org',
    description: 'What this tool computes, and how to cite it.',
    canonical: 'https://learn.cheminfo.org/surge/about',
  });
  expect(injectPageMeta(PAGE, options)).toContain(
    '<title>About the browser conformer generator — 3d.cheminfo.org</title>',
  );
});

test('the mount root is the home page, even when a route carries the mount name', () => {
  const routes: RouteMeta[] = [
    ROUTES[0] as RouteMeta,
    { path: '/surge', title: 'Surge', description: 'Isomer generation.' },
  ];
  const options = {
    site: '3d',
    routes,
    origin: 'https://learn.cheminfo.org/surge',
  } as const;

  expect(pageDocumentMeta({ ...options, url: '/surge' })).toStrictEqual({
    title: '2D to 3D — conformers from a drawn structure — 3d.cheminfo.org',
    description: 'Draw a structure and turn it into 3D conformers.',
    canonical: 'https://learn.cheminfo.org/surge/',
  });
  expect(pageDocumentMeta({ ...options, url: '/surge/surge' })).toStrictEqual({
    title: 'Surge — 3d.cheminfo.org',
    description: 'Isomer generation.',
    canonical: 'https://learn.cheminfo.org/surge/surge',
  });
});

test('an app handing over the address it is on is answered, not sent home', () => {
  const options = {
    site: '3d',
    routes: ROUTES,
    origin: 'https://learn.cheminfo.org/surge',
  } as const;

  expect(
    pageDocumentMeta({
      ...options,
      url: 'https://learn.cheminfo.org/surge/about?smiles=CCO#cite',
    }),
  ).toStrictEqual({
    title: 'About the browser conformer generator — 3d.cheminfo.org',
    description: 'What this tool computes, and how to cite it.',
    canonical: 'https://learn.cheminfo.org/surge/about',
  });
  expect(
    pageDocumentMeta({
      site: '3d',
      routes: ROUTES,
      url: 'https://3d.cheminfo.org/about',
    }),
  ).toStrictEqual({
    title: 'About the browser conformer generator — 3d.cheminfo.org',
    description: 'What this tool computes, and how to cite it.',
    canonical: 'https://3d.cheminfo.org/about',
  });
});
