import { expect, test } from 'vitest';

import { checkValue, isKnownKind, kindAccepts } from '../kinds.ts';

test('a category accepts every kind under it, on a segment boundary', () => {
  expect(kindAccepts('chem.molfile', 'chem.molfile')).toBe(true);
  expect(kindAccepts('chem.molfile', 'chem.molfile.2d')).toBe(true);
  expect(kindAccepts('chem.molfile', 'chem.molfile.3d.h.energy')).toBe(true);
  expect(kindAccepts('chem.molfile', 'chem.molfiles')).toBe(false);
  expect(kindAccepts('chem.molfile.2d', 'chem.molfile')).toBe(false);
  expect(kindAccepts('chem.ocl.id', 'chem.smiles')).toBe(false);
});

test('a list is never one value, nor one value a list', () => {
  expect(kindAccepts('chem.molfile', 'chem.molfile.3d.h.energy[]')).toBe(false);
  expect(kindAccepts('chem.molfile[]', 'chem.molfile.3d.h.energy[]')).toBe(
    true,
  );
  expect(kindAccepts('chem.molfile[]', 'chem.molfile.2d')).toBe(false);
});

test('only the kinds this site reads are known', () => {
  expect(isKnownKind('chem.molfile')).toBe(true);
  expect(isKnownKind('chem.ocl.id')).toBe(true);
  expect(isKnownKind('chem.smiles')).toBe(true);
  expect(isKnownKind('chem.mf')).toBe(false);
  expect(isKnownKind('chem.molfile.2d')).toBe(false);
  expect(isKnownKind('toString')).toBe(false);
});

test('a valid value comes back tagged, stripped of what its kind does not name', () => {
  const value = { molfile: 'M  END', energy: -1.5, meta: { from: 'xtb' } };

  expect(checkValue('chem.molfile', value)).toStrictEqual({
    valid: true,
    checked: { kind: 'chem.molfile', value: { molfile: 'M  END' } },
  });
});

test('an invalid value is refused with the errors pipeline writes', () => {
  expect(checkValue('chem.ocl.id', { idCode: 42 })).toStrictEqual({
    valid: false,
    errors: ["/: must have required property 'coordinates'"],
  });
  expect(
    checkValue('chem.ocl.id', { idCode: 42, coordinates: '' }),
  ).toStrictEqual({ valid: false, errors: ['/idCode: must be string'] });
  expect(checkValue('chem.smiles', 'CCO')).toStrictEqual({
    valid: false,
    errors: ['/: must be object'],
  });
});
