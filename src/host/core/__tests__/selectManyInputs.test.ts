import { expect, test } from 'vitest';

import { sciPeaksEthylbenzeneIrLoad } from '../../testing/sciPeaks.ts';
import type { IrJdxValue } from '../irKinds.ts';
import type { ToolInterface } from '../protocol.ts';
import type { InputSelection } from '../selectInputs.ts';
import { selectInputs } from '../selectInputs.ts';

/** A site reading every infrared spectrum of a sample, and its structure. */
const SPECTRA_TOOL: ToolInterface = {
  name: 'vibrations',
  inputs: [
    { key: 'spectra', kinds: ['spectra.ir.jdx'], many: true, optional: true },
    {
      key: 'structure',
      kinds: ['chem.molfile', 'chem.ocl.id', 'chem.smiles'],
      optional: true,
    },
  ],
  outputs: [{ key: 'peaks', kind: 'spectra.ir.peaks' }],
};

test('an input taking many takes every item of its kind, in the host order', () => {
  const selection = selectInputs(SPECTRA_TOOL, [
    { kind: 'spectra.ir.jdx', id: 'b.jdx', value: { jdx: 'B' } },
    { kind: 'chem.smiles', value: { smiles: 'CCO' } },
    { kind: 'spectra.ir.jdx', id: 'a.jdx', value: { jdx: 'A' } },
  ]);

  expect(
    selection.ok
      ? selection.inputs.map(({ key, item }) => [key, item.id ?? item.kind])
      : selection,
  ).toStrictEqual([
    ['spectra', 'b.jdx'],
    ['spectra', 'a.jdx'],
    ['structure', 'chem.smiles'],
  ]);
});

test('an optional input left without an item is passed over', () => {
  const selection = selectInputs(SPECTRA_TOOL, [
    { kind: 'chem.molfile.2d', value: { molfile: 3 } },
    { kind: 'spectra.ir.jdx', id: 'a.jdx', value: { jdx: 'A' } },
  ]);

  expect(
    selection.ok ? selection.inputs.map(({ key }) => key) : selection,
  ).toStrictEqual(['spectra']);
});

test('a request that gives no input anything is refused, naming every kind', () => {
  expect(
    selectInputs(SPECTRA_TOOL, [{ kind: 'chem.mf', value: { mf: 'C8H10' } }]),
  ).toStrictEqual({
    ok: false,
    error: {
      code: 'no-input',
      message:
        'No item is a spectra.ir.jdx, chem.molfile, chem.ocl.id, or chem.smiles, so vibrations loaded nothing.',
    },
  });
  expect(
    selectInputs(SPECTRA_TOOL, [
      { kind: 'spectra.ir.jdx', value: { peaks: [] } },
    ]),
  ).toStrictEqual({
    ok: false,
    error: {
      code: 'invalid',
      message:
        'No item for spectra or structure has the shape its kind requires, so vibrations loaded nothing.',
      errors: ["spectra.ir.jdx /: must have required property 'jdx'"],
    },
  });
});

test("SciPeaks' sample gives its spectrum and its molfile, the bands read as stored", () => {
  const load = sciPeaksEthylbenzeneIrLoad('##TITLE=ETHYL BENZENE');

  const selection = selectInputs(SPECTRA_TOOL, load.items);

  expect(selection).toMatchObject({
    ok: true,
    inputs: [
      {
        key: 'spectra',
        item: {
          kind: 'spectra.ir.jdx',
          id: 'spectra/ir/spectra_ir_100-41-4-IR.jdx',
        },
      },
      { key: 'structure', item: { kind: 'chem.molfile.2d' } },
    ],
  });

  const { inputs } = selection as Extract<InputSelection, { ok: true }>;
  const { peaks } = inputs[0]?.checked.value as IrJdxValue;

  expect(peaks).toHaveLength(15);
  expect(peaks?.at(-1)).toStrictEqual({
    wavenumber: 1753.706831155787,
    absorbance: 0.0834934128848443,
    transmittance: 0.8251000000000001,
    kind: 'w',
  });
  expect(load.accept).toStrictEqual(['spectra.ir.peaks']);
});
