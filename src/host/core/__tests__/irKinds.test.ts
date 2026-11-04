import { expect, test } from 'vitest';

import { sciPeaksEthylbenzeneIrLoad } from '../../testing/sciPeaksIr.ts';
import { checkValue, isKnownKind, kindAccepts } from '../kinds.ts';

test('the two infrared kinds are known, and neither falls under the other', () => {
  expect(isKnownKind('spectra.ir.jdx')).toBe(true);
  expect(isKnownKind('spectra.ir.peaks')).toBe(true);
  expect(kindAccepts('spectra.ir.jdx', 'spectra.ir.peaks')).toBe(false);
  expect(kindAccepts('spectra.ir.peaks', 'spectra.ir.jdx')).toBe(false);
});

test("SciPeaks' spectrum arrives with its bands as words, without the visualizer's highlight", () => {
  const item = sciPeaksEthylbenzeneIrLoad('##TITLE=ETHYL BENZENE').items.at(-1);

  expect(item?.id).toBe('spectra/ir/spectra_ir_100-41-4-IR.jdx');
  expect(item?.label).toBe('spectra_ir_100-41-4-IR.jdx');

  const outcome = checkValue('spectra.ir.jdx', item?.value);

  expect(outcome.valid).toBe(true);

  const value = item?.value as { peaks: unknown[] };

  expect(value.peaks).toHaveLength(15);
  expect(value.peaks[0]).toStrictEqual({
    wavenumber: 1613.8583376884494,
    absorbance: 0.473660722610156,
    transmittance: 0.33599999999999997,
    strength: 'medium',
  });
  expect(value.peaks[3]).toStrictEqual({
    wavenumber: 2887.659073366737,
    absorbance: 0.7066374452885544,
    transmittance: 0.1965,
    strength: 'strong',
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
  expect(checkValue('spectra.ir.jdx', { peaks: [] })).toStrictEqual({
    valid: false,
    errors: ["/: must have required property 'jdx'"],
  });
});

test('empty bands stay empty, and a file name or a letter the kind does not carry is dropped', () => {
  const value = {
    jdx: '##TITLE=x',
    filename: 'spectra/ir/x.jdx',
    peaks: [{ wavenumber: 1715, kind: 'S', strength: 'strong' }],
  };

  expect(checkValue('spectra.ir.jdx', value)).toStrictEqual({
    valid: true,
    checked: {
      kind: 'spectra.ir.jdx',
      value: {
        jdx: '##TITLE=x',
        peaks: [{ wavenumber: 1715, strength: 'strong' }],
      },
    },
  });
  expect(
    checkValue('spectra.ir.jdx', { jdx: '##TITLE=x', peaks: [] }),
  ).toStrictEqual({
    valid: true,
    checked: { kind: 'spectra.ir.jdx', value: { jdx: '##TITLE=x', peaks: [] } },
  });
});

test('a strength is one of three words, and a wavenumber is above zero', () => {
  expect(
    checkValue('spectra.ir.peaks', {
      peaks: [{ wavenumber: 1715, strength: 'S' }],
    }),
  ).toStrictEqual({
    valid: false,
    errors: ['/peaks/0/strength: must be equal to one of the allowed values'],
  });
  expect(
    checkValue('spectra.ir.peaks', { peaks: [{ wavenumber: 0 }] }),
  ).toStrictEqual({
    valid: false,
    errors: ['/peaks/0/wavenumber: must be > 0'],
  });
});

test('the bands handed back are a list of the same bands, and a baseline may dip below zero', () => {
  const peaks = [
    { wavenumber: 1715, transmittance: 0.2, strength: 'strong' },
    { wavenumber: 2350, absorbance: -0.004, transmittance: 1.009 },
  ];

  expect(checkValue('spectra.ir.peaks', { peaks })).toStrictEqual({
    valid: true,
    checked: { kind: 'spectra.ir.peaks', value: { peaks } },
  });
  expect(
    checkValue('spectra.ir.peaks', { peaks: [{ wavenumber: Number.NaN }] })
      .valid,
  ).toBe(false);
});
