import type { Reference } from './reference.ts';
import type { CitedWork } from './works.ts';

/** The paper that defines the MMFF94 force field, its form and its parameters. */
export const MMFF94_PAPER: Reference = {
  authors: [{ given: 'T. A.', family: 'Halgren' }],
  title:
    'Merck molecular force field. I. Basis, form, scope, parameterization, and performance of MMFF94',
  journal: 'Journal of Computational Chemistry',
  journalAbbreviation: 'J. Comput. Chem.',
  year: 1996,
  volume: '17',
  issue: '5-6',
  firstPage: '490',
  lastPage: '519',
  doi: '10.1002/(SICI)1096-987X(199604)17:5/6<490::AID-JCC1>3.0.CO;2-P',
  publisher: 'Wiley',
};

/** MMFF94, for a site whose energies come from the force field. */
export const MMFF94_WORK: CitedWork = {
  reference: MMFF94_PAPER,
  what: 'MMFF94',
  note: 'Cite it for the force field every energy on the page is computed with.',
};

/** The paper of MMFF94s, the static variant made for energy minimisation. */
export const MMFF94S_PAPER: Reference = {
  authors: [{ given: 'T. A.', family: 'Halgren' }],
  title: 'MMFF VI. MMFF94s option for energy minimization studies',
  journal: 'Journal of Computational Chemistry',
  journalAbbreviation: 'J. Comput. Chem.',
  year: 1999,
  volume: '20',
  issue: '7',
  firstPage: '720',
  lastPage: '729',
  doi: '10.1002/(SICI)1096-987X(199905)20:7<720::AID-JCC7>3.0.CO;2-X',
  publisher: 'Wiley',
};

/** MMFF94s, for a site that minimises with the static variant. */
export const MMFF94S_WORK: CitedWork = {
  reference: MMFF94S_PAPER,
  what: 'MMFF94s',
  note: 'Cite it when you minimised with the static variant, or with MMFF94s+.',
};
