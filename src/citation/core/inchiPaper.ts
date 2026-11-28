import type { Reference } from './reference.ts';
import type { CitedWork } from './works.ts';

/** The paper the InChI Trust asks to be cited for the identifier. */
export const INCHI_PAPER: Reference = {
  authors: [
    { given: 'S. R.', family: 'Heller' },
    { given: 'A.', family: 'McNaught' },
    { given: 'I.', family: 'Pletnev' },
    { given: 'S.', family: 'Stein' },
    { given: 'D.', family: 'Tchekhovskoi' },
  ],
  title: 'InChI, the IUPAC International Chemical Identifier',
  journal: 'Journal of Cheminformatics',
  journalAbbreviation: 'J. Cheminform.',
  year: 2015,
  volume: '7',
  issue: '1',
  firstPage: '23',
  lastPage: '23',
  doi: '10.1186/s13321-015-0068-4',
  publisher: 'Springer Nature',
};

/** InChI, for a site that hands out InChIs or InChIKeys. */
export const INCHI_WORK: CitedWork = {
  reference: INCHI_PAPER,
  what: 'The InChI identifier',
  note: 'Cite it whenever an InChI from this page reaches a publication.',
};
