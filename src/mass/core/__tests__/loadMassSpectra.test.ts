import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { detectMassFormat } from '../detectMassFormat.ts';
import { loadMassSpectra } from '../loadMassSpectra.ts';

/**
 * A fixture, as the bytes a drop would hand over.
 * @param name - Its file name in `data/`.
 * @returns Its bytes.
 */
function fixture(name: string): Uint8Array {
  return readFileSync(join(import.meta.dirname, 'data', name));
}

test('a JCAMP peak table of the old MS dialect, with its records', async () => {
  const { spectra, format, dropped } = await loadMassSpectra(
    fixture('aflatoxin-peaks.jdx'),
    { fileName: 'aflatoxin-peaks.jdx' },
  );

  expect(format).toBe('jcamp');
  expect(dropped).toBe(0);
  expect(spectra).toHaveLength(1);

  const [aflatoxin] = spectra;

  expect(aflatoxin?.name).toBe('Aflatoxin  (macfile.jdx)');
  expect(aflatoxin?.origin).toStrictEqual({
    format: 'jcamp',
    fileName: 'aflatoxin-peaks.jdx',
  });
  expect(aflatoxin?.trace.x).toHaveLength(23);
  expect(aflatoxin?.trace.x[1]).toBe(43);
  expect(aflatoxin?.trace.y[22]).toBe(202);
  expect(aflatoxin?.meta?.fields).toStrictEqual([
    { label: 'Source', value: 'UWI, Mona, JAMAICA' },
    { label: 'Instrument', value: 'Finnigan' },
    { label: 'Analyser', value: 'TRAP' },
    { label: 'Instrument parameters', value: 'LOW RESOLUTION' },
    { label: 'Ionization', value: 'EI+' },
    { label: 'Inlet', value: 'GC' },
    { label: 'Operator', value: 'Dr Robert Lancashire' },
  ]);
});

test('every page of a GC/MS NTUPLES block is a spectrum of its own', async () => {
  const { spectra } = await loadMassSpectra(fixture('gcms-ntuples.jdx'), {
    fileName: 'gcms-ntuples.jdx',
  });

  expect(spectra.map((spectrum) => spectrum.name)).toStrictEqual([
    'Peppermint oil, three scans across the limonene peak (T= 720)',
    'Peppermint oil, three scans across the limonene peak (T= 750)',
    'Peppermint oil, three scans across the limonene peak (T= 780)',
  ]);
  expect(spectra.map((spectrum) => spectrum.origin.scanIndex)).toStrictEqual([
    0, 1, 2,
  ]);
  expect(spectra.map((spectrum) => spectrum.trace.x.length)).toStrictEqual([
    4, 3, 5,
  ]);
});

test('a file holding more spectra than asked for says how many it left', async () => {
  const { spectra, dropped } = await loadMassSpectra(
    fixture('gcms-ntuples.jdx'),
    { maxSpectra: 2 },
  );

  expect(spectra).toHaveLength(2);
  expect(dropped).toBe(1);
});

test('a Thermo profile keeps its records and its scan description', async () => {
  const { spectra } = await loadMassSpectra(fixture('taxine-b-ms2.jdx'));

  const [taxine] = spectra;

  expect(taxine?.trace.x).toHaveLength(147);
  expect(taxine?.continuous).toBeUndefined();
  expect(taxine?.meta?.title).toBe('Taxine B HCD53');
  expect(taxine?.meta?.molecularFormula).toBe('C33H45NO8');
  expect(taxine?.meta?.fields.slice(0, 3)).toStrictEqual([
    { label: 'Source', value: 'Taxus baccata (yew) extract' },
    { label: 'Analyser', value: 'FTMS' },
    { label: 'Ionization', value: 'ESI' },
  ]);
  expect(taxine?.meta?.conditions).toContain(
    'FTMS + p ESI d Full ms2 584.8218@hcd53.33',
  );
});

