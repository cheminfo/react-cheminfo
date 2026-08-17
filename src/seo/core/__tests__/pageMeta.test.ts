import { expect, test } from 'vitest';

import { injectPageMeta } from '../pageMeta.ts';
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
  '<head>',
  '<title>placeholder</title>',
  '<meta name="description" content="placeholder" />',
  '</head>',
  '<body><div id="root"></div></body>',
  '</html>',
].join('\n');

test('a page carries the title and description of the route it answers', () => {
  const html = injectPageMeta(PAGE, {
    site: '3d',
    routes: ROUTES,
    url: '/about',
  });

  expect(html).toContain(
    '<title>About the browser conformer generator — 3d.cheminfo.org</title>',
  );
  expect(html).toContain(
    '<meta name="description" content="What this tool computes, and how to cite it." />',
  );
  expect(html).not.toContain('placeholder');
});

test('the canonical is absolute and drops the query string', () => {
  const html = injectPageMeta(PAGE, {
    site: '3d',
    routes: ROUTES,
    url: '/about?smiles=CCO&hide=header',
  });

  expect(html).toContain(
    '<link rel="canonical" href="https://3d.cheminfo.org/about" />',
  );
  expect(html).toContain(
    '<meta property="og:url" content="https://3d.cheminfo.org/about" />',
  );
});

test('the card names the site, its image and a large summary', () => {
  const html = injectPageMeta(PAGE, { site: '3d', routes: ROUTES, url: '/' });

  expect(html).toContain(
    '<meta property="og:site_name" content="3d.cheminfo.org" />',
  );
  expect(html).toContain(
    '<meta property="og:image" content="https://3d.cheminfo.org/og.png" />',
  );
  expect(html).toContain(
    '<meta name="twitter:card" content="summary_large_image" />',
  );
});

test('a product-shaped name is written without its address', () => {
  const html = injectPageMeta(PAGE, {
    site: 'chemcalc',
    routes: ROUTES,
    url: '/about',
  });

  expect(html).toContain(
    '<title>About the browser conformer generator — ChemCalc</title>',
  );
  expect(html).toContain(
    '<link rel="canonical" href="https://www.chemcalc.org/about" />',
  );
});

test('everything is written inside the head', () => {
  const html = injectPageMeta(PAGE, {
    site: '3d',
    routes: ROUTES,
    url: '/about',
  });

  expect(html.indexOf('og:title')).toBeLessThan(html.indexOf('</head>'));
  expect(html.indexOf('rel="canonical"')).toBeLessThan(html.indexOf('</head>'));
});

test('an address the site does not know is described as the home page', () => {
  const html = injectPageMeta(PAGE, {
    site: '3d',
    routes: ROUTES,
    url: '/nonsense',
  });

  expect(html).toContain(
    '<title>2D to 3D — conformers from a drawn structure — 3d.cheminfo.org</title>',
  );
  expect(html).toContain(
    '<link rel="canonical" href="https://3d.cheminfo.org/" />',
  );
});

test('an origin carrying markup is escaped', () => {
  const html = injectPageMeta(PAGE, {
    site: '3d',
    routes: ROUTES,
    url: '/about',
    origin: 'https://evil"><script>alert(1)</script>',
  });

  expect(html).not.toContain('<script>alert(1)</script>');
  expect(html).toContain('&quot;&gt;&lt;script&gt;');
});

test('a page with no head at all still gets one written', () => {
  const html = injectPageMeta('<html><body>hi</body></html>', {
    site: '3d',
    routes: ROUTES,
    url: '/',
  });

  expect(html).toContain('<title>');
  expect(html).toContain('rel="canonical"');
});
