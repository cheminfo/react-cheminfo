import type { Reference } from './reference.ts';
import type { CitedWork } from './works.ts';

/**
 * The paper of the Mol* viewer, in Nucleic Acids Research 2021: the one its
 * DOI names, not the 2018 MolVA workshop paper that announced the library.
 */
export const MOLSTAR_PAPER: Reference = {
  authors: [
    { given: 'D.', family: 'Sehnal' },
    { given: 'S.', family: 'Bittrich' },
    { given: 'M.', family: 'Deshpande' },
    { given: 'R.', family: 'Svobodová' },
    { given: 'K.', family: 'Berka' },
    { given: 'V.', family: 'Bazgier' },
    { given: 'S.', family: 'Velankar' },
    { given: 'S. K.', family: 'Burley' },
    { given: 'J.', family: 'Koča' },
    { given: 'A. S.', family: 'Rose' },
  ],
  title:
    'Mol* Viewer: modern web app for 3D visualization and analysis of large biomolecular structures',
  journal: 'Nucleic Acids Research',
  journalAbbreviation: 'Nucleic Acids Res.',
  year: 2021,
  volume: '49',
  issue: 'W1',
  firstPage: 'W431',
  lastPage: 'W437',
  doi: '10.1093/nar/gkab314',
  publisher: 'Oxford University Press',
};

/** Mol*, for a site whose 3D view is drawn by it. */
export const MOLSTAR_WORK: CitedWork = {
  reference: MOLSTAR_PAPER,
  what: 'Mol*',
  note: 'Cite it when a figure of yours is a screenshot of the 3D viewer.',
};
