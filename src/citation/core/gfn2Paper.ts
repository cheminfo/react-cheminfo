import type { Reference } from './reference.ts';
import type { CitedWork } from './works.ts';

/**
 * The paper that defines GFN2-xTB: the semi-empirical tight-binding method, its
 * multipole electrostatics and its D4 dispersion.
 */
export const GFN2_XTB_PAPER: Reference = {
  authors: [
    { given: 'C.', family: 'Bannwarth' },
    { given: 'S.', family: 'Ehlert' },
    { given: 'S.', family: 'Grimme' },
  ],
  title:
    'GFN2-xTB — an accurate and broadly parametrized self-consistent tight-binding quantum chemical method with multipole electrostatics and density-dependent dispersion contributions',
  journal: 'Journal of Chemical Theory and Computation',
  journalAbbreviation: 'J. Chem. Theory Comput.',
  year: 2019,
  volume: '15',
  issue: '3',
  firstPage: '1652',
  lastPage: '1671',
  doi: '10.1021/acs.jctc.8b01176',
  publisher: 'American Chemical Society',
};

/** GFN2-xTB, for a site that computes an energy or a geometry with it. */
export const GFN2_XTB_WORK: CitedWork = {
  reference: GFN2_XTB_PAPER,
  what: 'GFN2-xTB',
  note: 'Cite it for the method behind every refined geometry and energy.',
};
