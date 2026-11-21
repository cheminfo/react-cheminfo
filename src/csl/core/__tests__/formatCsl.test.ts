import { expect, test } from 'vitest';

import type { CslItem } from '../cslItems.ts';
import { readCslText } from '../cslItems.ts';
import { formatCslCitations, formatCslEntries } from '../formatCsl.ts';

import { ZOTERO_COPY } from './zoteroCopy.ts';

const [chemcalc, nmrium] = readCslText(ZOTERO_COPY) as [CslItem, CslItem];

function entry(margin: string, text: string): string {
  return `<div class="csl-entry"><div class="csl-left-margin">${margin}</div><div class="csl-right-inline">${text}</div></div>`;
}

test('ACS numbers the works in the order they are first cited', async () => {
  const formatted = await formatCslCitations(
    [[nmrium], [chemcalc, nmrium], [chemcalc]],
    'american-chemical-society',
  );

  expect(formatted).toStrictEqual({
    citations: ['<sup>1</sup>', '<sup>1,2</sup>', '<sup>2</sup>'],
    bibliography: [
      entry(
        '(1)',
        'Patiny, L.; Musallam, H.; Bolaños, A.; Zasso, M.; Wist, J.; Karayilan, M.; Ziegler, E.; Liermann, J. C.; Schlörer, N. E. NMRium: Teaching Nuclear Magnetic Resonance Spectra Interpretation in an Online Platform. <i>Beilstein J. Org. Chem.</i> <b>2024</b>, <i>20</i>, 25–31. https://doi.org/10.3762/bjoc.20.4',
      ),
      entry(
        '(2)',
        'Patiny, L.; Borel, A. ChemCalc: A Building Block for Tomorrow’s Chemical Infrastructure. <i>J. Chem. Inf. Model.</i> <b>2013</b>, <i>53</i> (5), 1223–1228. https://doi.org/10.1021/ci300563h',
      ),
    ],
  });
});

test('Nature writes the same works its own way', async () => {
  const formatted = await formatCslCitations([[chemcalc, nmrium]], 'nature');

  expect(formatted).toStrictEqual({
    citations: ['<sup>1,2</sup>'],
    bibliography: [
      entry(
        '1.',
        'Patiny, L. &#38; Borel, A. ChemCalc: A Building Block for Tomorrow’s Chemical Infrastructure. <i>J. Chem. Inf. Model.</i> <b>53</b>, 1223–1228 (2013).',
      ),
      entry(
        '2.',
        'Patiny, L. <i>et al.</i> NMRium: Teaching nuclear magnetic resonance spectra interpretation in an online platform. <i>Beilstein J. Org. Chem.</i> <b>20</b>, 25–31 (2024).',
      ),
    ],
  });
});

test('Tetrahedron is formatted by the style it depends on', async () => {
  const formatted = await formatCslCitations([[chemcalc]], 'tetrahedron');

  expect(formatted).toStrictEqual({
    citations: ['[1]'],
    bibliography: [
      entry(
        '[1]',
        'L. Patiny, A. Borel, ChemCalc: A Building Block for Tomorrow’s Chemical Infrastructure, J. Chem. Inf. Model. 53 (2013) 1223–1228. https://doi.org/10.1021/ci300563h.',
      ),
    ],
  });
});

test('a citation of nothing stays empty, and nothing loads for none', async () => {
  const formatted = await formatCslCitations(
    [[], [chemcalc], []],
    'american-chemical-society',
  );

  expect(formatted.citations).toStrictEqual(['', '<sup>1</sup>', '']);
  await expect(
    formatCslCitations([[]], 'american-chemical-society'),
  ).resolves.toStrictEqual({ citations: [''], bibliography: [] });
});

test('the document keeps its own copy of what was cited', async () => {
  const before = structuredClone(chemcalc);
  await formatCslCitations([[chemcalc]], 'american-chemical-society');

  expect(chemcalc).toStrictEqual(before);
});

test('a work copied on its own is the entry the style writes, without its number', async () => {
  await expect(
    formatCslEntries([chemcalc, nmrium], 'american-chemical-society', 'html'),
  ).resolves.toStrictEqual([
    'Patiny, L.; Borel, A. ChemCalc: A Building Block for Tomorrow’s Chemical Infrastructure. <i>J. Chem. Inf. Model.</i> <b>2013</b>, <i>53</i> (5), 1223–1228. https://doi.org/10.1021/ci300563h',
    'Patiny, L.; Musallam, H.; Bolaños, A.; Zasso, M.; Wist, J.; Karayilan, M.; Ziegler, E.; Liermann, J. C.; Schlörer, N. E. NMRium: Teaching Nuclear Magnetic Resonance Spectra Interpretation in an Online Platform. <i>Beilstein J. Org. Chem.</i> <b>2024</b>, <i>20</i>, 25–31. https://doi.org/10.3762/bjoc.20.4',
  ]);
  await expect(
    formatCslEntries([chemcalc], 'nature', 'text'),
  ).resolves.toStrictEqual([
    'Patiny, L. & Borel, A. ChemCalc: A Building Block for Tomorrow’s Chemical Infrastructure. J. Chem. Inf. Model. 53, 1223–1228 (2013).',
  ]);
  await expect(formatCslEntries([], 'nature', 'text')).resolves.toStrictEqual(
    [],
  );
});
