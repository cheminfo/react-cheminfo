import { expect, test } from 'vitest';

import {
  MMFF94S_PAPER,
  MMFF94S_WORK,
  MMFF94_PAPER,
  MMFF94_WORK,
} from '../mmff94Paper.ts';
import { MOLSTAR_PAPER, MOLSTAR_WORK } from '../molstarPaper.ts';

test('Mol* is cited by the paper its DOI names', () => {
  expect(MOLSTAR_WORK.reference).toBe(MOLSTAR_PAPER);
  expect(MOLSTAR_WORK.what).toBe('Mol*');
  expect(MOLSTAR_PAPER).toMatchObject({
    title:
      'Mol* Viewer: modern web app for 3D visualization and analysis of large biomolecular structures',
    journalAbbreviation: 'Nucleic Acids Res.',
    year: 2021,
    volume: '49',
    issue: 'W1',
    firstPage: 'W431',
    lastPage: 'W437',
    doi: '10.1093/nar/gkab314',
  });
  expect(MOLSTAR_PAPER.authors).toHaveLength(10);
  expect(MOLSTAR_PAPER.authors[0]).toStrictEqual({
    given: 'D.',
    family: 'Sehnal',
  });
});

test('MMFF94 and MMFF94s are Halgren’s two papers', () => {
  expect(MMFF94_WORK.reference).toBe(MMFF94_PAPER);
  expect(MMFF94S_WORK.reference).toBe(MMFF94S_PAPER);
  expect([MMFF94_WORK.what, MMFF94S_WORK.what]).toStrictEqual([
    'MMFF94',
    'MMFF94s',
  ]);
  expect(MMFF94_PAPER).toMatchObject({ year: 1996, volume: '17' });
  expect(MMFF94S_PAPER).toMatchObject({ year: 1999, volume: '20' });
  expect(MMFF94S_PAPER.doi).toBe(
    '10.1002/(SICI)1096-987X(199905)20:7<720::AID-JCC7>3.0.CO;2-X',
  );
});
