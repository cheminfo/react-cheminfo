import { expect, test } from 'vitest';

import { robotsTxt } from '../robots.ts';
import type { RouteMeta } from '../routes.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Conformers in 3D', description: 'The home page.' },
];

const OPTIONS = { site: '3d', routes: ROUTES } as const;

test('robots allows everything and names the sitemap it is written with', () => {
  expect(robotsTxt(OPTIONS)).toBe(
    'User-agent: *\nAllow: /\n\nSitemap: https://3d.cheminfo.org/sitemap.xml\n',
  );
});

test('robots keeps the endpoints out of the index', () => {
  expect(robotsTxt(OPTIONS, ['/v1/', '/docs'])).toBe(
    `User-agent: *
Allow: /
Disallow: /v1/
Disallow: /docs

Sitemap: https://3d.cheminfo.org/sitemap.xml
`,
  );
});

test('a disallowed address may say why, on the line above it', () => {
  expect(
    robotsTxt(OPTIONS, [
      {
        path: '/test-data/',
        comment:
          'The regression corpora are multi-megabyte archives, not pages.',
      },
    ]),
  ).toBe(
    `User-agent: *
Allow: /
# The regression corpora are multi-megabyte archives, not pages.
Disallow: /test-data/

Sitemap: https://3d.cheminfo.org/sitemap.xml
`,
  );
});

test('a comment written with its own hash is not written with two', () => {
  expect(
    robotsTxt(OPTIONS, [
      {
        path: '/v1/',
        comment: '# The API and its documentation are endpoints, not pages.',
      },
      { path: '/docs' },
    ]),
  ).toBe(
    `User-agent: *
Allow: /
# The API and its documentation are endpoints, not pages.
Disallow: /v1/
Disallow: /docs

Sitemap: https://3d.cheminfo.org/sitemap.xml
`,
  );
});

test('a mounted deployment allows its mount, not the host it shares', () => {
  expect(
    robotsTxt({ ...OPTIONS, origin: 'https://learn.cheminfo.org/surge/' }, [
      {
        path: '/v1/',
        comment: 'The JSON API is a set of endpoints, not pages.',
      },
    ]),
  ).toBe(
    `User-agent: *
Allow: /surge/
# The JSON API is a set of endpoints, not pages.
Disallow: /surge/v1/

Sitemap: https://learn.cheminfo.org/surge/sitemap.xml
`,
  );
});

test('a comment written over several lines is folded onto its own line', () => {
  expect(
    robotsTxt(OPTIONS, [
      { path: '/v1/', comment: 'The JSON API.\nDisallow: /' },
    ]),
  ).toBe(
    `User-agent: *
Allow: /
# The JSON API. Disallow: /
Disallow: /v1/

Sitemap: https://3d.cheminfo.org/sitemap.xml
`,
  );
});

test('a comment broken by a carriage return is folded the same way', () => {
  expect(
    robotsTxt(OPTIONS, [
      { path: '/docs', comment: 'The generated\r\nreference.\r\nDisallow: /' },
    ]),
  ).toBe(
    `User-agent: *
Allow: /
# The generated reference. Disallow: /
Disallow: /docs

Sitemap: https://3d.cheminfo.org/sitemap.xml
`,
  );
});

test('a comment that says nothing is written as no line at all', () => {
  expect(robotsTxt(OPTIONS, [{ path: '/docs', comment: ' \t\n ' }])).toBe(
    `User-agent: *
Allow: /
Disallow: /docs

Sitemap: https://3d.cheminfo.org/sitemap.xml
`,
  );
});

test('a disallowed address carrying a line break is refused', () => {
  expect(() => robotsTxt(OPTIONS, ['/v1/\nDisallow: /'])).toThrow(
    String.raw`a disallowed address is written on one line: "/v1/\nDisallow: /"`,
  );
  expect(() => robotsTxt(OPTIONS, [{ path: '/v1/\r\nDisallow: /' }])).toThrow(
    String.raw`a disallowed address is written on one line: "/v1/\r\nDisallow: /"`,
  );
});

test('an empty disallowed address is refused, never written as the root', () => {
  expect(() => robotsTxt(OPTIONS, [''])).toThrow(
    'a disallowed address is a path, never the empty string',
  );
  expect(() => robotsTxt(OPTIONS, [{ path: '' }])).toThrow(
    'a disallowed address is a path, never the empty string',
  );
});

test('a blank disallowed address is refused, never read as the whole site', () => {
  expect(() => robotsTxt(OPTIONS, [' '.repeat(3)])).toThrow(
    'a disallowed address is a path, never blank: "   "',
  );
  expect(() => robotsTxt(OPTIONS, [{ path: ' ' }])).toThrow(
    'a disallowed address is a path, never blank: " "',
  );
  expect(() => robotsTxt(OPTIONS, ['\t'])).toThrow(
    String.raw`a disallowed address is a path, never blank: "\t"`,
  );
});

test('a disallowed address carrying a fragment is refused, never truncated', () => {
  expect(() => robotsTxt(OPTIONS, ['/v1/#frag'])).toThrow(
    'a disallowed address carries no fragment: "/v1/#frag"',
  );
  expect(() => robotsTxt(OPTIONS, [{ path: '#' }])).toThrow(
    'a disallowed address carries no fragment: "#"',
  );
});

test('a disallowed address padded with whitespace is refused', () => {
  expect(() => robotsTxt(OPTIONS, [' /v1/'])).toThrow(
    'a disallowed address is written without padding: " /v1/"',
  );
  expect(() => robotsTxt(OPTIONS, [{ path: '/v1/ ' }])).toThrow(
    'a disallowed address is written without padding: "/v1/ "',
  );
  expect(() => robotsTxt(OPTIONS, ['\t/docs'])).toThrow(
    String.raw`a disallowed address is written without padding: "\t/docs"`,
  );
});
