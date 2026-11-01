import { expect, test } from 'vitest';

import {
  GFN2_ENERGY_ERROR,
  MMFF94_ENERGY_ERROR,
  shareFactor,
} from '../conformerEnergyError.ts';

test('MMFF94 places a room-temperature share within a factor of 420', () => {
  expect(shareFactor(MMFF94_ENERGY_ERROR)).toBe(420);
});

test('GFN2-xTB places it within a factor of 12', () => {
  expect(shareFactor(GFN2_ENERGY_ERROR)).toBe(12);
});

test('a hotter sample makes the same error cost less', () => {
  expect(shareFactor(MMFF94_ENERGY_ERROR, 600)).toBe(20);
});

test('no error leaves a share exact', () => {
  expect(shareFactor(0)).toBe(1);
});
