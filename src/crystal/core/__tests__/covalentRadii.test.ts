import { expect, test } from 'vitest';

import {
  BOND_TOLERANCE,
  covalentBondLimit,
  covalentRadius,
} from '../covalentRadii.ts';

test('the radii openchemlib bonds atoms with', () => {
  expect(covalentRadius('H')).toBe(0.32);
  expect(covalentRadius('C')).toBe(0.75);
  expect(covalentRadius('N')).toBe(0.71);
  expect(covalentRadius('O')).toBe(0.63);
  expect(covalentRadius('Fe')).toBe(1.16);
  expect(covalentRadius('Og')).toBe(1.57);
  expect(covalentRadius('Xx')).toBeUndefined();
});

test('two radii and the tolerance, never two hydrogens', () => {
  expect(BOND_TOLERANCE).toBe(0.45);
  expect(covalentBondLimit('C', 'C')).toBeCloseTo(1.95, 12);
  expect(covalentBondLimit('C', 'H')).toBeCloseTo(1.52, 12);
  expect(covalentBondLimit('Fe', 'C')).toBeCloseTo(2.36, 12);
  expect(covalentBondLimit('Na', 'Cl')).toBeCloseTo(3.04, 12);
  expect(covalentBondLimit('H', 'H')).toBe(0);
  expect(covalentBondLimit('C', 'Xx')).toBe(0);
});
