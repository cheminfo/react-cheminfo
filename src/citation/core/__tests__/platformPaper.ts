import type { Reference } from '../reference.ts';

/**
 * A second work, so a set of references has something honest to be tested
 * against: the article every site of the family cites for the platform it runs
 * on, with a single author and a page range of its own.
 */
export const PLATFORM_PAPER: Reference = {
  authors: [{ given: 'L.', family: 'Patiny' }],
  title:
    'Unlocking the Potential of Browser-Based Scientific Data Analysis: A 20-Year Journey of Expertise',
  journal: 'CHIMIA',
  journalAbbreviation: 'Chimia',
  year: 2025,
  volume: '79',
  issue: '1-2',
  firstPage: '66',
  lastPage: '69',
  doi: '10.2533/chimia.2025.66',
  publisher: 'Swiss Chemical Society',
};
