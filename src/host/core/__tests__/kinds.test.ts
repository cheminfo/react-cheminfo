import { expect, test } from 'vitest';

import { checkValue, isKnownKind, kindAccepts, readOutput } from '../kinds.ts';

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
  expect(isKnownKind('chem.rxn')).toBe(true);
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

test('a reaction travels as its RXN file, under its own name', () => {
  expect(
    checkValue('chem.rxn', { rxn: '$RXN\n', reactionRXN: 'stale' }),
  ).toStrictEqual({
    valid: true,
    checked: { kind: 'chem.rxn', value: { rxn: '$RXN\n' } },
  });
  expect(checkValue('chem.rxn', { molfile: 'M  END' })).toStrictEqual({
    valid: false,
    errors: ["/: must have required property 'rxn'"],
  });
});

test('a picture, a name and a table are kinds a host reads back', () => {
  expect(checkValue('image.svg', { svg: '<svg/>', width: 3 })).toStrictEqual({
    valid: true,
    checked: { kind: 'image.svg', value: { svg: '<svg/>' } },
  });
  expect(checkValue('chem.name', { name: 'ethanol' })).toStrictEqual({
    valid: true,
    checked: { kind: 'chem.name', value: { name: 'ethanol' } },
  });
  expect(
    checkValue('data.table', {
      columns: ['Property', 'Value'],
      rows: [
        ['cLogP', 1.42],
        ['Mutagenic', null],
      ],
    }),
  ).toStrictEqual({
    valid: true,
    checked: {
      kind: 'data.table',
      value: {
        columns: ['Property', 'Value'],
        rows: [
          ['cLogP', 1.42],
          ['Mutagenic', null],
        ],
      },
    },
  });
  expect(
    checkValue('data.table', { columns: ['Value'], rows: [[{ x: 1 }]] }),
  ).toStrictEqual({
    valid: false,
    errors: ['/rows/0/0: must be string,number,null'],
  });
});

test('an output is read as the kind asked for, a kind under it included', () => {
  const items = [
    { key: 'name', kind: 'chem.name.iupac', value: { name: 'ethanol' } },
    { key: 'figure', kind: 'image.png', value: { png: 'AAAA' } },
    { key: 'table', kind: 'data.table', value: { columns: ['A'] } },
  ];

  expect(readOutput(items, 'name', 'chem.name')).toStrictEqual({
    kind: 'chem.name',
    value: { name: 'ethanol' },
  });
  expect(readOutput(items, 'structure', 'chem.molfile')).toBeUndefined();
  expect(() => readOutput(items, 'figure', 'image.svg')).toThrow(
    'The figure handed back is a image.png, not a image.svg.',
  );
  expect(() => readOutput(items, 'table', 'data.table')).toThrow(
    "The table handed back is not shaped as a data.table: /: must have required property 'rows'.",
  );
});
