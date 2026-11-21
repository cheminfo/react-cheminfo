import { expect, test } from 'vitest';

import { PAPER } from '../../../citation/core/__tests__/paper.ts';
import { PLATFORM_PAPER } from '../../../citation/core/platformPaper.ts';
import { formatCslEntries } from '../formatCsl.ts';
import { referenceToCsl } from '../referenceItem.ts';

test('an article is the CSL JSON of a journal article, keyed by its DOI', () => {
  expect(referenceToCsl(PAPER)).toStrictEqual({
    id: 'doi:10.1039/c5gc01022e',
    type: 'article-journal',
    title:
      'A virtual screening approach to identifying the greenest compound for a task: application to switchable-hydrophilicity solvents',
    'container-title': 'Green Chemistry',
    'container-title-short': 'Green Chem.',
    author: [
      { family: 'Vanderveen', given: 'J. R.' },
      { family: 'Patiny', given: 'L.' },
      { family: 'Chalifoux', given: 'C. B.' },
      { family: 'Jessop', given: 'M. J.' },
      { family: 'Jessop', given: 'P. G.' },
    ],
    issued: { 'date-parts': [[2015]] },
    volume: '17',
    issue: '12',
    page: '5182-5188',
    publisher: 'Royal Society of Chemistry',
    DOI: '10.1039/C5GC01022E',
  });
});

test('a dataset is published by its repository, and an organisation is one name', () => {
  expect(
    referenceToCsl({
      kind: 'dataset',
      authors: [{ given: '', family: 'SciPeaks consortium' }],
      title: 'Spectra',
      repository: 'Zenodo',
      year: 2026,
      version: '2',
      doi: '10.5281/zenodo.1',
    }),
  ).toStrictEqual({
    id: 'doi:10.5281/zenodo.1',
    type: 'dataset',
    title: 'Spectra',
    publisher: 'Zenodo',
    author: [{ literal: 'SciPeaks consortium' }],
    issued: { 'date-parts': [[2026]] },
    version: '2',
    DOI: '10.5281/zenodo.1',
  });
});

test('the family’s own paper is formatted like any work from Zotero', async () => {
  await expect(
    formatCslEntries([referenceToCsl(PLATFORM_PAPER)], 'nature', 'text'),
  ).resolves.toStrictEqual([
    'Patiny, L. Unlocking the Potential of Browser-Based Scientific Data Analysis: A 20-Year Journey of Expertise. Chimia 79, 66–69 (2025).',
  ]);
});
