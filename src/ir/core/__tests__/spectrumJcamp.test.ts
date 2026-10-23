import { expect, test } from 'vitest';

import type { IrMode, IrSpectrum } from '../irSpectrum.ts';
import { loadIrSpectra } from '../loadIrSpectra.ts';
import { irSpectraToJcamp, irSpectrumToJcamp } from '../spectrumJcamp.ts';
import { toIrSpectrum } from '../toIrSpectrum.ts';

/**
 * A spectrum with one band, in whichever axis the file is said to have carried.
 * @param name - What the list calls it, which becomes the `##TITLE=`.
 * @param recorded - The axis the file carried, absent when it named none.
 * @returns The spectrum.
 */
function spectrum(name: string, recorded?: IrMode): IrSpectrum {
  const points = 200;
  const wavenumber = new Float64Array(points);
  const transmittance = new Float64Array(points);
  const absorbance = new Float64Array(points);
  for (let index = 0; index < points; index++) {
    const at = 400 + index * 18.2;
    wavenumber[index] = at;
    const offset = at - 1730;
    const depth = 60 * Math.exp(-(offset * offset) / (2 * 400));
    transmittance[index] = 95 - depth;
    absorbance[index] = -Math.log10((95 - depth) / 100);
  }

  const origin: IrSpectrum['origin'] = { format: 'jcamp' };
  if (recorded !== undefined) origin.recorded = recorded;
  return {
    id: name,
    name,
    color: '#0072b2',
    wavenumber,
    absorbance,
    transmittance,
    meta: {
      title: name,
      fields: [
        { label: 'Technique', value: 'INFRARED SPECTRUM' },
        { label: 'RESOLUTION', value: '4' },
      ],
    },
    origin,
    visible: true,
  };
}

/**
 * Read a written file back the way the editor would.
 * @param written - The JCAMP text.
 * @returns The spectra, as the viewer would hold them.
 */
async function reread(written: string): Promise<IrSpectrum[]> {
  const { spectra } = await loadIrSpectra(written, { fileName: 'written.jdx' });
  return spectra.map((loaded) => toIrSpectrum(loaded));
}

/**
 * The one spectrum a written file was expected to hold.
 *
 * The unwrapping lives here rather than in each test, so no test body carries a
 * branch of its own — a test that can take either of two paths is two tests
 * wearing one name.
 * @param written - The JCAMP text.
 * @returns The spectrum.
 */
async function onlySpectrum(written: string): Promise<IrSpectrum> {
  const spectra = await reread(written);
  const spectrum = spectra[0];
  if (spectrum === undefined) throw new Error('nothing was read back');
  return spectrum;
}

test('a transmittance spectrum comes back on the axis it was written on', async () => {
  const original = spectrum('polystyrene', 'transmittance');
  const read = await onlySpectrum(irSpectrumToJcamp(original, 'absorbance'));

  expect(read.name).toBe('polystyrene');
  expect(read.origin.recorded).toBe('transmittance');
  expect(read.wavenumber).toHaveLength(200);
  expect(read.wavenumber[0]).toBe(400);
  expect(read.transmittance?.[0]).toBeCloseTo(95, 10);
  // The other axis is derived on the way back in, as it was on the way in.
  expect(read.absorbance?.[100]).toBeCloseTo(
    original.absorbance?.[100] as number,
    8,
  );
});

test('the axis being read is written when the file named none', async () => {
  const original = spectrum('pasted');
  const read = await onlySpectrum(irSpectrumToJcamp(original, 'absorbance'));

  expect(read.origin.recorded).toBe('absorbance');
  expect(read.absorbance?.[100]).toBeCloseTo(
    original.absorbance?.[100] as number,
    10,
  );
});

test('the records the panel shows are the records that are written', async () => {
  const read = await onlySpectrum(
    irSpectrumToJcamp(
      spectrum('polystyrene', 'transmittance'),
      'transmittance',
    ),
  );

  expect(read.meta?.fields).toStrictEqual([
    { label: 'Technique', value: 'INFRARED SPECTRUM' },
    { label: 'RESOLUTION', value: '4' },
  ]);
});

test('the whole list comes back from the one file it was written to', async () => {
  const written = irSpectraToJcamp(
    [
      spectrum('sample', 'transmittance'),
      spectrum('background', 'transmittance'),
    ],
    'transmittance',
  );

  expect(written).toContain('##BLOCKS=2');

  const read = await reread(written);

  expect(read.map((one) => one.name)).toStrictEqual(['sample', 'background']);
  expect(read.map((one) => one.origin.blockIndex)).toStrictEqual([0, 1]);
});

test('a one-spectrum list is written as that spectrum, not as a container', () => {
  const only = spectrum('alone', 'absorbance');

  expect(irSpectraToJcamp([only], 'absorbance')).toBe(
    irSpectrumToJcamp(only, 'absorbance'),
  );
});

/**
 * A Raman spectrum of three points, as a host reading a WDF hands it over.
 * @param name - What the list calls it.
 * @returns The spectrum.
 */
function ramanSpectrum(name: string): IrSpectrum {
  return {
    id: name,
    name,
    color: '#0072b2',
    wavenumber: Float64Array.from([150, 282, 1086]),
    intensity: Float64Array.from([12, 340, 2048.5]),
    meta: null,
    origin: { format: 'wdf' },
    visible: true,
  };
}

test('a Raman spectrum is written as its intensity, saying it is Raman', () => {
  expect(irSpectrumToJcamp(ramanSpectrum('calcite'), 'intensity')).toBe(
    `##TITLE=calcite
##JCAMP-DX=4.24
##DATA TYPE=RAMAN SPECTRUM
##ORIGIN=
##OWNER=
##XUNITS=1/CM
##YUNITS=INTENSITY
##NPOINTS=3
##FIRSTX=150
##LASTX=1086
##FIRSTY=12
##LASTY=2048.5
##XFACTOR=1
##YFACTOR=1
##PEAK TABLE=(XY..XY)
150 12
282 340
1086 2048.5
##END=`,
  );
});

test('a Raman spectrum asked for in an infrared axis still writes its intensity', () => {
  expect(irSpectrumToJcamp(ramanSpectrum('calcite'), 'transmittance')).toBe(
    irSpectrumToJcamp(ramanSpectrum('calcite'), 'intensity'),
  );
});

test('a list of Raman spectra is titled as Raman', () => {
  const written = irSpectraToJcamp(
    [ramanSpectrum('calcite'), ramanSpectrum('aragonite')],
    'intensity',
  );

  expect(written.split('\n').slice(0, 4)).toStrictEqual([
    '##TITLE=2 Raman spectra',
    '##JCAMP-DX=4.24',
    '##DATA TYPE=LINK',
    '##BLOCKS=2',
  ]);
  expect(written.match(/##DATA TYPE=RAMAN SPECTRUM/g)).toHaveLength(2);
});

test('a spectrum carrying no value axis is refused, by name', () => {
  const blank: IrSpectrum = {
    id: 'blank',
    name: 'blank',
    color: '#0072b2',
    wavenumber: Float64Array.from([150, 282]),
    meta: null,
    origin: { format: 'wdf' },
    visible: true,
  };

  expect(() => irSpectrumToJcamp(blank, 'intensity')).toThrow(
    'blank carries no value axis to write.',
  );
});
