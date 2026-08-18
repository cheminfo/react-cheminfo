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

test('two written citations take one line each', () => {
  expect(formatCitations(citedReferences(WORKS), 'text')).toBe(
    `${formatCitation(PAPER, 'text')}\n${formatCitation(PLATFORM_PAPER, 'text')}`,
  );
});

test('the style asked for is used for every reference', () => {
  const rsc = formatCitations(citedReferences(WORKS), 'text', 'rsc');

  expect(rsc).toContain(
    'J. R. Vanderveen, L. Patiny, C. B. Chalifoux, M. J. Jessop and P. G. Jessop, Green Chem., 2015, 17, 5182–5188.',
  );
  expect(rsc).toContain('L. Patiny, Chimia, 2025, 79, 66–69.');
});

test('two HTML citations are broken into two lines', () => {
  expect(formatCitations(citedReferences(WORKS), 'html', 'acs')).toContain(
    '<a href="https://doi.org/10.1039/C5GC01022E">doi:10.1039/C5GC01022E</a><br>Patiny, L.',
  );
});

test('two markdown citations are two paragraphs', () => {
  expect(formatCitations(citedReferences(WORKS), 'markdown')).toContain(
    '\n\nPatiny, L. Unlocking',
  );
});

test('a BibTeX file holds both entries, keyed on their own first author', () => {
  const bibtex = formatCitations(citedReferences(WORKS), 'bibtex');

  expect(bibtex).toContain('@article{Vanderveen2015,');
  expect(bibtex).toContain('}\n\n@article{Patiny2025,');
});

test('an RIS file holds both records, each closed by its own ER line', () => {
  const ris = formatCitations(citedReferences(WORKS), 'ris');

  expect(ris.match(/^TY {2}- JOUR$/gm)).toHaveLength(2);
  expect(ris).toContain('ER  - \nTY  - JOUR');
});

test('the DOI links are listed one per line', () => {
  expect(formatCitations(citedReferences(WORKS), 'doi')).toBe(
    'https://doi.org/10.1039/C5GC01022E\nhttps://doi.org/10.2533/chimia.2025.66',
  );
});

test('a lone reference is written exactly as it is on its own', () => {
  expect(formatCitations([PAPER], 'bibtex')).toBe(
    formatCitation(PAPER, 'bibtex'),
  );
});

test('no reference at all writes nothing', () => {
  expect(formatCitations([], 'text')).toBe('');
});

test('a file holding one reference is named after its author and year', () => {
  expect(citationsFilename([PAPER], 'ris')).toBe('Vanderveen2015.ris');
});

test('a file holding several references is named after none of them', () => {
  expect(citationsFilename(citedReferences(WORKS), 'bib')).toBe(
    'references.bib',
  );
});
