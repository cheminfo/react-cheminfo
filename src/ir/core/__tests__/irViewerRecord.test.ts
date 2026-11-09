import { expect, test } from 'vitest';

import {
  packFigureValue,
  unpackFigureValue,
} from '../../../download/core/figurePacking.ts';
import type { IrSpectrum } from '../irSpectrum.ts';
import { createIrState, mergeIrSettings } from '../irState.ts';
import { irViewerRecord, readIrViewerRecord } from '../irViewerRecord.ts';

const FILM: IrSpectrum = {
  id: 'film',
  name: 'Polystyrene film',
  color: '#0072b2',
  wavenumber: Float64Array.from([400, 1000, 2000]),
  absorbance: Float64Array.from([0.1, Number.POSITIVE_INFINITY, 0.2]),
  transmittance: Float64Array.from([79.4, 0, 63.1]),
  meta: { title: 'PS', fields: [{ label: 'Resolution', value: '4 cm-1' }] },
  origin: { format: 'jcamp', fileName: 'ps.jdx', recorded: 'transmittance' },
  visible: true,
  bands: [
    {
      spectrumId: 'film',
      wavenumber: 1000,
      absorbance: 2,
      transmittance: 1,
      strength: 'S',
    },
  ],
  bandsByHand: true,
};

test('a viewer state survives being written down and read back', async () => {
  const opened = createIrState({
    spectra: [FILM],
    settings: { mode: 'absorbance', labelLimit: 5 },
  });
  const state = {
    ...opened,
    view: { ...opened.view, domain: { x: [900, 1100], y: [0, 1.5] } },
  } satisfies typeof opened;

  const packed = await packFigureValue(irViewerRecord(state));
  const read = readIrViewerRecord(await unpackFigureValue(packed));

  expect(read.view).toStrictEqual({
    selectedId: 'film',
    domain: { x: [900, 1100], y: [0, 1.5] },
  });
  expect(read.settings).toStrictEqual({
    technique: 'infrared',
    mode: 'absorbance',
    pickBands: true,
    showAssignments: false,
    labelLimit: 5,
    assignmentTolerance: 5,
    picking: { minRelativeHeight: 0.02, minPeakWidth: 4 },
  });

  const [spectrum] = read.data?.spectra ?? [];

  expect(spectrum?.name).toBe('Polystyrene film');
  expect(spectrum?.wavenumber).toStrictEqual(
    Float64Array.from([400, 1000, 2000]),
  );
  // Infinity has no JSON spelling: it comes back as NaN, skipped alike.
  expect(spectrum?.absorbance).toStrictEqual(
    Float64Array.from([0.1, Number.NaN, 0.2]),
  );
  expect(spectrum?.transmittance).toStrictEqual(
    Float64Array.from([79.4, 0, 63.1]),
  );
  expect(spectrum?.intensity).toBeUndefined();
  expect(spectrum?.bands).toStrictEqual(FILM.bands);
  expect(spectrum?.bandsByHand).toBe(true);
  expect(spectrum?.meta).toStrictEqual(FILM.meta);
  expect(spectrum?.origin).toStrictEqual(FILM.origin);
});

test('what is read back opens in a viewer of its technique', () => {
  const record = irViewerRecord(createIrState({ spectra: [FILM] }));
  const read = readIrViewerRecord(record);
  const raman = createIrState({ settings: { technique: 'raman' } });

  // A viewer's technique is fixed: an infrared mode is refused by a Raman one.
  expect(mergeIrSettings(raman.settings, read.settings).technique).toBe(
    'raman',
  );
  expect(mergeIrSettings(raman.settings, read.settings).mode).toBe('intensity');
});

test('a record that does not hold together is refused whole', () => {
  expect(() => readIrViewerRecord(null)).toThrow(
    'This holds no spectra to open.',
  );
  expect(() =>
    readIrViewerRecord({ spectra: [{ id: 'a', name: 'a', color: '#000' }] }),
  ).toThrow('A spectrum of this record does not hold together.');
  expect(() =>
    readIrViewerRecord({
      spectra: [
        {
          id: 'a',
          name: 'a',
          color: '#000',
          wavenumber: [1, 2],
          absorbance: [0.1],
        },
      ],
    }),
  ).toThrow('A spectrum of this record does not hold together.');
  expect(() =>
    readIrViewerRecord({
      spectra: [{ id: 'a', name: 'a', color: '#000', wavenumber: [1, 'x'] }],
    }),
  ).toThrow('A spectrum of this record holds something not a number.');
});

test('what a record says beyond a spectrum is taken only when it reads', () => {
  const read = readIrViewerRecord({
    spectra: [
      {
        id: 'a',
        name: 'a',
        color: '#000',
        wavenumber: [1, 2],
        intensity: [3, 4],
        origin: { format: 'mystery', blockIndex: 1.5 },
        bands: [{ wavenumber: 1, strength: 'huge' }, 'nothing'],
      },
    ],
    selectedId: 'gone',
    domain: { x: [5, 1], y: [0, 1] },
    settings: { technique: 'uv', mode: 'colour', labelLimit: 'many' },
  });

  expect(read.view).toStrictEqual({ selectedId: 'a', domain: null });
  expect(read.settings).toStrictEqual({});

  const [spectrum] = read.data?.spectra ?? [];

  expect(spectrum?.origin).toStrictEqual({ format: 'text' });
  expect(spectrum?.bands).toStrictEqual([]);
  expect(spectrum?.visible).toBe(true);
  expect(spectrum?.meta).toBeNull();
});
