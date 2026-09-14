import { PLATFORM_PAPER } from '../src/citation/core/platformPaper.ts';
import type { Reference } from '../src/citation/core/reference.ts';
import type { CitedWork } from '../src/citation/core/works.ts';

/** A real article, so every citation style has something honest to render. */
export const PAPER: Reference = {
  authors: [
    { given: 'L.', family: 'Patiny' },
    { given: 'A.', family: 'Borel' },
  ],
  title: 'ChemCalc: A Building Block for Tomorrow’s Chemical Infrastructure',
  journal: 'Journal of Chemical Information and Modeling',
  journalAbbreviation: 'J. Chem. Inf. Model.',
  year: 2013,
  volume: '53',
  issue: '5',
  firstPage: '1223',
  lastPage: '1228',
  doi: '10.1021/ci300563h',
  publisher: 'American Chemical Society',
};

/** The two works such a site asks for, each with what citing it credits. */
export const PAPERS: readonly CitedWork[] = [
  {
    reference: PAPER,
    what: 'The calculator',
    note: 'Cite it for the masses and the isotopic distributions the site computes.',
  },
  {
    reference: PLATFORM_PAPER,
    what: 'The browser platform',
    note: 'Cite it for the site itself: twenty years of processing data in the browser.',
  },
];
