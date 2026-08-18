import { expect, test } from 'vitest';

import type { NoscriptRoute } from '../noscript.ts';
import { noscriptIndex } from '../noscript.ts';
import type { RouteMeta } from '../routes.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Conformers in 3D', description: 'The home page.' },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

const OPTIONS = { site: '3d', routes: ROUTES } as const;

test('a mounted deployment links its own pages, not the host it shares', () => {
  expect(
    noscriptIndex({ ...OPTIONS, origin: 'https://learn.cheminfo.org/surge/' }),
  ).toContain(
    `  <ul>
    <li><a href="/surge/">Conformers in 3D</a></li>
    <li><a href="/surge/about">About</a></li>
  </ul>`,
  );
});

test('relative addresses follow the mount the page was stamped with', () => {
  expect(noscriptIndex({ ...OPTIONS, hrefs: 'relative' })).toBe(
    `<noscript>
  <h1>3d.cheminfo.org</h1>
  <p>Conformers in 3D from a structure you draw. This tool needs JavaScript; these are the pages it offers:</p>
  <ul>
    <li><a href="./">Conformers in 3D</a></li>
    <li><a href="./about">About</a></li>
  </ul>
</noscript>`,
  );
});

test('a relative address resolves under the base a container stamps in', () => {
  const emitted = hrefsOf(noscriptIndex({ ...OPTIONS, hrefs: 'relative' }));

  expect(
    resolvedAgainst(emitted, 'https://www.cheminfo.org/surge/'),
  ).toStrictEqual([
    'https://www.cheminfo.org/surge/',
    'https://www.cheminfo.org/surge/about',
  ]);
  expect(resolvedAgainst(emitted, 'https://3d.cheminfo.org/')).toStrictEqual([
    'https://3d.cheminfo.org/',
    'https://3d.cheminfo.org/about',
  ]);
});

function hrefsOf(block: string): string[] {
  return [...block.matchAll(/href="(?<href>[^"]*)"/g)].map(
    (match) => match.groups?.href ?? '',
  );
}

function resolvedAgainst(hrefs: readonly string[], base: string): string[] {
  return hrefs.map((href) => new URL(href, base).href);
}

test('a relative index ignores the mount the origin names, on purpose', () => {
  expect(
    noscriptIndex({
      ...OPTIONS,
      origin: 'https://learn.cheminfo.org/surge/',
      hrefs: 'relative',
    }),
  ).toContain('<li><a href="./about">About</a></li>');
});

test('a nested page follows the mount and the relative shape alike', () => {
  const routes: NoscriptRoute[] = [
    {
      path: '/exercises',
      title: 'Exercises',
      description: 'Write it yourself.',
      children: [
        {
          path: '/exercises/patterns',
          title: 'Patterns',
          description: 'Write a SMARTS.',
        },
      ],
    },
  ];

  expect(
    noscriptIndex({
      site: '3d',
      routes,
      origin: 'https://learn.cheminfo.org/surge/',
    }),
  ).toContain('<li><a href="/surge/exercises/patterns">Patterns</a></li>');
  expect(noscriptIndex({ site: '3d', routes, hrefs: 'relative' })).toContain(
    '<li><a href="./exercises/patterns">Patterns</a></li>',
  );
});

test('a path written without its slash is linked the same way in both shapes', () => {
  const routes: RouteMeta[] = [
    { path: 'about', title: 'About', description: 'What it computes.' },
  ];

  expect(noscriptIndex({ site: '3d', routes })).toContain('href="/about"');
  expect(noscriptIndex({ site: '3d', routes, hrefs: 'relative' })).toContain(
    'href="./about"',
  );
});