test('two columns of text are sorted, and a repeated mass summed', async () => {
  const { spectra, format } = await loadMassSpectra(
    fixture('caffeine-peaks.txt'),
    { fileName: 'caffeine-peaks.txt' },
  );

  expect(format).toBe('text');

  const [caffeine] = spectra;

  expect(caffeine?.meta).toBeNull();
  expect(caffeine?.origin).toStrictEqual({
    format: 'text',
    fileName: 'caffeine-peaks.txt',
  });
  expect(Array.from(caffeine?.trace.x ?? [])).toStrictEqual([
    83.0604, 110.0713, 138.0662, 195.0877, 196.0911,
  ]);
  expect(Array.from(caffeine?.trace.y ?? [])).toStrictEqual([
    3.1, 12.5, 100, 8.3, 0.85,
  ]);
});

test('a JCAMP of another technique is refused, saying what it holds', async () => {
  const infrared = [
    '##TITLE=film',
    '##JCAMP-DX=4.24',
    '##DATA TYPE=INFRARED SPECTRUM',
    '##XUNITS=1/CM',
    '##YUNITS=TRANSMITTANCE',
    '##PEAK TABLE=(XY..XY)',
    '1000,90 1500,40 2000,80',
    '##END=',
  ].join('\n');

  await expect(
    loadMassSpectra(infrared, { fileName: 'film.jdx' }),
  ).rejects.toThrow(
    'film.jdx was read as JCAMP-DX but holds no mass spectrum — its blocks state INFRARED SPECTRUM in 1/CM.',
  );
});

test('a copied table is read from its first two columns, as text and as bytes', async () => {
  const table = [
    'mz\tintensity\tdeltaNeutrons\tassignment',
    '287.05501\t100.0000\t0\tA, [ ¹²C₁₅ ¹H₁₁ ¹⁶O₆ ]',
    '288.05837\t16.2236\t1\tA+1, [ ¹³C ]',
    '289.05926\t1.2330\t2\tA+2, [ ¹⁸O ]',
  ].join('\n');

  for (const data of [table, new TextEncoder().encode(table)]) {
    // eslint-disable-next-line no-await-in-loop -- one reading after the other, each asserted on its own
    const { spectra, format } = await loadMassSpectra(data);
    const [spectrum] = spectra;

    expect(format).toBe('text');
    expect(Array.from(spectrum?.trace.x ?? [])).toStrictEqual([
      287.05501, 288.05837, 289.05926,
    ]);
    expect(Array.from(spectrum?.trace.y ?? [])).toStrictEqual([
      100, 16.2236, 1.233,
    ]);
  }
});

test('a peak carrying a note is kept among peaks that carry none', async () => {
  const { spectra } = await loadMassSpectra(
    '100\t50\n101\t20\n102\t10\tmolecular ion\n103\t5',
  );
  const [spectrum] = spectra;

  expect(Array.from(spectrum?.trace.x ?? [])).toStrictEqual([
    100, 101, 102, 103,
  ]);
  expect(Array.from(spectrum?.trace.y ?? [])).toStrictEqual([50, 20, 10, 5]);
});

test('columns apart by spaces under a header are still read by the column reader', async () => {
  const { spectra } = await loadMassSpectra('mz intensity\n100 12\n101 3');
  const [spectrum] = spectra;

  expect(Array.from(spectrum?.trace.x ?? [])).toStrictEqual([100, 101]);
  expect(Array.from(spectrum?.trace.y ?? [])).toStrictEqual([12, 3]);
});

test('text with no numbers in it is refused with a sentence', async () => {
  await expect(loadMassSpectra('hello\nworld')).rejects.toThrow(
    'The pasted text holds no two columns of numbers',
  );
});

test('bytes that are not text are refused before any reader sees them', async () => {
  await expect(
    loadMassSpectra(new Uint8Array([0, 1, 2, 255, 254, 0]), {
      fileName: 'run.raw',
    }),
  ).rejects.toThrow('run.raw is not a spectrum this viewer can read');
});

test('the content decides the format, and a byte order mark is no obstacle', () => {
  expect(detectMassFormat('﻿##TITLE=x\n##END=', 'export.txt')).toBe('jcamp');
  expect(detectMassFormat('100 12\n101 3', 'peaks.jdx')).toBe('jcamp');
  expect(detectMassFormat('100 12\n101 3', 'peaks.csv')).toBe('text');
  expect(detectMassFormat('100 12\n101 3')).toBe('text');
  expect(detectMassFormat('', 'empty.txt')).toBe('unknown');
  expect(detectMassFormat(new Uint8Array([0, 159, 146, 150]))).toBe('unknown');
});
