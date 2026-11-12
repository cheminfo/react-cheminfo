import type { Reference } from './reference.ts';
import type { CitedWork } from './works.ts';

/**
 * The paper describing NMRium: processing and assigning NMR spectra in the
 * browser, and teaching their interpretation with it.
 */
export const NMRIUM_PAPER: Reference = {
  authors: [
    { given: 'L.', family: 'Patiny' },
    { given: 'H.', family: 'Musallam' },
    { given: 'A.', family: 'Bolaños' },
    { given: 'M.', family: 'Zasso' },
    { given: 'J.', family: 'Wist' },
    { given: 'M.', family: 'Karayilan' },
    { given: 'E.', family: 'Ziegler' },
    { given: 'J. C.', family: 'Liermann' },
    { given: 'N. E.', family: 'Schlörer' },
  ],
  title:
    'NMRium: Teaching nuclear magnetic resonance spectra interpretation in an online platform',
  journal: 'Beilstein Journal of Organic Chemistry',
  journalAbbreviation: 'Beilstein J. Org. Chem.',
  year: 2024,
  volume: '20',
  firstPage: '25',
  lastPage: '31',
  doi: '10.3762/bjoc.20.4',
  publisher: 'Beilstein Institut',
};

/** NMRium, for a site whose spectra are processed with it. */
export const NMRIUM_WORK: CitedWork = {
  reference: NMRIUM_PAPER,
  what: 'NMRium',
  note: 'Cite it for the processing of every spectrum.',
};
