import { expect, test } from 'vitest';

import { pageProseHtml } from '../pageProse.ts';

test('a page says its prose, its list and its facts under its heading', () => {
  expect(
    pageProseHtml({
      heading: 'Carbon (C) — its atomic orbitals',
      paragraphs: ['Carbon is element 6.', 'Its ground state is 1s² 2s² 2p².'],
      list: ['four valence electrons', 'two of them unpaired'],
      table: {
        columns: ['Orbital', 'Electrons', 'Energy'],
        rows: [
          ['1s', '2', '−309.4 eV'],
          ['2s', '2', '−30.9 eV'],
        ],
        caption: 'Slater screening, hydrogen-like energies.',
      },
    }),
  ).toBe(`
  <p>Carbon is element 6.</p>
  <p>Its ground state is 1s² 2s² 2p².</p>
  <ul>
    <li>four valence electrons</li>
    <li>two of them unpaired</li>
  </ul>
  <table>
    <caption>Slater screening, hydrogen-like energies.</caption>
    <thead>
      <tr><th>Orbital</th><th>Electrons</th><th>Energy</th></tr>
    </thead>
    <tbody>
      <tr><td>1s</td><td>2</td><td>−309.4 eV</td></tr>
      <tr><td>2s</td><td>2</td><td>−30.9 eV</td></tr>
    </tbody>
  </table>`);
});

test('a section carries its own heading, under the page heading', () => {
  expect(
    pageProseHtml({
      heading: 'How it works',
      paragraphs: ['Three steps.'],
      sections: [
        {
          heading: 'Torsions',
          paragraphs: ['A single bond between two atoms.'],
        },
        {
          heading: 'Minimisation',
          paragraphs: ['MMFF94 relaxes each geometry.'],
        },
      ],
    }),
  ).toBe(`
  <p>Three steps.</p>
  <h2>Torsions</h2>
  <p>A single bond between two atoms.</p>
  <h2>Minimisation</h2>
  <p>MMFF94 relaxes each geometry.</p>`);
});

test('the heading itself is left to the caller, which writes the one h1', () => {
  expect(pageProseHtml({ heading: 'Carbon' })).toBe('');
});

test('text a reader typed cannot close a tag', () => {
  expect(
    pageProseHtml({
      heading: 'x',
      paragraphs: ['</p><script>alert(1)</script>'],
      list: ['a & b'],
      table: { columns: ['<th>'], rows: [['"quoted"']] },
    }),
  ).toBe(`
  <p>&lt;/p&gt;&lt;script&gt;alert(1)&lt;/script&gt;</p>
  <ul>
    <li>a &amp; b</li>
  </ul>
  <table>
    <thead>
      <tr><th>&lt;th&gt;</th></tr>
    </thead>
    <tbody>
      <tr><td>"quoted"</td></tr>
    </tbody>
  </table>`);
});

test('a table with no row, a list with no item and blank prose write nothing', () => {
  expect(
    pageProseHtml({
      heading: 'x',
      paragraphs: [' '.repeat(3)],
      list: [],
      table: { columns: ['Orbital'], rows: [] },
      sections: [{ heading: '  ' }],
    }),
  ).toBe('');
});

test('a run is written at the indentation it is asked for', () => {
  expect(
    pageProseHtml({ heading: 'x', paragraphs: ['One.'] }, ' '.repeat(4)),
  ).toBe('\n    <p>One.</p>');
});
