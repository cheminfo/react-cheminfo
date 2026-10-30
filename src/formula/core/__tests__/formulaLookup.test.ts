import { expect, test } from 'vitest';

import {
  DEFAULT_ELEMENT_RANGES,
  formatElementRanges,
} from '../elementRanges.ts';
import {
  FORMULA_LOOKUP_LIMIT,
  findFormulaCandidates,
} from '../formulaCandidates.ts';

const CARBON_AND_HYDROGEN = [
  { element: 'C', min: 0, max: 10 },
  { element: 'H', min: 0, max: 10 },
];

test('the default ranges open on carbon and hydrogen', () => {
  expect(formatElementRanges(DEFAULT_ELEMENT_RANGES)).toBe(
    'C1-30 H1-30 O0-6 N0-4 S0-4 F0-4 Cl0-4 Br0-4',
  );
});

test('an element switched off is left out', () => {
  expect(
    formatElementRanges([
      { element: 'C', min: 1, max: 30 },
      { element: 'Br', min: 0, max: 0 },
    ]),
  ).toBe('C1-30');
});

test('bounds typed outside each other are brought back inside', () => {
  expect(
    formatElementRanges([
      { element: 'C', min: 40, max: 30 },
      { element: 'N', min: -3, max: 2 },
      { element: 'S', min: 0, max: -1 },
    ]),
  ).toBe('C30-30 N0-2');
});

test('the mass of C10H14O, typed to four decimals, finds it first', async () => {
  const found = await findFormulaCandidates(150.1045);

  expect(found.total).toBe(60);
  expect(found.candidates).toHaveLength(60);
  expect(found.candidates[0]?.mf).toBe('C10H14O');
  expect(found.candidates[0]?.em).toBeCloseTo(150.10446507079, 10);
  expect(found.candidates[0]?.unsaturation).toBe(4);
  expect(found.candidates[0]?.ppm).toBeCloseTo(0.2327, 4);
  expect(found.candidates[1]?.mf).toBe('C7H15FO2');
  expect(found.candidates[1]?.ppm).toBeCloseTo(-7.3807, 4);
});

test('a hundred are listed, closest first, and the rest are counted', async () => {
  const found = await findFormulaCandidates(180.0634);

  expect(found.total).toBe(245);
  expect(found.candidates).toHaveLength(FORMULA_LOOKUP_LIMIT);
  expect(found.candidates[0]?.mf).toBe('C6H12O6');
  expect(found.candidates.at(-1)?.mf).toBe('C7H2F2N4');

  const distances = found.candidates.map((candidate) =>
    Math.abs(candidate.ppm),
  );

  expect(distances).toStrictEqual(distances.toSorted((a, b) => a - b));
});

test('the limit and the window are the caller’s', async () => {
  const closest = await findFormulaCandidates(300.1234, { limit: 3 });

  expect(closest.total).toBe(1347);
  expect(closest.candidates.map((candidate) => candidate.mf)).toStrictEqual([
    'C12H17FN4O4',
    'C10H19F3N4OS',
    'C12H23ClF2N2S',
  ]);

  const narrow = await findFormulaCandidates(150.1045, {
    ranges: [
      { element: 'C', min: 0, max: 12 },
      { element: 'H', min: 0, max: 20 },
      { element: 'O', min: 0, max: 2 },
    ],
    precision: 10,
  });

  expect(narrow.total).toBe(1);
  expect(narrow.candidates.map((candidate) => candidate.mf)).toStrictEqual([
    'C10H14O',
  ]);
});

test('a radical is never a candidate: its unsaturation is not whole', async () => {
  const benzene = await findFormulaCandidates(78.04695, {
    ranges: CARBON_AND_HYDROGEN,
    precision: 5,
  });

  expect(benzene.candidates.map((candidate) => candidate.mf)).toStrictEqual([
    'C6H6',
  ]);

  const phenyl = await findFormulaCandidates(77.0391, {
    ranges: CARBON_AND_HYDROGEN,
    precision: 5,
  });

  expect(phenyl).toStrictEqual({ candidates: [], total: 0 });
});

test('nothing is searched without a mass, an element or room for a result', async () => {
  const none = { candidates: [], total: 0 };

  await expect(findFormulaCandidates(0)).resolves.toStrictEqual(none);
  await expect(findFormulaCandidates(Number.NaN)).resolves.toStrictEqual(none);
  await expect(
    findFormulaCandidates(150.1045, {
      ranges: [{ element: 'C', min: 0, max: 0 }],
    }),
  ).resolves.toStrictEqual(none);
  await expect(
    findFormulaCandidates(150.1045, { limit: 0 }),
  ).resolves.toStrictEqual(none);
});
