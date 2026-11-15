import { expect, test } from 'vitest';

import { checkValue, isKnownKind, kindAccepts } from '../kinds.ts';

test('data.spectra is a kind, and data takes it', () => {
  expect(isKnownKind('data.spectra')).toBe(true);
  expect(kindAccepts('data', 'data.spectra')).toBe(true);
  expect(kindAccepts('data.table', 'data.spectra')).toBe(false);
});

test('typed arrays pass as they are, with every field the sender added', () => {
  const x = Float64Array.from([400, 401, 402]);
  const y = Float64Array.from([0.1, 0.4, 0.2]);
  const value = {
    format: 'ml.cheminfo.org/dataset',
    version: 1,
    title: 'IR',
    axes: { x: { label: 'Wavenumber', units: 'cm⁻¹', reversed: true } },
    spectra: [{ id: 's1', label: 'Ethanol', data: { x, y }, meta: { a: 1 } }],
  };

  const outcome = checkValue('data.spectra', value);

  expect(outcome.valid).toBe(true);
  expect(value.spectra[0]?.data.x).toBe(x);
  expect(value).toStrictEqual({
    format: 'ml.cheminfo.org/dataset',
    version: 1,
    title: 'IR',
    axes: { x: { label: 'Wavenumber', units: 'cm⁻¹', reversed: true } },
    spectra: [{ id: 's1', label: 'Ethanol', data: { x, y }, meta: { a: 1 } }],
  });
});

test('plain lists of numbers pass', () => {
  const outcome = checkValue('data.spectra', {
    spectra: [{ data: { x: [1, 2], y: [3, 4] } }],
  });

  expect(outcome.valid).toBe(true);
});

test('a set without spectra, or with points that are not numbers, is refused', () => {
  expect(checkValue('data.spectra', { spectra: [] })).toStrictEqual({
    valid: false,
    errors: ['/spectra: must NOT have fewer than 1 items'],
  });
  expect(
    checkValue('data.spectra', {
      spectra: [{ data: { x: ['1', '2'], y: Float32Array.from([3, 4]) } }],
    }),
  ).toStrictEqual({
    valid: false,
    errors: ['/spectra/0/data/x: must pass "numberArray" keyword validation'],
  });
});
