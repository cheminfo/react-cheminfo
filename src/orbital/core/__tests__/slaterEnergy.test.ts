import { expect, test } from 'vitest';

import { configurationOf } from '../electronConfiguration.ts';
import { slaterRemovalEnergy, slaterTotalEnergy } from '../slaterEnergy.ts';

test('hydrogen is the exact one-electron atom', () => {
  expect(slaterTotalEnergy(1, configurationOf(1))).toBeCloseTo(-13.6057, 3);
  expect(
    slaterRemovalEnergy(1, configurationOf(1), { n: 1, l: 0 }),
  ).toBeCloseTo(13.6057, 3);
});

test('removing an electron leaves the others less screened', () => {
  // Each of helium's electrons is screened by 0.30, so both sit at
  // −13.6057 × 1.70², while the ion's remaining one sees the full Z = 2 and is
  // bound by four rydberg.
  expect(slaterTotalEnergy(2, configurationOf(2))).toBeCloseTo(-78.641, 3);
  expect(slaterTotalEnergy(2, [{ n: 1, l: 0, electrons: 1 }])).toBeCloseTo(
    -54.423,
    3,
  );
  expect(
    slaterRemovalEnergy(2, configurationOf(2), { n: 1, l: 0 }),
  ).toBeCloseTo(24.218, 3);
});

test.each([
  ['Li', 3, 2, 0, 5.39],
  ['C', 6, 2, 1, 11.26],
  ['F', 9, 2, 1, 17.42],
  ['Ne', 10, 2, 1, 21.56],
  ['Ar', 18, 3, 1, 15.76],
  ['K', 19, 4, 0, 4.34],
])(
  'the removal energy of %s is within a factor 1.4 of the measured one',
  (_symbol, atomicNumber, n, l, measured) => {
    const removal = slaterRemovalEnergy(
      atomicNumber,
      configurationOf(atomicNumber),
      { n, l },
    );

    expect(removal / measured).toBeGreaterThan(0.71);
    expect(removal / measured).toBeLessThan(1.4);
  },
);

test('fluorine: the removal energy is the number to compare, not the orbital energy', () => {
  const removal = slaterRemovalEnergy(9, configurationOf(9), { n: 2, l: 1 });

  expect(removal).toBeCloseTo(15.19, 2);
  // The hydrogen-like orbital energy of the same electron is −91.97 eV.
  expect(removal).toBeLessThan(20);
});

test('an empty subshell has no electron to remove', () => {
  expect(() =>
    slaterRemovalEnergy(9, configurationOf(9), { n: 3, l: 0 }),
  ).toThrow('3s subshell holds no electron');
});
