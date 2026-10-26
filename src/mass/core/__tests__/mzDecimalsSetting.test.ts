import { expect, test } from 'vitest';

import type { MassSpectrum } from '../massSpectrum.ts';
import type { MassSettings } from '../massState.ts';
import { DEFAULT_SETTINGS, mergeMassSettings } from '../massState.ts';
import { mzDecimalsFor } from '../mzDecimalsSetting.ts';
import { mzDecimalsOf } from '../resolutionOf.ts';

import { peakListSpectrum } from './massFixtures.ts';

const orbitrap = peakListSpectrum('orbitrap', [163.0601, 325.1129], [40, 100]);
const twoDecimals = peakListSpectrum('two', [163.06, 325.11], [40, 100]);
const ionTrap: MassSpectrum = {
  ...peakListSpectrum('ion-trap', [163.0601, 325.1129], [40, 100]),
  meta: {
    title: null,
    molecularFormula: null,
    fields: [{ label: 'Analyser', value: 'ITMS' }],
    conditions: null,
  },
};
const library = peakListSpectrum('library', [163, 325], [40, 100]);

test('left to the spectra, masses are high resolution or nominal', () => {
  expect(mzDecimalsOf([orbitrap])).toBe(4);
  // Low resolution, whether the masses were written short or the file names
  // an ion trap: the decimals of either are not worth writing unasked.
  expect(mzDecimalsOf([twoDecimals])).toBe(0);
  expect(mzDecimalsOf([ionTrap])).toBe(0);
  expect(mzDecimalsOf([library])).toBe(0);
  expect(mzDecimalsOf([library, orbitrap])).toBe(4);
});

test('a mass a reader could not read is left out, and the rest decide', () => {
  const whole = peakListSpectrum('whole', [163, Number.NaN, 487], [1, 1, 1]);
  const resolved = peakListSpectrum('resolved', [163.0601, Number.NaN], [1, 1]);

  expect(mzDecimalsOf([whole])).toBe(0);
  expect(mzDecimalsOf([resolved])).toBe(4);
});

test('an empty spectrum beside a nominal one does not change the answer', () => {
  const empty = peakListSpectrum('empty', [], []);

  expect(mzDecimalsOf([empty, library])).toBe(0);
});

test('a number chosen holds whatever the spectra resolve', () => {
  expect(mzDecimalsFor(2, [orbitrap])).toBe(2);
  expect(mzDecimalsFor(3, [library])).toBe(3);
  expect(mzDecimalsFor(1, [ionTrap])).toBe(1);
  expect(mzDecimalsFor('auto', [ionTrap])).toBe(0);
  expect(mzDecimalsFor('auto', [orbitrap])).toBe(4);
});

test('a setting is read back as auto or as a whole number from 0 to 5', () => {
  const decimalsAfter = (mzDecimals: unknown) =>
    mergeMassSettings(DEFAULT_SETTINGS, {
      mzDecimals,
    } as Partial<MassSettings>).mzDecimals;

  expect(DEFAULT_SETTINGS.mzDecimals).toBe('auto');
  expect(decimalsAfter(2)).toBe(2);
  expect(decimalsAfter(2.6)).toBe(3);
  expect(decimalsAfter(9)).toBe(5);
  expect(decimalsAfter(-1)).toBe(0);
  expect(
    mergeMassSettings(
      { ...DEFAULT_SETTINGS, mzDecimals: 3 },
      {
        mzDecimals: 'auto',
      },
    ).mzDecimals,
  ).toBe('auto');
});

test('anything else stored is ignored, and the setting in force kept', () => {
  const chosen: MassSettings = { ...DEFAULT_SETTINGS, mzDecimals: 3 };
  const kept = [
    Number.NaN,
    Number.POSITIVE_INFINITY,
    'three',
    null,
    undefined,
  ].map(
    (mzDecimals) =>
      mergeMassSettings(chosen, { mzDecimals } as Partial<MassSettings>)
        .mzDecimals,
  );

  expect(kept).toStrictEqual([3, 3, 3, 3, 3]);
});
