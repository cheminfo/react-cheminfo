import { expect, test } from 'vitest';

import { SCIPEAKS_ETHYLBENZENE_IR_PEAKS } from '../../testing/sciPeaks.ts';
import { checkValue, isKnownKind, kindAccepts } from '../kinds.ts';

test('the two infrared kinds are known, and neither falls under the other', () => {
  expect(isKnownKind('spectra.ir.jdx')).toBe(true);
  expect(isKnownKind('spectra.ir.peaks')).toBe(true);
  expect(kindAccepts('spectra.ir.jdx', 'spectra.ir.peaks')).toBe(false);
  expect(kindAccepts('spectra.ir.peaks', 'spectra.ir.jdx')).toBe(false);
});

test("SciPeaks' bands are read as stored, without the visualizer's highlight", () => {
  const value = {
    jdx: '##TITLE=ETHYL BENZENE',
    filename: 'spectra/ir/spectra_ir_100-41-4-IR.jdx',
    peaks: SCIPEAKS_ETHYLBENZENE_IR_PEAKS.map((peak) => ({ ...peak })),
  };

  const outcome = checkValue('spectra.ir.jdx', value);

  expect(outcome.valid).toBe(true);
  expect(value.peaks).toHaveLength(15);
  expect(value.peaks[0]).toStrictEqual({
    wavenumber: 1613.8583376884494,
    absorbance: 0.473660722610156,
    transmittance: 0.33599999999999997,
    kind: 'm',
  });
});

test('a JCAMP-DX alone is enough, and a band needs at least its wavenumber', () => {
  expect(checkValue('spectra.ir.jdx', { jdx: '##TITLE=x' }).valid).toBe(true);
  expect(
    checkValue('spectra.ir.jdx', {
      jdx: '##TITLE=x',
      peaks: [{ absorbance: 0.4 }, { wavenumber: '1700' }],
    }),
  ).toStrictEqual({
    valid: false,
    errors: ["/peaks/0: must have required property 'wavenumber'"],
  });
  expect(checkValue('spectra.ir.jdx', { filename: 'a.jdx' })).toStrictEqual({
    valid: false,
    errors: ["/: must have required property 'jdx'"],
  });
});

test('the bands handed back are a list of the same bands', () => {
  expect(
    checkValue('spectra.ir.peaks', {
      peaks: [{ wavenumber: 1715, transmittance: 0.2, kind: 'S' }],
    }),
  ).toStrictEqual({
    valid: true,
    checked: {
      kind: 'spectra.ir.peaks',
      value: { peaks: [{ wavenumber: 1715, transmittance: 0.2, kind: 'S' }] },
    },
  });
  expect(
    checkValue('spectra.ir.peaks', { peaks: [{ wavenumber: Number.NaN }] })
      .valid,
  ).toBe(false);
});
