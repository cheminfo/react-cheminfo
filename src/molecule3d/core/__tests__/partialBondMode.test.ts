import { expect, test } from 'vitest';

import { isPartialBondMode, showsPartialBonds } from '../partialBondMode.ts';

test('auto draws the partial bonds of an XYZ file only', () => {
  expect(showsPartialBonds('auto', 'xyz')).toBe(true);
  expect(showsPartialBonds('auto', 'mol')).toBe(false);
  expect(showsPartialBonds('auto', 'sdf')).toBe(false);
});

test('on and off hold whatever the file', () => {
  expect(showsPartialBonds('on', 'mol')).toBe(true);
  expect(showsPartialBonds('off', 'xyz')).toBe(false);
});

test('only the three modes are modes', () => {
  expect(isPartialBondMode('auto')).toBe(true);
  expect(isPartialBondMode('off')).toBe(true);
  expect(isPartialBondMode('dashed')).toBe(false);
  expect(isPartialBondMode(true)).toBe(false);
});
