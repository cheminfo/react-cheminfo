import { expect, test } from 'vitest';

import { checkValue, isKnownKind, kindAccepts } from '../kinds.ts';
import type { ToolInterface } from '../protocol.ts';
import { selectInputs } from '../selectInputs.ts';

/** A site reading every UV-vis spectrum of a sample. */
const UV_TOOL: ToolInterface = {
  name: 'uv-vis',
  inputs: [
    { key: 'uvSpectra', kinds: ['spectra.uv.jdx'], many: true, optional: true },
    { key: 'structure', kinds: ['chem.molfile'], optional: true },
  ],
  outputs: [{ key: 'uvPeaks', kind: 'spectra.uv.peaks' }],
};

test('the two UV-vis kinds are known, and none falls under another or under an infrared one', () => {
  expect(isKnownKind('spectra.uv.jdx')).toBe(true);
  expect(isKnownKind('spectra.uv.peaks')).toBe(true);
  expect(kindAccepts('spectra.uv.jdx', 'spectra.uv.peaks')).toBe(false);
  expect(kindAccepts('spectra.ir.jdx', 'spectra.uv.jdx')).toBe(false);
  expect(kindAccepts('spectra.uv.jdx', 'spectra.ir.jdx')).toBe(false);
});

test('a sample with two UV-vis spectra hands both over, in order, the maxima kept with the first', () => {
  const selection = selectInputs(UV_TOOL, [
    {
      kind: 'spectra.uv.jdx',
      id: 'spectra/uv/in-ethanol.jdx',
      label: 'in-ethanol.jdx',
      value: {
        jdx: '##TITLE=in ethanol',
        peaks: [{ wavelength: 254.2, absorbance: 0.81, strength: 'strong' }],
      },
    },
    {
      kind: 'spectra.uv.jdx',
      id: 'spectra/uv/in-hexane.jdx',
      value: { jdx: '##TITLE=in hexane' },
    },
  ]);

  expect(
    selection.ok
      ? selection.inputs.map(({ key, item, checked }) => [
          key,
          item.id,
          checked.value,
        ])
      : selection,
  ).toStrictEqual([
    [
      'uvSpectra',
      'spectra/uv/in-ethanol.jdx',
      {
        jdx: '##TITLE=in ethanol',
        peaks: [{ wavelength: 254.2, absorbance: 0.81, strength: 'strong' }],
      },
    ],
    ['uvSpectra', 'spectra/uv/in-hexane.jdx', { jdx: '##TITLE=in hexane' }],
  ]);
});

test('a UV-vis maximum is placed by its wavelength, which must be above zero', () => {
  expect(
    checkValue('spectra.uv.peaks', {
      peaks: [{ wavelength: 0, absorbance: 0.2 }],
    }),
  ).toStrictEqual({
    valid: false,
    errors: ['/peaks/0/wavelength: must be > 0'],
  });
  expect(
    checkValue('spectra.uv.peaks', {
      peaks: [{ wavenumber: 254, absorbance: 0.2 }],
    }),
  ).toStrictEqual({
    valid: false,
    errors: ["/peaks/0: must have required property 'wavelength'"],
  });
});

test('a UV-vis maximum keeps its absorbance and transmittance, and drops what it does not carry', () => {
  expect(
    checkValue('spectra.uv.jdx', {
      jdx: '##TITLE=x',
      peaks: [
        { wavelength: 412, absorbance: 0.3, transmittance: 0.5, width: 9 },
      ],
    }),
  ).toStrictEqual({
    valid: true,
    checked: {
      kind: 'spectra.uv.jdx',
      value: {
        jdx: '##TITLE=x',
        peaks: [{ wavelength: 412, absorbance: 0.3, transmittance: 0.5 }],
      },
    },
  });
});

test('a fluorescence maximum travels as a UV maximum, carrying its intensity', () => {
  expect(
    checkValue('spectra.uv.peaks', {
      peaks: [{ wavelength: 520, intensity: 812.5, strength: 'strong' }],
    }),
  ).toStrictEqual({
    valid: true,
    checked: {
      kind: 'spectra.uv.peaks',
      value: {
        peaks: [{ wavelength: 520, intensity: 812.5, strength: 'strong' }],
      },
    },
  });
});
