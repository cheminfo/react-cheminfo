import { expect, test } from 'vitest';

import type { NoscriptRoute } from '../noscript.ts';
import { noscriptIndex } from '../noscript.ts';
import type { RouteMeta } from '../routes.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Conformers in 3D', description: 'The home page.' },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

const OPTIONS = { site: '3d', routes: ROUTES } as const;

test('the block links every routed address under the site name', () => {
  expect(noscriptIndex(OPTIONS)).toBe(
    `<noscript>
  <h1>3d.cheminfo.org</h1>
  <p>Conformers in 3D from a structure you draw. This tool needs JavaScript; these are the pages it offers:</p>
  <ul>
    <li><a href="/">Conformers in 3D</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</noscript>`,
  );
});

test('a site opens the block in its own words', () => {
  expect(
    noscriptIndex({
      ...OPTIONS,
      heading: '3d.cheminfo.org — the conformer playground',
      intro:
        'Draw a structure and turn it in three dimensions. The tools need JavaScript; these are the pages they offer:',
    }),
  ).toBe(
    `<noscript>
  <h1>3d.cheminfo.org — the conformer playground</h1>
  <p>Draw a structure and turn it in three dimensions. The tools need JavaScript; these are the pages they offer:</p>
  <ul>
    <li><a href="/">Conformers in 3D</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</noscript>`,
  );
});

test('a page is linked under a short label, with what it is for after it', () => {
  const routes: RouteMeta[] = [
    {
      path: '/ph',
      title: 'pH of an acid, a base or a buffer',
      description: 'Compute the pH of a solution.',
      short: 'pH calculator',
      note: 'acids, bases and buffers',
    },
    {
      path: '/data',
      title: 'The pKa and Ksp tables',
      description: 'The constants behind the answers.',
      note: 'the pKa and Ksp tables',
    },
  ];

  expect(noscriptIndex({ site: '3d', routes })).toContain(
    `  <ul>
    <li><a href="/ph">pH calculator</a> — acids, bases and buffers</li>
    <li><a href="/data">The pKa and Ksp tables</a> — the pKa and Ksp tables</li>
  </ul>`,
  );
});

test('a title carrying markup cannot close the element it is written in', () => {
  const routes: RouteMeta[] = [
    {
      path: '/a&b',
      title: '<script>alert(1)</script>',
      description: 'Nothing.',
    },
  ];

  expect(noscriptIndex({ site: '3d', routes })).toContain(
    '<li><a href="/a&amp;b">&lt;script&gt;alert(1)&lt;/script&gt;</a></li>',
  );
});

test('the block lists the pages it was given, not the whole route table', () => {
  const routes: RouteMeta[] = [
    ...ROUTES,
    { path: '/tutorial/1', title: 'Step 1', description: 'The first step.' },
    { path: '/tutorial/2', title: 'Step 2', description: 'The second step.' },
  ];

  expect(noscriptIndex({ site: '3d', routes: [routes[0] as RouteMeta] })).toBe(
    `<noscript>
  <h1>3d.cheminfo.org</h1>
  <p>Conformers in 3D from a structure you draw. This tool needs JavaScript; these are the pages it offers:</p>
  <ul>
    <li><a href="/">Conformers in 3D</a></li>
  </ul>
</noscript>`,
  );
});

test('a page carrying pages of its own lists them under itself', () => {
  const routes: NoscriptRoute[] = [
    { path: '/', title: 'Converter', description: 'The home page.' },
    {
      path: '/exercises',
      title: 'Exercises',
      description: 'Write it yourself.',
      note: 'write it and be marked on it',
      children: [
        {
          path: '/exercises/patterns',
          title: 'Patterns',
          description: 'Write a SMARTS.',
        },
      ],
    },
  ];

  expect(noscriptIndex({ site: '3d', routes })).toBe(
    `<noscript>
  <h1>3d.cheminfo.org</h1>
  <p>Conformers in 3D from a structure you draw. This tool needs JavaScript; these are the pages it offers:</p>
  <ul>
    <li><a href="/">Converter</a></li>
    <li><a href="/exercises">Exercises</a> — write it and be marked on it
      <ul>
        <li><a href="/exercises/patterns">Patterns</a></li>
      </ul>
    </li>
  </ul>
</noscript>`,
  );
});

test('a block with no page to link writes no empty list', () => {
  expect(noscriptIndex({ site: '3d', routes: [] })).toBe(
    `<noscript>
  <h1>3d.cheminfo.org</h1>
  <p>Conformers in 3D from a structure you draw. This tool needs JavaScript; these are the pages it offers:</p>
</noscript>`,
  );
});

test('a blank label and a blank note are written as none', () => {
  const routes: RouteMeta[] = [
    {
      path: '/about',
      title: 'About the tool',
      description: 'What it computes.',
      short: '  ',
      note: '',
    },
  ];

  expect(noscriptIndex({ site: '3d', routes })).toContain(
    '<li><a href="/about">About the tool</a></li>',
  );
});
