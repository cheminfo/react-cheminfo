import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { loadRamanSpectra } from '../loadRamanSpectra.ts';
import { ramanSpectra } from '../ramanSpectra.ts';

function read(name: string) {
  return readFileSync(join(import.meta.dirname, 'data/raman', name));
}

function block(dataType: string, x: number[], y: number[]) {
  return {
    dataType,
    variables: { x: { label: 'x', data: x }, y: { label: 'y', data: y } },
  };
}

test('a JCAMP-DX is read as intensity over its shifts, ascending, its records kept', async () => {
  const { spectra, format } = await loadRamanSpectra(read('adamantan.jdx'), {
    fileName: 'adamantan.jdx',
  });

  expect(format).toBe('jcamp');
  expect(spectra).toHaveLength(1);

  const [spectrum] = spectra;

  expect(spectrum?.name).toBe('Adamantane');
  expect(spectrum?.origin).toStrictEqual({
    format: 'jcamp',
    fileName: 'adamantan.jdx',
    recorded: 'intensity',
  });
  expect(spectrum?.absorbance).toBeUndefined();
  expect(spectrum?.transmittance).toBeUndefined();
  expect(spectrum?.wavenumber).toHaveLength(1791);
  expect(spectrum?.wavenumber[0]).toBeCloseTo(101.348_824, 6);
  expect(spectrum?.wavenumber.at(-1)).toBeCloseTo(3101.440_43, 5);
  // The file runs from 3101 down to 101 cm⁻¹: the counts travel with the shifts.
  expect(spectrum?.intensity?.[0]).toBe(7);
  expect(spectrum?.intensity?.at(-1)).toBe(38);
  expect(spectrum?.meta).toStrictEqual({
    title: 'Adamantane',
    fields: [
      { label: 'Technique', value: 'Raman SPECTRUM' },
      { label: 'ASSIGNMENT TYPE', value: 'CHIME' },
      { label: 'CHIME TARGET', value: 'CHIMEDISP' },
    ],
  });
});

test('a Thermo Galactic SPC is read as Raman, its anti-Stokes side included', async () => {
  const { spectra, format } = await loadRamanSpectra(read('raman.spc'), {
    fileName: 'raman.spc',
  });

  expect(format).toBe('spc');
  expect(spectra).toHaveLength(1);

  const [spectrum] = spectra;

  expect(spectrum?.name).toBeUndefined();
  expect(spectrum?.origin).toStrictEqual({
    format: 'spc',
    fileName: 'raman.spc',
    recorded: 'intensity',
  });
  expect(spectrum?.wavenumber).toHaveLength(3632);
  expect(spectrum?.wavenumber[0]).toBeCloseTo(-3005.956_054_7, 6);
  expect(spectrum?.wavenumber.at(-1)).toBeCloseTo(3996.823_242_2, 6);
  expect(spectrum?.intensity?.[0]).toBeCloseTo(0.032_077, 6);
  expect(spectrum?.meta?.fields[0]).toStrictEqual({
    label: 'Technique',
    value: 'Raman',
  });
  expect(
    spectrum?.meta?.fields.filter((field) => field.value.includes('[object')),
  ).toStrictEqual([]);
});

test('a Renishaw WDF map gives one spectrum per point, each with its index', async () => {
  const { spectra, format } = await loadRamanSpectra(read('6x6.wdf'), {
    fileName: '6x6.wdf',
  });

  expect(format).toBe('wdf');
  expect(spectra).toHaveLength(36);
  expect(spectra[0]?.origin).toStrictEqual({
    format: 'wdf',
    fileName: '6x6.wdf',
    recorded: 'intensity',
    blockIndex: 0,
  });
  expect(spectra[35]?.origin.blockIndex).toBe(35);
  expect(spectra[0]?.name).toBe('Simple mapping measurement 1');
  expect(spectra[0]?.wavenumber).toHaveLength(1015);
  expect(spectra[0]?.wavenumber[0]).toBeCloseTo(1218.433_594, 6);
  expect(spectra[0]?.wavenumber.at(-1)).toBeCloseTo(2801.458_984, 6);
  expect(spectra[0]?.intensity?.[0]).toBeCloseTo(1870.669_067, 6);
  expect(spectra[35]?.intensity?.[0]).toBeCloseTo(2475.927_979, 6);
});

test('a WDF is recognised from its first bytes, whatever its name', async () => {
  const { format, spectra } = await loadRamanSpectra(read('6x6.wdf'), {
    fileName: 'map.dat',
  });

  expect(format).toBe('wdf');
  expect(spectra).toHaveLength(36);
});

test('two columns of text are read as shift and intensity, sorted by shift', async () => {
  const { spectra, format } = await loadRamanSpectra(
    'shift\tcounts\n300\t12\n100\t10\n200\t50\n',
  );

  expect(format).toBe('text');
  expect(spectra).toStrictEqual([
    {
      wavenumber: Float64Array.from([100, 200, 300]),
      intensity: Float64Array.from([10, 50, 12]),
      meta: {
        title: null,
        fields: [{ label: 'Technique', value: 'Raman spectrum' }],
      },
      origin: { format: 'text', recorded: 'intensity' },
    },
  ]);
});

test('an infrared JCAMP-DX is refused with the technique it holds', async () => {
  await expect(
    loadRamanSpectra(read('../five-bands.jdx'), { fileName: 'five-bands.jdx' }),
  ).rejects.toThrow(
    'five-bands.jdx holds no Raman spectrum: its blocks are INFRARED SPECTRUM.',
  );
});

test('a JCAMP-DX without data holds no Raman spectrum', async () => {
  await expect(
    loadRamanSpectra('##TITLE=empty\n##END=', { fileName: 'empty.jdx' }),
  ).rejects.toThrow(
    'empty.jdx holds no Raman spectrum — no block in it carries an intensity over at least two points.',
  );
});

test('an empty file names no format', async () => {
  await expect(
    loadRamanSpectra(new Uint8Array(), { fileName: 'empty.bin' }),
  ).rejects.toThrow(
    'empty.bin is not a Raman spectrum this viewer can read — JCAMP-DX (.jdx, .dx), Thermo Galactic SPC (.spc), Renishaw WDF (.wdf) and two columns of text are understood.',
  );
});

test('a binary format that arrived as text is refused before it is read', async () => {
  await expect(
    loadRamanSpectra('WDF1abc', { fileName: 'map.wdf' }),
  ).rejects.toThrow(
    'map.wdf is a binary WDF file but arrived as text, which loses bytes it cannot get back.',
  );
});

test('a cut file says which reader stopped on it', async () => {
  await expect(
    loadRamanSpectra(read('6x6.wdf').subarray(0, 200), { fileName: 'cut.wdf' }),
  ).rejects.toThrow(
    'cut.wdf could not be read as a Raman spectrum — the WDF reader stopped on it with: Offset is outside the bounds of the DataView',
  );
});

test('of a linked file, only the Raman blocks are kept, by their place in it', () => {
  const spectra = ramanSpectra(
    [
      block('INFRARED SPECTRUM', [3000, 1000], [0.1, 0.2]),
      block('RAMAN SPECTRUM', [3000, 1000], [5, 9]),
      block('', [500], [1]),
    ],
    { format: 'jcamp' },
  );

  expect(spectra).toStrictEqual([
    {
      wavenumber: Float64Array.from([1000, 3000]),
      intensity: Float64Array.from([9, 5]),
      meta: {
        title: null,
        fields: [{ label: 'Technique', value: 'RAMAN SPECTRUM' }],
      },
      origin: { format: 'jcamp', recorded: 'intensity', blockIndex: 1 },
    },
  ]);
});
