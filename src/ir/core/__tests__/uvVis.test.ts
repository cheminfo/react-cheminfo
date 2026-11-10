import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { bandsFromUvPeaks, uvPeaksFromBands } from '../irPeaks.ts';
import { loadUvVisSpectra } from '../loadUvVisSpectra.ts';
import { pickBands } from '../pickBands.ts';
import { irSpectraToJcamp, irSpectrumToJcamp } from '../spectrumJcamp.ts';
import { toIrSpectra } from '../toIrSpectrum.ts';

function read(name: string) {
  return readFileSync(join(import.meta.dirname, 'data/uv', name));
}

async function spectrumOf(name: string) {
  const { spectra } = await loadUvVisSpectra(read(name), { fileName: name });
  const [spectrum] = toIrSpectra(spectra);
  if (spectrum === undefined) throw new Error(`${name} held no spectrum`);
  return spectrum;
}

test('a Shimadzu SPC is read over its wavelengths, absorbance and transmittance both', async () => {
  const { spectra, format } = await loadUvVisSpectra(read('uvprobe-flat.spc'), {
    fileName: 'uvprobe-flat.spc',
  });

  expect(format).toBe('spc');
  expect(spectra).toHaveLength(1);

  const [spectrum] = spectra;

  expect(spectrum?.origin).toStrictEqual({
    format: 'spc',
    fileName: 'uvprobe-flat.spc',
    recorded: 'absorbance',
  });
  expect(spectrum?.wavenumber).toHaveLength(1501);
  expect(spectrum?.wavenumber[0]).toBe(300);
  expect(spectrum?.wavenumber.at(-1)).toBe(600);
  expect(spectrum?.absorbance?.[0]).toBeCloseTo(0.273_79, 5);
  expect(spectrum?.transmittance?.[0]).toBeCloseTo(53.236, 3);
  expect(spectrum?.meta?.fields[0]).toStrictEqual({
    label: 'Technique',
    value: 'UV spectrum',
  });
  // The SPC reader's nested header and properties are no line of the table.
  expect(
    spectrum?.meta?.fields.filter((field) => field.value.includes('[object')),
  ).toStrictEqual([]);
});

test('a PerkinElmer ASCII SP is recognised from its content, not its name', async () => {
  const { spectra, format } = await loadUvVisSpectra(read('uv-ascii.sp'));

  expect(format).toBe('text');
  expect(spectra.map((spectrum) => spectrum.name)).toStrictEqual(['B.SP']);
  expect(spectra[0]?.wavenumber).toHaveLength(601);
  expect(spectra[0]?.wavenumber[0]).toBe(200);
  expect(spectra[0]?.absorbance?.[0]).toBeCloseTo(0.671_629, 6);
});

test('a reflectance spectrum is refused, saying why', async () => {
  await expect(
    loadUvVisSpectra(read('uv.jdx'), { fileName: 'uv.jdx' }),
  ).rejects.toThrow(
    'uv.jdx is a reflectance spectrum, which this viewer does not read yet: it reads absorbance and transmittance.',
  );
});

test('a file uv-spectrum cannot read is refused, naming it', async () => {
  await expect(
    loadUvVisSpectra(new Uint8Array([0, 1, 2, 3]), { fileName: 'noise.bin' }),
  ).rejects.toThrow(/^noise\.bin /);
});

test('every λmax of a spectrum is picked on its absorbance', async () => {
  const bands = pickBands(await spectrumOf('uvprobe-flat.spc'));

  expect(bands.map((band) => Math.round(band.wavenumber))).toStrictEqual([
    337, 356, 379,
  ]);
  expect(
    bands.map((band) => Number(band.absorbance?.toFixed(3))),
  ).toStrictEqual([1.08, 1.426, 1.149]);
  expect(bands.map((band) => band.strength)).toStrictEqual(['S', 'S', 'S']);
});

test('the maxima travel to a host by wavelength, a transmittance as a fraction', async () => {
  const spectrum = await spectrumOf('uvprobe-flat.spc');
  const bands = pickBands(spectrum);
  const [peak] = uvPeaksFromBands(bands);

  expect(Object.keys(peak ?? {})).toStrictEqual([
    'wavelength',
    'absorbance',
    'transmittance',
    'strength',
  ]);
  expect(peak?.wavelength).toBe(bands[0]?.wavenumber);
  expect(peak?.transmittance).toBeCloseTo(
    (bands[0]?.transmittance ?? 0) / 100,
    12,
  );
  expect(peak?.strength).toBe('strong');

  const back = bandsFromUvPeaks(spectrum, [
    { wavelength: 378.6, strength: 'weak' },
    { wavelength: 336.8, absorbance: 1.2 },
  ]);

  expect(back.map((band) => [band.wavenumber, band.strength])).toStrictEqual([
    [336.8, 'S'],
    [378.6, 'w'],
  ]);
  expect(back[0]?.absorbance).toBe(1.2);
  expect(back[1]?.absorbance).toBeCloseTo(1.1493, 4);
});

test('a UV-vis spectrum is written out as one, in nanometres, and read back', async () => {
  const spectrum = await spectrumOf('uvprobe-flat.spc');
  const written = irSpectrumToJcamp(spectrum, 'absorbance', 'uvvis');

  expect(written).toContain('##XUNITS=NANOMETERS');
  expect(written).toContain('##YUNITS=ABSORBANCE');

  const { spectra } = await loadUvVisSpectra(written);

  expect(spectra[0]?.wavenumber).toHaveLength(1501);
  expect(spectra[0]?.absorbance?.[0]).toBeCloseTo(0.273_79, 5);
});

test('a list of UV-vis spectra is titled as UV-vis', async () => {
  const spectrum = await spectrumOf('uvprobe-flat.spc');
  const written = irSpectraToJcamp(
    [spectrum, { ...spectrum, id: 'copy', name: 'copy' }],
    'absorbance',
    'uvvis',
  );

  expect(written.split('\n', 1)[0]).toBe('##TITLE=2 UV-vis spectra');
  expect(written.match(/##XUNITS=NANOMETERS/g)).toHaveLength(2);
});
