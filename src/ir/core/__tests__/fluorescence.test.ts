import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { bandsFromUvPeaks, uvPeaksFromBands } from '../irPeaks.ts';
import { loadUvVisSpectra } from '../loadUvVisSpectra.ts';
import { pickBands } from '../pickBands.ts';
import { irSpectrumToJcamp } from '../spectrumJcamp.ts';
import { toIrSpectra } from '../toIrSpectrum.ts';

const CARY = readFileSync(
  join(import.meta.dirname, 'data/uv/cary-eclipse.csv'),
);

async function sample() {
  const { spectra } = await loadUvVisSpectra(CARY, {
    fileName: 'cary-eclipse.csv',
  });
  const [spectrum] = toIrSpectra(spectra.slice(1, 2));
  if (spectrum === undefined) throw new Error('no Sample3-1');
  return spectrum;
}

test('a Cary Eclipse emission export is read as fluorescence, one spectrum per scan', async () => {
  const { spectra, technique, format } = await loadUvVisSpectra(CARY, {
    fileName: 'cary-eclipse.csv',
  });

  expect(technique).toBe('fluorescence');
  expect(format).toBe('text');
  expect(spectra.map((spectrum) => spectrum.name)).toStrictEqual([
    'Blank f',
    'Sample3-1',
    'Sample3-2',
    'Sample3-3',
  ]);
  expect(spectra.map((spectrum) => spectrum.origin.blockIndex)).toStrictEqual([
    0, 1, 2, 3,
  ]);

  const [, first] = spectra;

  expect(first?.wavenumber).toHaveLength(151);
  expect(first?.wavenumber[0]).toBe(450);
  expect(first?.wavenumber.at(-1)).toBe(600);
  expect(first?.intensity?.[0]).toBe(6.827293873);
  expect(first?.absorbance).toBeUndefined();
  expect(first?.transmittance).toBeUndefined();
  expect(
    first?.meta?.fields.find(({ label }) => label === 'Ex. Wavelength (nm)'),
  ).toStrictEqual({ label: 'Ex. Wavelength (nm)', value: '235.00' });
});

test('every emission maximum is picked on the intensity', async () => {
  const bands = pickBands(await sample());

  expect(bands.map((band) => Number(band.wavenumber.toFixed(2)))).toStrictEqual(
    [473.03, 502.98, 521.94],
  );
  expect(bands.map((band) => Number(band.intensity?.toFixed(2)))).toStrictEqual(
    [243.44, 412.74, 644.08],
  );
  expect(bands.map((band) => band.strength)).toStrictEqual(['m', 'm', 'S']);
});

test('an emission maximum travels to a host with its intensity, and back', async () => {
  const spectrum = await sample();
  const peaks = uvPeaksFromBands(pickBands(spectrum));

  expect(peaks[2]).toStrictEqual({
    wavelength: 521.940_002_4,
    intensity: 644.078_674_3,
    strength: 'strong',
  });

  const back = bandsFromUvPeaks(spectrum, [
    { wavelength: 521.940_002_4, intensity: 650 },
    { wavelength: 473.029_998_8, strength: 'weak' },
  ]);

  expect(
    back.map((band) => [band.wavenumber, band.intensity, band.strength]),
  ).toStrictEqual([
    [473.029_998_8, 243.437_927_2, 'w'],
    [521.940_002_4, 650, 'S'],
  ]);
});

test('a fluorescence spectrum is written out as one and read back as one', async () => {
  const written = irSpectrumToJcamp(
    await sample(),
    'intensity',
    'fluorescence',
  );

  expect(written).toContain('##DATA TYPE=FLUORESCENCE SPECTRUM');
  expect(written).toContain('##XUNITS=NANOMETERS');
  expect(written).toContain('##YUNITS=INTENSITY');

  const { spectra, technique } = await loadUvVisSpectra(written);

  expect(technique).toBe('fluorescence');
  expect(spectra[0]?.wavenumber).toHaveLength(151);
  expect(spectra[0]?.intensity?.[0]).toBe(6.827293873);
  expect(spectra[0]?.absorbance).toBeUndefined();
});
