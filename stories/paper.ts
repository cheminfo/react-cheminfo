import type { Reference } from '../src/citation/core/reference.ts';

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
