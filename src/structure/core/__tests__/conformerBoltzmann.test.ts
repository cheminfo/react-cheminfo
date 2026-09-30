import { expect, test } from 'vitest';

import {
  GAS_CONSTANT,
  ROOM_TEMPERATURE,
  boltzmannConfidence,
  boltzmannShares,
} from '../conformerBoltzmann.ts';

test('equal energies split the population evenly', () => {
  expect(boltzmannShares([0, 0, 0])).toStrictEqual([1 / 3, 1 / 3, 1 / 3]);
});

test('a single conformer holds everything', () => {
  expect(boltzmannShares([0])).toStrictEqual([1]);
  expect(boltzmannShares([-12.5])).toStrictEqual([1]);
});

test('RT at room temperature is 0.596 kcal/mol', () => {
  expect(GAS_CONSTANT * ROOM_TEMPERATURE).toBeCloseTo(0.596, 3);
});

test('one kcal/mol up is populated about a fifth as much', () => {
  const shares = boltzmannShares([0, 1]);
  // A missing share makes every ratio below NaN, which fails the
  // assertions — the right outcome, so no guard is needed.
  const lower = shares[0] ?? Number.NaN;
  const upper = shares[1] ?? Number.NaN;

  expect(upper / lower).toBeCloseTo(
    Math.exp(-1 / (GAS_CONSTANT * ROOM_TEMPERATURE)),
    12,
  );
  expect(upper / lower).toBeCloseTo(0.187, 3);
  expect(lower + upper).toBeCloseTo(1, 12);
});

test('butane is about two thirds gauche, because there are two of them', () => {
  // anti at 0, the two mirror-image gauche forms 0.78 kcal/mol up — the numbers
  // the conformer search actually returns for CCCC.
  const shares = boltzmannShares([0, 0.782, 0.782]);
  const anti = shares[0] ?? 0;
  const gauche = (shares[1] ?? 0) + (shares[2] ?? 0);

  expect(anti).toBeCloseTo(0.65, 3);
  expect(gauche).toBeCloseTo(0.35, 3);
  // One gauche well alone is the minority; the pair of them is what counts.
  expect(shares[1]).toBeCloseTo(0.175, 3);
});

test('absolute energies give the same answer as relative ones', () => {
  expect(boltzmannShares([-5.076, -4.294, -4.294])).toStrictEqual(
    boltzmannShares([0, 0.782, 0.782]),
  );
});

test('a colder temperature crowds the population into the lowest', () => {
  const warm = boltzmannShares([0, 1], ROOM_TEMPERATURE);
  const cold = boltzmannShares([0, 1], 100);

  expect(cold[0] ?? 0).toBeGreaterThan(warm[0] ?? 0);
  expect(cold[0]).toBeCloseTo(0.994, 3);
});

test('a conformer without an energy takes no share and does not dilute the rest', () => {
  const shares = boltzmannShares([0, null, 0]);

  expect(shares).toStrictEqual([0.5, null, 0.5]);
});

test('with no energy at all there is nothing to divide', () => {
  expect(boltzmannShares([null, null])).toStrictEqual([null, null]);
  expect(boltzmannShares([])).toStrictEqual([]);
});

test('a non-finite energy is treated as no energy', () => {
  expect(
    boltzmannShares([0, Number.NaN, Number.POSITIVE_INFINITY]),
  ).toStrictEqual([1, null, null]);
});

test('a temperature of zero cannot be divided by', () => {
  expect(boltzmannShares([0, 1], 0)).toStrictEqual([null, null]);
  expect(boltzmannShares([0, 1], -300)).toStrictEqual([null, null]);
});

test('a hopeless energy gap rounds to nothing without breaking the sum', () => {
  const shares = boltzmannShares([0, 500]);

  expect(shares[0]).toBeCloseTo(1, 12);
  expect(shares[1]).toBe(0);
});

test('an energy known to 1.5 kcal/mol places a population within a factor of twelve', () => {
  expect(boltzmannConfidence(1.5)).toBeCloseTo(12.4, 1);
});

test('a perfect energy leaves the population exact', () => {
  expect(boltzmannConfidence(0)).toBe(1);
  expect(boltzmannConfidence(-1)).toBe(1);
  expect(boltzmannConfidence(Number.NaN)).toBe(1);
});

test('a colder population is more sensitive to the same energy error', () => {
  expect(boltzmannConfidence(1, 100)).toBeGreaterThan(boltzmannConfidence(1));
});
