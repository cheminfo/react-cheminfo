import { expect, test } from 'vitest';

import { formatCitation } from '../formats.ts';
import type { DatasetReference } from '../reference.ts';
import { referenceVenue } from '../reference.ts';
import { formatCitations } from '../works.ts';

import { PAPER } from './paper.ts';

/**
 * A dataset as Zenodo records it: no journal, no volume, no pages, and the
 * repository in their place.
 */
const DATASET: DatasetReference = {
  kind: 'dataset',
  authors: [
    { given: 'J.', family: 'Waser' },
    { given: 'W.', family: 'Wu' },
    { given: 'T. M.', family: 'Milzarek' },
  ],
  title: 'Raw data for the article "Accessing CF3-Cyclopropenes"',
  repository: 'Zenodo',
  year: 2026,
  doi: '10.5281/zenodo.18380123',
};

const DOI = 'https://doi.org/10.5281/zenodo.18380123';

test('a dataset names its repository where an article names its journal', () => {
  expect(formatCitation(DATASET, 'text', 'acs')).toBe(
    `Waser, J.; Wu, W.; Milzarek, T. M. Raw data for the article "Accessing CF3-Cyclopropenes"; Zenodo, 2026. ${DOI}`,
  );
  expect(formatCitation(DATASET, 'text', 'nature')).toBe(
    `Waser, J., Wu, W. & Milzarek, T. M. Raw data for the article "Accessing CF3-Cyclopropenes". Zenodo (2026). ${DOI}`,
  );
  expect(formatCitation(DATASET, 'text', 'rsc')).toBe(
    `J. Waser, W. Wu and T. M. Milzarek, Raw data for the article "Accessing CF3-Cyclopropenes", Zenodo, 2026. ${DOI}`,
  );
  expect(formatCitation(DATASET, 'text', 'wiley')).toBe(
    `J. Waser, W. Wu, T. M. Milzarek, Raw data for the article "Accessing CF3-Cyclopropenes", Zenodo, 2026. ${DOI}`,
  );
});

test('the repository of a dataset is set in italics', () => {
  expect(formatCitation(DATASET, 'html')).toContain(
    `; <em>Zenodo</em>, 2026. <a href="${DOI}">doi:10.5281/zenodo.18380123</a>`,
  );
  expect(formatCitation(DATASET, 'markdown')).toContain('; *Zenodo*, 2026.');
});

test('a version is written after the title', () => {
  expect(formatCitation({ ...DATASET, version: '2' }, 'text')).toContain(
    '"Accessing CF3-Cyclopropenes", version 2; Zenodo, 2026.',
  );
});

test('a dataset is a BibTeX misc entry published by its repository', () => {
  expect(formatCitation({ ...DATASET, version: '2' }, 'bibtex')).toBe(
    `@misc{Waser2026,
  author = {Waser, J. and Wu, W. and Milzarek, T. M.},
  title = {Raw data for the article "Accessing CF3-Cyclopropenes"},
  howpublished = {Zenodo},
  year = {2026},
  version = {2},
  publisher = {Zenodo},
  doi = {10.5281/zenodo.18380123},
  url = {${DOI}},
}`,
  );
});

test('a dataset is an RIS DATA record, its version as the edition', () => {
  expect(formatCitation({ ...DATASET, version: '2' }, 'ris')).toBe(
    [
      'TY  - DATA',
      'AU  - Waser, J.',
      'AU  - Wu, W.',
      'AU  - Milzarek, T. M.',
      'TI  - Raw data for the article "Accessing CF3-Cyclopropenes"',
      'PY  - 2026',
      'ET  - 2',
      'PB  - Zenodo',
      'DO  - 10.5281/zenodo.18380123',
      `UR  - ${DOI}`,
      'ER  - ',
    ].join('\n'),
  );
});

test('an organisation is written by its name alone', () => {
  const byConsortium: DatasetReference = {
    ...DATASET,
    authors: [{ given: '', family: 'SciPeaks consortium' }],
  };

  expect(formatCitation(byConsortium, 'text', 'acs')).toBe(
    `SciPeaks consortium. Raw data for the article "Accessing CF3-Cyclopropenes"; Zenodo, 2026. ${DOI}`,
  );
  expect(formatCitation(byConsortium, 'ris')).toContain(
    'AU  - SciPeaks consortium\n',
  );
});

test('a dataset and an article are written together', () => {
  const ris = formatCitations([DATASET, PAPER], 'ris');

  expect(ris.match(/^TY {2}- \w+$/gm)).toStrictEqual([
    'TY  - DATA',
    'TY  - JOUR',
  ]);
});

test('the venue of a work is its journal or its repository', () => {
  expect(referenceVenue(PAPER)).toBe('Green Chem.');
  expect(referenceVenue(DATASET)).toBe('Zenodo');
});
