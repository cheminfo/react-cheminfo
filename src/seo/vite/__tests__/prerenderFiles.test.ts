import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import type { RouteMeta } from '../../core/routes.ts';
import { cheminfoPrerender } from '../prerender.ts';

import { PAGE, ROUTES, build } from './prerenderHarness.ts';

test('robots and the sitemap are written under the mount the site answers on', () => {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-prerender-'));
  writeFileSync(join(out, 'index.html'), PAGE);

  build(
    {
      site: '3d',
      routes: [ROUTES[0] as RouteMeta],
      origin: 'https://learn.cheminfo.org/surge/',
      robots: [
        {
          path: '/v1/',
          comment: 'The JSON API is a set of endpoints, not pages.',
        },
      ],
    },
    out,
  );

  expect(readFileSync(join(out, 'robots.txt'), 'utf8')).toBe(
    `User-agent: *
Allow: /surge/
# The JSON API is a set of endpoints, not pages.
Disallow: /surge/v1/

Sitemap: https://learn.cheminfo.org/surge/sitemap.xml
`,
  );
  expect(readFileSync(join(out, 'sitemap.xml'), 'utf8')).toContain(
    '<url><loc>https://learn.cheminfo.org/surge/</loc></url>',
  );
});

test('a page of a mounted site is canonical under the mount, once', () => {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-prerender-'));
  writeFileSync(join(out, 'index.html'), PAGE);

  build(
    { site: '3d', routes: ROUTES, origin: 'https://learn.cheminfo.org/surge' },
    out,
  );

  const about = readFileSync(join(out, 'about', 'index.html'), 'utf8');

  expect(about).toContain(
    '<link rel="canonical" href="https://learn.cheminfo.org/surge/about" />',
  );
  expect(about).toContain('<title>About — 3d.cheminfo.org</title>');
});

test('a site naming no root still gets the index a server hands out', () => {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-prerender-'));
  writeFileSync(join(out, 'index.html'), PAGE);

  build(
    {
      site: '3d',
      routes: [
        { path: '/first', title: 'First', description: 'The first page.' },
      ],
    },
    out,
  );

  const index = readFileSync(join(out, 'index.html'), 'utf8');

  expect(index).toContain('<title>First — 3d.cheminfo.org</title>');
  expect(index).toContain(
    '<link rel="canonical" href="https://3d.cheminfo.org/first" />',
  );
  expect(index).not.toContain('<!--cheminfo:head-->');
});

test('an address written twice is refused before anything is built', () => {
  expect(() =>
    cheminfoPrerender({
      site: '3d',
      routes: [
        { path: '/', title: 'Home', description: 'The home page.' },
        { path: '/about', title: 'About', description: 'One.' },
        { path: '/about', title: 'About again', description: 'Two.' },
      ],
    }),
  ).toThrow('a route path is written once: "/about"');
});

test('an address that would write outside the build output is refused', () => {
  expect(() =>
    cheminfoPrerender({
      site: '3d',
      routes: [{ path: '/../escaped', title: 'Out', description: 'No.' }],
    }),
  ).toThrow('a route path stays inside the site: "/../escaped"');
});

test('a page displaying the markup a site is about keeps its prose', () => {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-prerender-'));
  writeFileSync(
    join(out, 'index.html'),
    [
      '<!doctype html><html lang="en"><head>',
      '<meta charset="utf-8" />',
      '<!--cheminfo:head-->',
      '</head><body><code>&lt;title&gt;x&lt;/title&gt; goes in the &lt;/head&gt;</code>',
      '<!--cheminfo:body-->',
      '</body></html>',
    ].join('\n'),
  );

  build({ site: '3d', routes: ROUTES }, out);

  const about = readFileSync(join(out, 'about', 'index.html'), 'utf8');

  expect(about).toContain('<title>About — 3d.cheminfo.org</title>');
  expect(about).toContain(
    '<code>&lt;title&gt;x&lt;/title&gt; goes in the &lt;/head&gt;</code>',
  );
  expect(about.match(/<title>/g)).toHaveLength(1);
});
