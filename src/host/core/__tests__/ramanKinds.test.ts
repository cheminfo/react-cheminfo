import { expect, test } from 'vitest';

import { sciPeaksEthylbenzeneRamanLoad } from '../../testing/sciPeaksRaman.ts';
import { checkValue, isKnownKind, kindAccepts } from '../kinds.ts';
import type { ToolInterface } from '../protocol.ts';
import { selectInputs } from '../selectInputs.ts';

/** A site reading every Raman spectrum of a sample. */
const RAMAN_TOOL: ToolInterface = {
  name: 'vibrations',
  inputs: [
    {
      key: 'ramanSpectra',
      kinds: ['spectra.raman.jdx'],
      many: true,
      optional: true,
    },
    { key: 'structure', kinds: ['chem.molfile'], optional: true },
  ],
  outputs: [{ key: 'ramanPeaks', kind: 'spectra.raman.peaks' }],
};

test('the two Raman kinds are known, and none falls under another or under an infrared one', () => {
  expect(isKnownKind('spectra.raman.jdx')).toBe(true);
  expect(isKnownKind('spectra.raman.peaks')).toBe(true);
  expect(kindAccepts('spectra.raman.jdx', 'spectra.raman.peaks')).toBe(false);
  expect(kindAccepts('spectra.raman.peaks', 'spectra.raman.jdx')).toBe(false);
  expect(kindAccepts('spectra.ir.jdx', 'spectra.raman.jdx')).toBe(false);
});

test("SciPeaks' Raman spectra arrive in order, the adamantane with its bands and the mapping without", () => {
  const load = sciPeaksEthylbenzeneRamanLoad({
    adamantane: '##TITLE= Adamantane',
    map: '##TITLE=Simple mapping measurement 1',
  });

  const selection = selectInputs(RAMAN_TOOL, load.items);

  expect(
    selection.ok
      ? selection.inputs.map(({ key, item }) => [key, item.id ?? item.kind])
      : selection,
  ).toStrictEqual([
    ['ramanSpectra', 'spectra/raman/Adamantan.jdx'],
    ['ramanSpectra', 'spectra/raman/6x6.jdx'],
    ['structure', 'chem.molfile.2d'],
  ]);

  const [adamantane, map] = selection.ok ? selection.inputs : [];

  expect(adamantane?.checked.value).toStrictEqual({
    jdx: '##TITLE= Adamantane',
    peaks: [
      { wavenumber: 2913.7252010212374, intensity: 21726, strength: 'strong' },
      { wavenumber: 1219.26005372187, intensity: 4223, strength: 'weak' },
      { wavenumber: 1215.907996061535, intensity: 1049.8, strength: 'weak' },
    ],
  });
  expect(map?.checked.value).toStrictEqual({
    jdx: '##TITLE=Simple mapping measurement 1',
  });
  expect(load.accept).toStrictEqual(['spectra.raman.peaks']);
});

test('an anti-Stokes shift is negative, and an intensity is a number in any unit', () => {
  const peaks = [
    { wavenumber: -520.7, intensity: 310 },
    { wavenumber: 520.7, intensity: -2.5, strength: 'medium' },
  ];

  expect(checkValue('spectra.raman.peaks', { peaks })).toStrictEqual({
    valid: true,
    checked: { kind: 'spectra.raman.peaks', value: { peaks } },
  });
});

test('a Raman band carries no absorbance, and its strength is a word', () => {
  expect(
    checkValue('spectra.raman.jdx', {
      jdx: '##TITLE=x',
      peaks: [{ wavenumber: 1001, absorbance: 0.3, intensity: 900 }],
    }),
  ).toStrictEqual({
    valid: true,
    checked: {
      kind: 'spectra.raman.jdx',
      value: {
        jdx: '##TITLE=x',
        peaks: [{ wavenumber: 1001, intensity: 900 }],
      },
    },
  });
  expect(
    checkValue('spectra.raman.peaks', {
      peaks: [{ wavenumber: 1001, strength: 'w' }],
    }),
  ).toStrictEqual({
    valid: false,
    errors: ['/peaks/0/strength: must be equal to one of the allowed values'],
  });
});
