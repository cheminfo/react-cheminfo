import type { Reference } from './reference.ts';
import type { CitedWork } from './works.ts';

/**
 * The paper OpenChemLib's authors ask to be cited for the toolkit: it was
 * published as the chemistry core of DataWarrior.
 */
export const OPENCHEMLIB_PAPER: Reference = {
  authors: [
    { given: 'T.', family: 'Sander' },
    { given: 'J.', family: 'Freyss' },
    { given: 'M.', family: 'von Korff' },
    { given: 'C.', family: 'Rufener' },
  ],
  title:
    'DataWarrior: an open-source program for chemistry aware data visualization and analysis',
  journal: 'Journal of Chemical Information and Modeling',
  journalAbbreviation: 'J. Chem. Inf. Model.',
  year: 2015,
  volume: '55',
  issue: '2',
  firstPage: '460',
  lastPage: '473',
  doi: '10.1021/ci500588j',
  publisher: 'American Chemical Society',
};

/** OpenChemLib, for a site whose chemistry it computes. */
export const OPENCHEMLIB_WORK: CitedWork = {
  reference: OPENCHEMLIB_PAPER,
  what: 'OpenChemLib',
  note: 'Cite it for the cheminformatics toolkit every structure here goes through.',
};
