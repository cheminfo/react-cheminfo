import { expect, test } from 'vitest';

import type { RouteMeta } from '../routes.ts';
import { mountPathOf, originOf, sitemapXml } from '../siteFiles.ts';

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

test('a mounted deployment lists its addresses under the mount, once', () => {
  expect(
    sitemapXml({ ...OPTIONS, origin: 'https://learn.cheminfo.org/surge/' }),
  ).toBe(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://learn.cheminfo.org/surge/</loc></url>
  <url><loc>https://learn.cheminfo.org/surge/about</loc></url>
</urlset>
`,
  );
});

test('the origin is the site host until a deployment names another', () => {
  expect(originOf(OPTIONS)).toBe('https://3d.cheminfo.org');
  expect(
    originOf({ ...OPTIONS, origin: 'https://learn.cheminfo.org/surge/' }),
  ).toBe('https://learn.cheminfo.org/surge');
});

test('the mount is the path half of the address the deployment named', () => {
  expect(mountPathOf(OPTIONS)).toBe('');
  expect(mountPathOf({ ...OPTIONS, origin: 'https://3d.cheminfo.org/' })).toBe(
    '',
  );
  expect(
    mountPathOf({ ...OPTIONS, origin: 'https://learn.cheminfo.org/surge/' }),
  ).toBe('/surge');
});

test('an address that is not one is refused, not read as the host root', () => {
  expect(() => mountPathOf({ ...OPTIONS, origin: '' })).toThrow(
    'an origin is an absolute address, e.g. https://surge.cheminfo.org: ""',
  );
  expect(() => mountPathOf({ ...OPTIONS, origin: '/surge' })).toThrow(
    'an origin is an absolute address, e.g. https://surge.cheminfo.org: "/surge"',
  );
  expect(() =>
    originOf({ ...OPTIONS, origin: 'learn.cheminfo.org/surge' }),
  ).toThrow(
    'an origin is an absolute address, e.g. https://surge.cheminfo.org: "learn.cheminfo.org/surge"',
  );
});

test('a doubled trailing slash composes one address, not one with a gap', () => {
  expect(
    originOf({ ...OPTIONS, origin: 'https://learn.cheminfo.org/surge//' }),
  ).toBe('https://learn.cheminfo.org/surge');
  expect(
    sitemapXml({ ...OPTIONS, origin: 'https://learn.cheminfo.org/surge//' }),
  ).toContain('<url><loc>https://learn.cheminfo.org/surge/about</loc></url>');
});

test('a sitemap with no address in it is refused, never written empty', () => {
  expect(() => sitemapXml({ site: '3d', routes: [] })).toThrow(
    'a sitemap lists at least one address',
  );
});

test('an origin in a scheme no crawler fetches is refused, not read as a path', () => {
  for (const origin of [
    'localhost:3000',
    'c:/build/dist',
    // Assembled rather than written out: a script URL in source is an eslint
    // error, and it is the scheme this guard most has to refuse.
    ['java', 'script:alert(1)'].join(''),
    'mailto:a@b.c',
    'x:',
  ]) {
    expect(() => originOf({ ...OPTIONS, origin })).toThrow(
      `an origin is an absolute address, e.g. https://surge.cheminfo.org: ${JSON.stringify(origin)}`,
    );
    expect(() => mountPathOf({ ...OPTIONS, origin })).toThrow(
      `an origin is an absolute address, e.g. https://surge.cheminfo.org: ${JSON.stringify(origin)}`,
    );
  }
});

test('a plain http origin is served as written', () => {
  expect(originOf({ ...OPTIONS, origin: 'http://localhost:3000/surge' })).toBe(
    'http://localhost:3000/surge',
  );
  expect(
    mountPathOf({ ...OPTIONS, origin: 'http://localhost:3000/surge' }),
  ).toBe('/surge');
});
