import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { fragmentIdCode } from '../fragmentIdCode.ts';
import {
  SIMILARITY_THRESHOLDS,
  similarityThresholds,
} from '../structureSearch.ts';

test('a usual threshold is offered among the usual steps', () => {
  expect(similarityThresholds(0.7)).toStrictEqual([...SIMILARITY_THRESHOLDS]);
});

test('a threshold off the steps is offered in its place', () => {
  expect(similarityThresholds(0.42)).toStrictEqual([
    0.42, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95,
  ]);
  expect(similarityThresholds(Number.NaN)).toStrictEqual([
    ...SIMILARITY_THRESHOLDS,
  ]);
});

test('a SMILES becomes the idCode of a query fragment', () => {
  const idCode = fragmentIdCode('c1ccccc1');

  expect(idCode).toBe('gFp@DiTt@@B');
  expect(Molecule.fromIDCode(idCode).isFragment()).toBe(true);
});

test('a SMILES that cannot be read gives nothing', () => {
  expect(fragmentIdCode('C1CC(')).toBe('');
});
