import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import {
  bandsFromIrPeaks,
  bandsFromRamanPeaks,
  irPeaksFromBands,
  ramanPeaksFromBands,
} from '../irPeaks.ts';
import type { IrSpectrum } from '../irSpectrum.ts';
import { loadIrSpectra } from '../loadIrSpectra.ts';
import { toIrSpectrum } from '../toIrSpectrum.ts';

/**
 * The five-band film, read through the real reader, under a known id.
 * @returns The spectrum.
 */
async function film(): Promise<IrSpectrum> {
  const { spectra } = await loadIrSpectra(
    readFileSync(join(import.meta.dirname, 'data/five-bands.jdx')),
    { fileName: 'five-bands.jdx' },
  );
  const [loaded] = spectra;
  if (loaded === undefined) throw new Error('The fixture holds no spectrum');
  return toIrSpectrum(loaded, { id: 'film' });
}

/**
 * A Raman spectrum of two bands over a baseline of 10 counts, one sample per
 * cm⁻¹ from 100 to 1500: 1000 counts at 520 cm⁻¹ and 300 at 1001 cm⁻¹.
 * @returns The spectrum.
 */
function silicon(): IrSpectrum {
  const wavenumber = new Float64Array(1401);
  const intensity = new Float64Array(1401);
  for (let index = 0; index < wavenumber.length; index++) {
    const shift = 100 + index;
    wavenumber[index] = shift;
    intensity[index] =
      10 +
      1000 * Math.exp(-((shift - 520) ** 2) / 50) +
      300 * Math.exp(-((shift - 1001) ** 2) / 50);
  }
  return toIrSpectrum(
    {
      wavenumber,
      intensity,
      meta: null,
      origin: { format: 'jcamp', recorded: 'intensity' },
    },
    { id: 'silicon' },
  );
}

test("a host's infrared bands stay where it put them, its fraction read as a percentage", async () => {
  const spectrum = await film();

  const bands = bandsFromIrPeaks(spectrum, [
    {
      wavenumber: 2948.3,
      absorbance: 0.21,
      transmittance: 0.612,
      strength: 'medium',
    },
    { wavenumber: 1708 },
    { wavenumber: Number.NaN },
  ]);

  expect(bands).toStrictEqual([
    {
      spectrumId: 'film',
      wavenumber: 1708,
      absorbance: 0.5915400684472172,
      transmittance: 25.61296945345416,
      strength: 'S',
    },
    {
      spectrumId: 'film',
      wavenumber: 2948.3,
      absorbance: 0.21,
      transmittance: 61.199999999999996,
      strength: 'm',
    },
  ]);
});

test('infrared bands go back as a host keeps them: a fraction, and a strength in words', () => {
  expect(
    irPeaksFromBands([
      {
        spectrumId: 'film',
        wavenumber: 1708,
        absorbance: 0.59,
        transmittance: 25.6,
        strength: 'S',
      },
      {
        spectrumId: 'calcite',
        wavenumber: 1000,
        intensity: 5100,
        strength: 'm',
      },
    ]),
  ).toStrictEqual([
    {
      wavenumber: 1708,
      absorbance: 0.59,
      transmittance: 0.256,
      strength: 'strong',
    },
    { wavenumber: 1000, strength: 'medium' },
  ]);
});

test("a host's Raman bands keep its intensity and strength, and the rest is read off the spectrum", () => {
  const bands = bandsFromRamanPeaks(silicon(), [
    { wavenumber: 1001.4, strength: 'medium' },
    { wavenumber: 520 },
    { wavenumber: 760, intensity: 12.5, strength: 'weak' },
    { wavenumber: Number.NaN },
  ]);

  expect(bands).toStrictEqual([
    { spectrumId: 'silicon', wavenumber: 520, intensity: 1010, strength: 'S' },
    {
      spectrumId: 'silicon',
      wavenumber: 760,
      intensity: 12.5,
      strength: 'w',
    },
    {
      spectrumId: 'silicon',
      wavenumber: 1001.4,
      intensity: 310,
      strength: 'm',
    },
  ]);
});

test('Raman bands go back with their intensity and a strength in words', () => {
  expect(
    ramanPeaksFromBands([
      {
        spectrumId: 'silicon',
        wavenumber: 520,
        intensity: 1010,
        strength: 'S',
      },
      { spectrumId: 'silicon', wavenumber: 1001, strength: 'w' },
    ]),
  ).toStrictEqual([
    { wavenumber: 520, intensity: 1010, strength: 'strong' },
    { wavenumber: 1001, strength: 'weak' },
  ]);
});
