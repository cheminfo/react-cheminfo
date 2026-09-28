import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import type { IrSpectrum } from '../irSpectrum.ts';
import { loadIrSpectra } from '../loadIrSpectra.ts';
import { pickBands } from '../pickBands.ts';
import { toIrSpectrum } from '../toIrSpectrum.ts';

/**
 * The fixture, as the viewer holds it.
 *
 * The five bands were put in at 3330, 2950, 1710, 1600 and 1050 cm⁻¹, with the
 * carbonyl the deepest and the 1600 band the shallowest.
 * @returns The spectrum.
 */
async function fiveBands(): Promise<IrSpectrum> {
  const { spectra } = await loadIrSpectra(
    readFileSync(join(import.meta.dirname, './data/five-bands.jdx')),
  );
  const loaded = spectra[0];
  if (loaded === undefined) throw new Error('no spectrum');
  return toIrSpectrum(loaded, { id: 'film', color: '#1f77b4' });
}

test('every band that was put in the spectrum is found', async () => {
  const bands = pickBands(await fiveBands());

  // The centres are sampled points on the fixture's 4 cm⁻¹ grid, which is what
  // ir-spectrum reports; the bands were put in at 1050, 1600, 1710, 2950, 3330.
  expect(bands.map((band) => Math.round(band.wavenumber))).toStrictEqual([
    1048, 1600, 1708, 2948, 3328,
  ]);
});

test('the bands come back ascending, and the deepest is the carbonyl', async () => {
  const bands = pickBands(await fiveBands());
  const strongest = bands.toSorted(
    (first, second) => second.absorbance - first.absorbance,
  )[0];

  expect(Math.round(strongest?.wavenumber ?? 0)).toBe(1708);
  expect(strongest?.strength).toBe('S');
});

test('a band carries the same measurement in both axes', async () => {
  const bands = pickBands(await fiveBands());
  const carbonyl = bands.find((band) => Math.round(band.wavenumber) === 1708);

  // Percent, not the fraction ir-spectrum reports, and consistent with the trace.
  expect(carbonyl?.transmittance).toBeCloseTo(25.7, 0);
  expect(carbonyl?.absorbance).toBeCloseTo(
    -Math.log10((carbonyl?.transmittance ?? 0) / 100),
    6,
  );
});

test('a window keeps only the bands inside it', async () => {
  const bands = pickBands(await fiveBands(), { from: 1500, to: 2000 });

  expect(bands.map((band) => Math.round(band.wavenumber))).toStrictEqual([
    1600, 1708,
  ]);
});

test('a limit keeps the strongest bands but reports them in axis order', async () => {
  const bands = pickBands(await fiveBands(), { limit: 2 });

  expect(bands.map((band) => Math.round(band.wavenumber))).toStrictEqual([
    1708, 3328,
  ]);
});

test('raising the height threshold drops the weakest band first', async () => {
  const spectrum = await fiveBands();
  const all = pickBands(spectrum);
  const strong = pickBands(spectrum, { minRelativeHeight: 0.3 });

  expect(all.length).toBeGreaterThan(strong.length);
  expect(strong.map((band) => Math.round(band.wavenumber))).not.toContain(1600);
});

test('a spectrum of nothing is not an error', () => {
  const empty: IrSpectrum = {
    id: 'empty',
    name: 'empty',
    color: '#1f77b4',
    wavenumber: new Float64Array(0),
    absorbance: new Float64Array(0),
    transmittance: new Float64Array(0),
    meta: null,
    origin: { format: 'calculated' },
    visible: true,
  };

  expect(pickBands(empty)).toStrictEqual([]);
});
