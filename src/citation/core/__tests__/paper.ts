import type { Reference } from '../reference.ts';

/**
 * The work the formats are tested against: a real article, with the metadata
 * Crossref returns for it, so every field a style may reach for is filled.
 */
export const PAPER: Reference = {
  authors: [
    { given: 'J. R.', family: 'Vanderveen' },
    { given: 'L.', family: 'Patiny' },
    { given: 'C. B.', family: 'Chalifoux' },
    { given: 'M. J.', family: 'Jessop' },
    { given: 'P. G.', family: 'Jessop' },
  ],
  title:
    'A virtual screening approach to identifying the greenest compound for a task: application to switchable-hydrophilicity solvents',
  journal: 'Green Chemistry',
  journalAbbreviation: 'Green Chem.',
  year: 2015,
  volume: '17',
  issue: '12',
  firstPage: '5182',
  lastPage: '5188',
  doi: '10.1039/C5GC01022E',
  publisher: 'Royal Society of Chemistry',
};
