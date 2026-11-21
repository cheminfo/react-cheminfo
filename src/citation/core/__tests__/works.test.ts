import { expect, test } from 'vitest';

import { formatCitation } from '../formats.ts';
import { PLATFORM_PAPER } from '../platformPaper.ts';
import type { CitedWork } from '../works.ts';
import {
  citationsFilename,
  citedReferences,
  formatCitations,
} from '../works.ts';

import { PAPER } from './paper.ts';

const WORKS: readonly CitedWork[] = [
  { reference: PAPER, what: 'The screening method' },
  {
    reference: PLATFORM_PAPER,
    what: 'The browser platform',
    note: 'Cite it for the site itself.',
  },
];

test('the references come back in the order the site names its works', () => {
  expect(citedReferences(WORKS)).toStrictEqual([PAPER, PLATFORM_PAPER]);
});

test('two written citations take one line each', async () => {
  await expect(formatCitations(citedReferences(WORKS), 'text')).resolves.toBe(
    `${await formatCitation(PAPER, 'text')}\n${await formatCitation(PLATFORM_PAPER, 'text')}`,
  );
});

test('the style asked for is used for every reference', async () => {
  await expect(
    formatCitations(
      citedReferences(WORKS),
      'text',
      'royal-society-of-chemistry',
    ),
  ).resolves.toBe(
    'J. R. Vanderveen, L. Patiny, C. B. Chalifoux, M. J. Jessop and P. G. Jessop, Green Chem., 2015, 17, 5182–5188.\nL. Patiny, Chimia, 2025, 79, 66–69.',
  );
});

test('two HTML citations are broken into two lines', async () => {
  await expect(
    formatCitations(citedReferences(WORKS), 'html'),
  ).resolves.toContain(
    '5182–5188. https://doi.org/10.1039/C5GC01022E<br>Patiny, L. Unlocking',
  );
});

test('two markdown citations are two paragraphs', async () => {
  await expect(
    formatCitations(citedReferences(WORKS), 'markdown'),
  ).resolves.toContain('\n\nPatiny, L. Unlocking');
});

test('a BibTeX file holds both entries, keyed on their own first author', async () => {
  const bibtex = await formatCitations(citedReferences(WORKS), 'bibtex');

  expect(bibtex).toContain('@article{Vanderveen2015,');
  expect(bibtex).toContain('}\n\n@article{Patiny2025,');
});

test('an RIS file holds both records, each closed by its own ER line', async () => {
  const ris = await formatCitations(citedReferences(WORKS), 'ris');

  expect(ris.match(/^TY {2}- JOUR$/gm)).toHaveLength(2);
  expect(ris).toContain('ER  - \nTY  - JOUR');
});

test('the DOI links are listed one per line', async () => {
  await expect(formatCitations(citedReferences(WORKS), 'doi')).resolves.toBe(
    'https://doi.org/10.1039/C5GC01022E\nhttps://doi.org/10.2533/chimia.2025.66',
  );
});

test('a lone reference is written exactly as it is on its own', async () => {
  await expect(formatCitations([PAPER], 'bibtex')).resolves.toBe(
    await formatCitation(PAPER, 'bibtex'),
  );
});

test('no reference at all writes nothing', async () => {
  await expect(formatCitations([], 'text')).resolves.toBe('');
});

test('a file holding one reference is named after its author and year', () => {
  expect(citationsFilename([PAPER], 'ris')).toBe('Vanderveen2015.ris');
});

test('a file holding several references is named after none of them', () => {
  expect(citationsFilename(citedReferences(WORKS), 'bib')).toBe(
    'references.bib',
  );
});
