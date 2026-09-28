import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import type { LoadedIrSpectrum } from '../analysisSpectra.ts';
import { loadIrSpectra } from '../loadIrSpectra.ts';

const directory = join(import.meta.dirname, 'data');

/**
 * The fixture, as bytes.
 *
 * Read binary and handed over undecoded, because deciding the encoding is the
 * reader's job — a JCAMP written latin1 is a JCAMP.
 * @param name - The file's name inside the data directory.
 * @returns Its bytes.
 */
function fixture(name: string): Uint8Array {
  return readFileSync(join(directory, name));
}

/**
 * The one spectrum the JCAMP fixture holds.
 *
 * The unwrapping lives here rather than in each test, so no test body carries a
 * branch of its own — a test that can take either of two paths is two tests
 * wearing one name.
 * @returns The spectrum.
 */
async function onlySpectrum(): Promise<LoadedIrSpectrum> {
  const { spectra } = await loadIrSpectra(fixture('five-bands.jdx'), {
    fileName: 'five-bands.jdx',
  });
  const spectrum = spectra[0];
  if (spectrum === undefined) throw new Error('the fixture held no spectrum');
  return spectrum;
}

test('a JCAMP arrives carrying both value axes', async () => {
  const { spectra, format } = await loadIrSpectra(fixture('five-bands.jdx'), {
    fileName: 'five-bands.jdx',
  });

  expect(format).toBe('jcamp');
  expect(spectra).toHaveLength(1);

  const spectrum = await onlySpectrum();

  expect(spectrum.wavenumber).toHaveLength(901);
  expect(spectrum.absorbance).toHaveLength(901);
  expect(spectrum.transmittance).toHaveLength(901);
  expect(spectrum.name).toBe('Synthetic five-band film');
  expect(spectrum.origin).toStrictEqual({
    format: 'jcamp',
    fileName: 'five-bands.jdx',
    recorded: 'transmittance',
  });
});

test('the wavenumbers come back ascending, whichever way the file wrote them', async () => {
  const spectrum = await onlySpectrum();

  expect(spectrum.wavenumber[0]).toBe(400);
  expect(spectrum.wavenumber.at(-1)).toBe(4000);

  for (let index = 1; index < spectrum.wavenumber.length; index++) {
    expect(spectrum.wavenumber[index]).toBeGreaterThan(
      spectrum.wavenumber[index - 1] as number,
    );
  }
});

test('the two value axes are the same measurement read either way up', async () => {
  const spectrum = await onlySpectrum();

  // ir-spectrum owns this conversion; the test pins that it was applied, not how.
  for (const index of [0, 200, 450, 700, 900]) {
    const transmittance = spectrum.transmittance[index] as number;
    const absorbance = spectrum.absorbance[index] as number;

    expect(absorbance).toBeCloseTo(-Math.log10(transmittance / 100), 10);
  }
});

test('the strongest band of the fixture is where it was put', async () => {
  const spectrum = await onlySpectrum();

  let lowest = Number.POSITIVE_INFINITY;
  let atWavenumber = 0;
  for (let index = 0; index < spectrum.transmittance.length; index++) {
    const value = spectrum.transmittance[index] as number;
    if (value < lowest) {
      lowest = value;
      atWavenumber = spectrum.wavenumber[index] as number;
    }
  }

  // The carbonyl dip, 70 % deep on a baseline near 97. Its centre is 1710, which
  // the fixture's 4 cm⁻¹ grid straddles, so the lowest sampled point is 1708.
  expect(atWavenumber).toBe(1708);
  expect(lowest).toBeCloseTo(25.61, 1);
});

test('two columns of numbers are refused, and the message says why', async () => {
  await expect(
    loadIrSpectra(fixture('five-bands.csv'), { fileName: 'five-bands.csv' }),
  ).rejects.toThrow(
    /ir-spectrum derives the absorbance and transmittance pair/,
  );
});

test('something that is no spectrum at all names the formats that are', async () => {
  await expect(
    loadIrSpectra(new Uint8Array(0), { fileName: 'empty.bin' }),
  ).rejects.toThrow(/JCAMP-DX \(\.jdx, \.dx\) and Thermo Galactic SPC/);
});

test('a JCAMP that is not one fails with the file named', async () => {
  await expect(
    loadIrSpectra('##TITLE=broken\n##XYDATA=(X++(Y..Y))\n', {
      fileName: 'broken.jdx',
    }),
  ).rejects.toThrow(/^broken\.jdx/);
});
