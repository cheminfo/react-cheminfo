import { expect, test } from 'vitest';

import type { RouteMeta } from '../routes.ts';
import {
  noscriptIndex,
  robotsTxt,
  sitemapXml,
  structuredDataScript,
} from '../siteFiles.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Conformers in 3D', description: 'The home page.' },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

const OPTIONS = { site: '3d', routes: ROUTES } as const;

test('the sitemap lists every routed address, absolute', () => {
  expect(sitemapXml(OPTIONS)).toBe(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://3d.cheminfo.org/</loc></url>
  <url><loc>https://3d.cheminfo.org/about</loc></url>
</urlset>
`,
  );
});

test('robots allows everything and names the sitemap it is written with', () => {
  expect(robotsTxt(OPTIONS)).toBe(
    'User-agent: *\nAllow: /\n\nSitemap: https://3d.cheminfo.org/sitemap.xml\n',
  );
});

test('robots keeps the endpoints out of the index', () => {
  const robots = robotsTxt(OPTIONS, ['/v1/', '/docs']);

  expect(robots).toContain('Disallow: /v1/');
  expect(robots).toContain('Disallow: /docs');
});

test('the structured data names the site, its address and its publisher', () => {
  const script = structuredDataScript(OPTIONS);

  expect(script).toContain('"@type": "WebApplication"');
  expect(script).toContain('"name": "3d.cheminfo.org"');
  expect(script).toContain('"url": "https://3d.cheminfo.org/"');
  expect(script).toContain(
    '"description": "Conformers in 3D from a structure you draw."',
  );
  expect(script).toContain('"applicationCategory": "EducationalApplication"');
  expect(script).toContain('"name": "cheminfo"');
});

test('the structured data cannot close its own script tag', () => {
  const script = structuredDataScript({
    ...OPTIONS,
    operatingSystem: '</script><script>alert(1)</script>',
  });

  expect(script).not.toContain('<script>alert(1)');
  expect(script).toContain(String.raw`\u003c/script>`);
});

test('the noscript block links every routed address', () => {
  const block = noscriptIndex(OPTIONS);

  expect(block).toContain('<h1>3d.cheminfo.org</h1>');
  expect(block).toContain('<li><a href="/">Conformers in 3D</a></li>');
  expect(block).toContain('<li><a href="/about">About</a></li>');
  expect(block).toContain('This tool needs JavaScript');
});
