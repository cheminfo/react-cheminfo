import { expect, test } from 'vitest';

import type { RouteMeta } from '../../core/routes.ts';

import { PAGE, ROUTES, prerendered, served } from './prerenderHarness.ts';

test('the built page carries the structured data a site describes itself with', () => {
  const page = prerendered({
    site: '3d',
    routes: ROUTES,
    category: 'ScienceApplication',
    description: 'Draw a structure and turn it in three dimensions.',
    browserRequirements: 'Requires WebAssembly',
    currency: 'USD',
    noscript: false,
  });

  expect(page).toContain(
    '"description": "Draw a structure and turn it in three dimensions."',
  );
  expect(page).toContain('"applicationCategory": "ScienceApplication"');
  expect(page).toContain('"browserRequirements": "Requires WebAssembly"');
  expect(page).toContain('"priceCurrency": "USD"');
  expect(page).toContain('"isAccessibleForFree": true');
  expect(page).not.toContain('<noscript>');
});

test('the noscript index says what the site asked it to say', () => {
  const page = prerendered({
    site: '3d',
    routes: ROUTES,
    category: false,
    origin: 'https://learn.cheminfo.org/surge/',
    noscript: {
      heading: '3d.cheminfo.org — the conformer playground',
      intro: 'Draw a structure. The tool needs JavaScript.',
    },
  });

  expect(page).toContain('<h1>3d.cheminfo.org — the conformer playground</h1>');
  expect(page).toContain('<p>Draw a structure. The tool needs JavaScript.</p>');
  expect(page).toContain(
    '<li><a href="/surge/">Conformers</a> — draw one and turn it</li>',
  );
  expect(page).toContain('<li><a href="/surge/about">About</a></li>');
  expect(page).not.toContain('application/ld+json');
});

test('the noscript index lists the pages the site curated for it', () => {
  const page = prerendered({
    site: '3d',
    routes: [
      ...ROUTES,
      { path: '/tutorial/1', title: 'Step 1', description: 'The first step.' },
    ],
    category: false,
    noscript: { routes: [ROUTES[0] as RouteMeta] },
  });

  expect(page).toContain(
    '<li><a href="/">Conformers</a> — draw one and turn it</li>',
  );
  expect(page).not.toContain('Step 1');
  expect(page).not.toContain('href="/about"');
});

test('a noscript index written relative survives a mount chosen at startup', () => {
  const page = prerendered({
    site: '3d',
    routes: ROUTES,
    category: false,
    origin: 'https://learn.cheminfo.org/surge/',
    noscript: { hrefs: 'relative' },
  });

  expect(page).toContain(
    '<li><a href="./">Conformers</a> — draw one and turn it</li>',
  );
  expect(page).toContain('<li><a href="./about">About</a></li>');
});

test('the noscript index lists the family the site curated for it', () => {
  const page = prerendered({
    site: '3d',
    routes: ROUTES,
    category: false,
    noscript: { ecosystem: { sites: ['tex'], taglines: false } },
  });

  expect(page).toContain(
    '    <li><a href="https://tex.cheminfo.org/">tex.cheminfo.org</a></li>',
  );
  expect(page).not.toContain('surge.cheminfo.org');
});

test('the head and the crawl path go exactly where the template kept room', () => {
  const page = prerendered({ site: '3d', routes: ROUTES });

  expect(page.indexOf('<title>')).toBeLessThan(page.indexOf('</head>'));
  expect(page.indexOf('application/ld+json')).toBeLessThan(
    page.indexOf('</head>'),
  );
  expect(page.indexOf('<noscript>')).toBeGreaterThan(page.indexOf('<body>'));
  expect(page).not.toContain('<!--cheminfo:');
  expect(page.endsWith('</body></html>')).toBe(true);
});

test('a template carrying no head marker is refused, never shipped headless', () => {
  expect(() =>
    prerendered(
      { site: '3d', routes: ROUTES },
      '<html><head><title>x</title></head><body></body></html>',
    ),
  ).toThrow('the page carries no <!--cheminfo:head-->');
});

test('a dev run fills the markers from the home route', () => {
  const page = served({ site: '3d', routes: ROUTES });

  expect(page).toContain('<title>Conformers in 3D — 3d.cheminfo.org</title>');
  expect(page).toContain(
    '<link rel="canonical" href="https://3d.cheminfo.org/" />',
  );
  expect(page).toContain('<noscript>');
  expect(page).not.toContain('<!--cheminfo:');
  expect(PAGE).toContain('<!--cheminfo:head-->');
});
