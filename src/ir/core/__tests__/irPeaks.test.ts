import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { bandsFromPeaks, peaksFromBands } from '../irPeaks.ts';
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

test("a notebook's bands stay where it put them, its fraction read as a percentage", async () => {
  const spectrum = await film();

  const bands = bandsFromPeaks(spectrum, [
    { wavenumber: 2948.3, absorbance: 0.21, transmittance: 0.612, kind: 'm' },
    { wavenumber: 1708, kind: 'sh' },
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

test('bands go back as a notebook keeps them, transmittance as a fraction', () => {
  expect(
    peaksFromBands([
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
    { wavenumber: 1708, absorbance: 0.59, transmittance: 0.256, kind: 'S' },
    { wavenumber: 1000, kind: 'm' },
  ]);
});
