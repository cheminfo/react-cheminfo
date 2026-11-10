import { expect, test } from 'vitest';

import { SPECTRUM_COLORS } from '../../../chart/core/spectrumColor.ts';
import { readSpectrumFiles } from '../readSpectrumFiles.ts';

const NARROW_SCAN = '282.16 178\n282.21 180\n282.26 190\n';

test('a dropped list of numbers becomes one spectrum, named after its file', async () => {
  const result = await readSpectrumFiles([
    new File([NARROW_SCAN], 'sample.txt'),
  ]);

  expect(result.error).toBeNull();
  expect(result.spectra).toHaveLength(1);

  const [spectrum] = result.spectra;

  expect(spectrum?.name).toBe('sample.txt');
  expect(spectrum?.origin.format).toBe('text');
  expect(spectrum?.origin.fileName).toBe('sample.txt');
  expect(spectrum?.energy.x).toStrictEqual(
    Float64Array.from([282.16, 282.21, 282.26]),
  );
  // No file said what the source was, so there is no binding axis to convert to.
  expect(spectrum?.sourceEnergy).toBeNull();
  expect(spectrum?.kinetic).toBeNull();
});

test('two files dropped at once are drawn in two colours', async () => {
  const result = await readSpectrumFiles([
    new File([NARROW_SCAN], 'as-received.txt'),
    new File([NARROW_SCAN], 'sputtered.txt'),
  ]);

  expect(result.spectra).toHaveLength(2);
  expect(result.spectra[0]?.color).toBe(SPECTRUM_COLORS[0]);
  expect(result.spectra[1]?.color).toBe(SPECTRUM_COLORS[1]);
});

test('the colours already on the chart are left alone', async () => {
  const result = await readSpectrumFiles(
    [new File([NARROW_SCAN], 'third.txt')],
    { taken: [SPECTRUM_COLORS[0] as string, SPECTRUM_COLORS[1] as string] },
  );

  expect(result.spectra[0]?.color).toBe(SPECTRUM_COLORS[2]);
});

test('a file that is not a spectrum is refused by name', async () => {
  const result = await readSpectrumFiles([
    new File(['<html><body>nothing here</body></html>'], 'report.html'),
  ]);

  expect(result.spectra).toStrictEqual([]);
  expect(result.error).toBe(
    '"report.html" is not a spectrum this reader knows — it takes VAMAS, JCAMP-DX, and two columns of "binding energy counts".',
  );
});

test('the spectra of a good file survive a bad one dropped beside it', async () => {
  const result = await readSpectrumFiles([
    new File([NARROW_SCAN], 'sample.txt'),
    new File(['<html></html>'], 'report.html'),
  ]);

  expect(result.spectra).toHaveLength(1);
  expect(result.spectra[0]?.name).toBe('sample.txt');
  expect(result.error).toBe(
    '"report.html" is not a spectrum this reader knows — it takes VAMAS, JCAMP-DX, and two columns of "binding energy counts".',
  );
});

test('two files that both failed are one sentence, not two messages', async () => {
  const result = await readSpectrumFiles([
    new File(['<html></html>'], 'one.html'),
    new File(['%PDF-1.7\ntrailer\n'], 'two.pdf'),
  ]);

  expect(result.spectra).toStrictEqual([]);
  expect(result.error).toBe(
    '"one.html" is not a spectrum this reader knows — it takes VAMAS, JCAMP-DX, and two columns of "binding energy counts". "two.pdf" is not a spectrum this reader knows — it takes VAMAS, JCAMP-DX, and two columns of "binding energy counts".',
  );
});

test('nothing dropped is nothing read', async () => {
  const result = await readSpectrumFiles([]);

  expect(result).toStrictEqual({ spectra: [], error: null });
});
