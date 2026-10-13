import { expect, test } from 'vitest';

import { selectInputs } from '../connectHost.ts';

import { TOOL } from './fakeHost.ts';

test('each input takes the first valid item in its own order of preference', () => {
  expect(
    selectInputs(TOOL, [
      { kind: 'chem.ocl.id', value: { idCode: 42 } },
      { kind: 'chem.smiles', value: { smiles: 'CCO' } },
    ]),
  ).toStrictEqual({
    ok: true,
    inputs: [
      {
        key: 'structure',
        item: { kind: 'chem.smiles', value: { smiles: 'CCO' } },
        checked: { kind: 'chem.smiles', value: { smiles: 'CCO' } },
      },
    ],
  });
});

test('no usable item is no-input; only items of the wrong shape is invalid', () => {
  expect(
    selectInputs(TOOL, [
      { kind: 'chem.mf', value: { mf: 'C8H10' } },
      { kind: 'chem.smiles', value: { smiles: 'CCO' }, key: 'reagent' },
      { kind: 'chem.molfile.3d.h.energy[]', value: [] },
    ]),
  ).toStrictEqual({
    ok: false,
    error: {
      code: 'no-input',
      message:
        'No item is a chem.molfile, chem.ocl.id, or chem.smiles, so 3d loaded nothing.',
    },
  });
  expect(
    selectInputs(TOOL, [
      { kind: 'chem.molfile.2d', value: { molfile: 3 } },
      { kind: 'chem.ocl.id', value: { idCode: 42 } },
    ]),
  ).toStrictEqual({
    ok: false,
    error: {
      code: 'invalid',
      message:
        'No item for structure has the shape its kind requires, so 3d loaded nothing.',
      errors: [
        'chem.molfile.2d /molfile: must be string',
        "chem.ocl.id /: must have required property 'coordinates'",
      ],
    },
  });
});
