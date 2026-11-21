import { expect, test } from 'vitest';

import { formatCitation } from '../formats.ts';
import type { DatasetReference } from '../reference.ts';
import { referenceVenue } from '../reference.ts';
import { CITATION_STYLES } from '../styles.ts';
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

test('a dataset is written as each style writes one, its repository as publisher', async () => {
  const texts = await Promise.all(
    CITATION_STYLES.map((style) => formatCitation(DATASET, 'text', style.id)),
  );
  const written = Object.fromEntries(
    CITATION_STYLES.map((style, index) => [style.label, texts[index]]),
  );

  expect(written).toStrictEqual({
    ACS: `Waser, J.; Wu, W.; Milzarek, T. M. Raw Data for the Article “Accessing CF3-Cyclopropenes,” 2026. ${DOI}`,
    Nature: `Waser, J., Wu, W. & Milzarek, T. M. Raw data for the article “Accessing CF3-Cyclopropenes.” Zenodo ${DOI} (2026).`,
    RSC: 'J. Waser, W. Wu and T. M. Milzarek, 2026.',
    Angewandte: `J. Waser, W. Wu, T. M. Milzarek (2026), ${DOI}.`,
  });
  await expect(formatCitation(DATASET, 'html')).resolves.toBe(
    `Waser, J.; Wu, W.; Milzarek, T. M. Raw Data for the Article “Accessing CF3-Cyclopropenes,” 2026. ${DOI}`,
  );
});

test('a dataset is a BibTeX misc entry published by its repository', async () => {
  await expect(
    formatCitation({ ...DATASET, version: '2' }, 'bibtex'),
  ).resolves.toBe(
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

test('a dataset is an RIS DATA record, its version as the edition', async () => {
  await expect(
    formatCitation({ ...DATASET, version: '2' }, 'ris'),
  ).resolves.toBe(
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

test('an organisation is written by its name alone', async () => {
  const byConsortium: DatasetReference = {
    ...DATASET,
    authors: [{ given: '', family: 'SciPeaks consortium' }],
  };

  await expect(formatCitation(byConsortium, 'text')).resolves.toBe(
    `SciPeaks consortium. Raw Data for the Article “Accessing CF3-Cyclopropenes,” 2026. ${DOI}`,
  );
  await expect(formatCitation(byConsortium, 'ris')).resolves.toContain(
    'AU  - SciPeaks consortium\n',
  );
});

test('a dataset and an article are written together', async () => {
  const ris = await formatCitations([DATASET, PAPER], 'ris');

  expect(ris.match(/^TY {2}- \w+$/gm)).toStrictEqual([
    'TY  - DATA',
    'TY  - JOUR',
  ]);
});

test('the venue of a work is its journal or its repository', () => {
  expect(referenceVenue(PAPER)).toBe('Green Chem.');
  expect(referenceVenue(DATASET)).toBe('Zenodo');
});
