import { expect, test } from 'vitest';

import { INCHI_PAPER, INCHI_WORK } from '../inchiPaper.ts';

test('the InChI work cites the paper the InChI Trust asks for', () => {
  expect(INCHI_WORK).toStrictEqual({
    reference: {
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
    },
    what: 'The InChI identifier',
    note: 'Cite it whenever an InChI from this page reaches a publication.',
  });
  expect(INCHI_WORK.reference).toBe(INCHI_PAPER);
});
