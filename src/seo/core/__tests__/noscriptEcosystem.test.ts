import { expect, test } from 'vitest';

import { noscriptIndex } from '../noscript.ts';
import type { RouteMeta } from '../routes.ts';

const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Conformers in 3D', description: 'The home page.' },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

const OPTIONS = { site: '3d', routes: ROUTES } as const;

test('the family is listed under the site pages, never the site itself', () => {
  const block = noscriptIndex({ ...OPTIONS, ecosystem: true });

  expect(block).toContain('  <h2>Our other tools</h2>');
  expect(block).toContain(
    '    <li><a href="https://inchi.cheminfo.org/">inchi.cheminfo.org</a> — InChI and InChIKey from a structure, in the browser.</li>',
  );
  expect(block).not.toContain('>3d.cheminfo.org</a>');
  expect(block.endsWith('  </ul>\n</noscript>')).toBe(true);
});

test('the family list names the sites the page chose, in the order it named them', () => {
  const block = noscriptIndex({
    ...OPTIONS,
    ecosystem: { sites: ['tex', 'surge', '3d'] },
  });

  expect(block).toContain(`  <h2>Our other tools</h2>
  <ul>
    <li><a href="https://tex.cheminfo.org/">tex.cheminfo.org</a> — LaTeX formulas rendered to SVG or PNG from a URL.</li>
    <li><a href="https://surge.cheminfo.org/">surge.cheminfo.org</a> — Every constitutional isomer of a molecular formula.</li>
  </ul>`);
  expect(block).not.toContain('>3d.cheminfo.org</a>');
  expect(block).not.toContain('inchi.cheminfo.org');
});

test('the family list drops the taglines when the page asks for hosts alone', () => {
  const block = noscriptIndex({
    ...OPTIONS,
    ecosystem: { sites: ['tex', 'surge'], taglines: false },
  });

  expect(block).toContain(`  <h2>Our other tools</h2>
  <ul>
    <li><a href="https://tex.cheminfo.org/">tex.cheminfo.org</a></li>
    <li><a href="https://surge.cheminfo.org/">surge.cheminfo.org</a></li>
  </ul>`);
  expect(block).not.toContain('—');
});

test('an empty family list is written as no list at all', () => {
  const block = noscriptIndex({ ...OPTIONS, ecosystem: { sites: [] } });

  expect(block).not.toContain('Our other tools');
  expect(block.endsWith('  </ul>\n</noscript>')).toBe(true);
});

test('asking for the whole family still lists every other site with its tagline', () => {
  expect(noscriptIndex({ ...OPTIONS, ecosystem: true })).toBe(
    noscriptIndex({ ...OPTIONS, ecosystem: {} }),
  );
});
