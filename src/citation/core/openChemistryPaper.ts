import type { Reference } from './reference.ts';
import type { CitedWork } from './works.ts';

/**
 * The case for publishing chemistry's data open and machine actionable, from
 * the electronic lab notebook to the repository: the sites of the family that
 * read research data where it was deposited come out of it. One record holds
 * it, so no site can name a different version of it.
 */
export const OPEN_CHEMISTRY_PAPER: Reference = {
  authors: [
    { given: 'K. M.', family: 'Jablonka' },
    { given: 'L.', family: 'Patiny' },
    { given: 'B.', family: 'Smit' },
  ],
  title:
    'Making the collective knowledge of chemistry open and machine actionable',
  journal: 'Nature Chemistry',
  journalAbbreviation: 'Nat. Chem.',
  year: 2022,
  volume: '14',
  issue: '4',
  firstPage: '365',
  lastPage: '376',
  doi: '10.1038/s41557-022-00910-7',
  publisher: 'Springer Science and Business Media LLC',
};

/**
 * The open-chemistry paper as one of the works a site reading deposited data
 * asks to be cited, after the dataset it shows.
 */
export const OPEN_CHEMISTRY_WORK: CitedWork = {
  reference: OPEN_CHEMISTRY_PAPER,
  what: 'Open, machine-actionable chemistry',
  note: 'Cite it for publishing data the way this site reads it.',
};
