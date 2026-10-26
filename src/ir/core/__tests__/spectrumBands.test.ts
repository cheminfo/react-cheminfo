import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import type { IrBand } from '../irBand.ts';
import { irReducer } from '../irReducer.ts';
import type { IrSpectrum } from '../irSpectrum.ts';
import { createIrState } from '../irState.ts';
import { loadIrSpectra } from '../loadIrSpectra.ts';
import { orderedBands } from '../spectrumBands.ts';
import { toIrSpectrum } from '../toIrSpectrum.ts';

/**
 * The five-band film, read through the real reader, under a known id.
 * @returns The spectrum, with no bands yet.
 */
async function film(): Promise<IrSpectrum> {
  const { spectra } = await loadIrSpectra(
    readFileSync(join(import.meta.dirname, 'data/five-bands.jdx')),
    { fileName: 'five-bands.jdx' },
  );
  const [loaded] = spectra;
  if (loaded === undefined) throw new Error('The fixture holds no spectrum');
  return toIrSpectrum(loaded, { id: 'film' });
}

/**
 * Where the bands of the first spectrum sit.
 * @param spectra - The spectra open.
 * @returns The wavenumbers.
 */
function bandsOf(spectra: readonly IrSpectrum[]): number[] | undefined {
  return spectra[0]?.bands?.map((band) => band.wavenumber);
}

test('a spectrum arriving without bands is picked, with the settings in force', async () => {
  const state = createIrState({ spectra: [await film()] });

  expect(bandsOf(state.data.spectra)).toStrictEqual([
    1048, 1600, 1708, 2948, 3328,
  ]);
  expect(state.data.spectra[0]?.bandsByHand).toBe(false);
});

test('the threshold picks automatic bands again, and leaves hand-picked ones alone', async () => {
  const spectrum = await film();
  const handPicked: IrSpectrum = {
    ...spectrum,
    id: 'hand',
    bands: [{ spectrumId: 'hand', wavenumber: 1600, strength: 'm' }],
    bandsByHand: true,
  };
  const state = createIrState({ spectra: [spectrum, handPicked] });

  const raised = irReducer(state, {
    type: 'setSettings',
    settings: { picking: { minRelativeHeight: 0.3 } },
  });

  expect(bandsOf(raised.data.spectra)).toStrictEqual([1048, 1708, 2948, 3328]);
  expect(raised.data.spectra[1]).toBe(state.data.spectra[1]);
  // The same threshold again picks nothing again.
  expect(
    irReducer(raised, {
      type: 'setSettings',
      settings: { picking: { minRelativeHeight: 0.3 } },
    }).data,
  ).toBe(raised.data);
});

test('bands set by hand are kept in order, and found automatically again on asking', async () => {
  const state = createIrState({ spectra: [await film()] });
  const bands: IrBand[] = [
    { spectrumId: 'film', wavenumber: 2948, strength: 'm' },
    { spectrumId: 'other', wavenumber: 1708, strength: 'S' },
    { spectrumId: 'film', wavenumber: 2948, strength: 'm' },
  ];

  const edited = irReducer(state, { type: 'setBands', id: 'film', bands });

  expect(edited.data.spectra[0]?.bands).toStrictEqual([
    { spectrumId: 'film', wavenumber: 1708, strength: 'S' },
    { spectrumId: 'film', wavenumber: 2948, strength: 'm' },
  ]);
  expect(edited.data.spectra[0]?.bandsByHand).toBe(true);

  const reset = irReducer(edited, { type: 'resetBands', id: 'film' });

  expect(bandsOf(reset.data.spectra)).toStrictEqual(
    bandsOf(state.data.spectra),
  );
  expect(reset.data.spectra[0]?.bandsByHand).toBe(false);
  expect(irReducer(reset, { type: 'resetBands', id: 'film' })).toBe(reset);
});

test('a spectrum too short to smooth is opened with no band', () => {
  const state = createIrState({
    spectra: [
      {
        id: 'typed',
        name: 'typed',
        color: '#000000',
        wavenumber: Float64Array.from([100, 200, 300]),
        intensity: Float64Array.from([5, 80, 12]),
        meta: null,
        origin: { format: 'text' },
        visible: true,
      },
    ],
    settings: { technique: 'raman' },
  });

  expect(state.data.spectra[0]?.bands).toStrictEqual([]);
});

test('bands already in order are kept as the very same list', () => {
  const bands: IrBand[] = [
    { spectrumId: 'a', wavenumber: 1000, strength: 'w' },
    { spectrumId: 'a', wavenumber: 2000, strength: 'S' },
  ];

  expect(orderedBands('a', bands)).toBe(bands);
  expect(orderedBands('b', bands)[0]?.spectrumId).toBe('b');
});
