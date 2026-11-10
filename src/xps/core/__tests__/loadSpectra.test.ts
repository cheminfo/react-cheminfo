import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { SPECTRUM_COLORS } from '../../../chart/core/spectrumColor.ts';
import { loadSpectra } from '../loadSpectra.ts';
import { pickPeaks } from '../pickPeaks.ts';
import type { XpsSpectrum } from '../xpsSpectrum.ts';

const vamasDirectory = join(import.meta.dirname, 'data');

/**
 * One of the example files, as bytes.
 * @param name - Its name, without the extension.
 * @returns The file.
 */
function readFixture(name: string) {
  return readFileSync(join(vamasDirectory, `${name}.vms`));
}

test('a VAMAS file comes back read, coloured and identified', async () => {
  const result = await loadSpectra(
    readFixture('cellulose_fitted_following_briggs'),
    { fileName: 'cellulose.vms', idPrefix: 'cellulose' },
  );

  expect(result.error).toBeNull();
  expect(result.spectra).toHaveLength(4);
  expect(result.spectra.map((spectrum) => spectrum.name)).toStrictEqual([
    'Sample Name: Cellulose — Survey',
    'Sample Name: Cellulose — C 1s',
    'Sample Name: Cellulose — O 1s',
    'Sample Name: Cellulose — Valence',
  ]);
  expect(result.spectra[0]?.id).toBe('cellulose-0');
  expect(result.spectra[0]?.origin.format).toBe('vamas');
  expect(result.spectra[1]?.components).toHaveLength(4);
});

test('the peaks are detected on the trace the chart is drawn from', async () => {
  const result = await loadSpectra(
    readFixture('cellulose_fitted_following_briggs'),
    { fileName: 'cellulose.vms' },
  );

  expect(result.spectra).toHaveLength(4);

  const carbon = result.spectra[1] as XpsSpectrum;
  const detected = pickPeaks(carbon.energy);

  expect(carbon.peaks.map((peak) => peak.bindingEnergy)).toStrictEqual(
    detected.map((peak) => peak.bindingEnergy),
  );
  expect(carbon.peaks.map((peak) => peak.intensity)).toStrictEqual(
    detected.map((peak) => peak.intensity),
  );
});

test('two columns pasted into the viewer are read as one spectrum', async () => {
  const result = await loadSpectra('282.16 178\n282.21 180\n282.26 190\n');

  expect(result.error).toBeNull();
  expect(result.spectra).toHaveLength(1);
  expect(result.spectra[0]?.origin).toStrictEqual({ format: 'text' });
  expect(result.spectra[0]?.name).toBe('Pasted spectrum');
  expect(result.spectra[0]?.energy.x).toStrictEqual(
    new Float64Array([282.16, 282.21, 282.26]),
  );
  expect(result.spectra[0]?.energy.y).toStrictEqual(
    new Float64Array([178, 180, 190]),
  );
  expect(result.spectra[0]?.id).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  );
});

test('the colours carry on from the ones already on the chart', async () => {
  const [first, second, third, fourth, fifth, sixth] = SPECTRUM_COLORS;
  const result = await loadSpectra(readFixture('pegCASA'), {
    taken: [first as string, second as string],
  });

  expect(result.spectra.map((spectrum) => spectrum.color)).toStrictEqual([
    third,
    fourth,
    fifth,
    sixth,
  ]);
});

test('the blocks the cap left unread are reported rather than passed over', async () => {
  const result = await loadSpectra(
    readFixture('cellulose_fitted_following_briggs'),
    { fileName: 'cellulose.vms', maxSpectra: 2, idPrefix: 'capped' },
  );

  expect(result.spectra).toHaveLength(2);
  expect(result.spectra[1]?.id).toBe('capped-1');
  expect(result.error).toBe(
    '"cellulose.vms" holds 4 spectra and the first 2 were read — the other 2 were left unread.',
  );
});

test('a cap below one spectrum is no answer, and the default stands', async () => {
  const result = await loadSpectra(readFixture('pegCASA'), { maxSpectra: 0 });

  expect(result.spectra).toHaveLength(4);
  expect(result.error).toBeNull();
});

test('a file this reader does not know is refused with what it does take', async () => {
  const result = await loadSpectra('%PDF-1.7\ntrailer\n', {
    fileName: 'report.pdf',
  });

  expect(result.spectra).toStrictEqual([]);
  expect(result.error).toBe(
    '"report.pdf" is not a spectrum this reader knows — it takes VAMAS, JCAMP-DX, and two columns of "binding energy counts".',
  );
});

test('a broken file comes back as a sentence and never as a throw', async () => {
  const header =
    'VAMAS Surface Chemical Analysis Standard Data Transfer Format 1988 May 4\nbroken\n';
  const result = await loadSpectra(header, { fileName: 'broken.vms' });

  expect(result.spectra).toStrictEqual([]);
  expect(result.error).toMatch(/^"broken\.vms" could not be read as VAMAS/);
});

test('two points are the shortest spectrum there is, and they are read', async () => {
  const result = await loadSpectra('1 2\n3 4\n', {
    fileName: 'two-points.txt',
  });

  expect(result.spectra).toHaveLength(1);
  expect(result.spectra[0]?.energy.x).toStrictEqual(new Float64Array([1, 3]));
  expect(result.error).toBeNull();
});
