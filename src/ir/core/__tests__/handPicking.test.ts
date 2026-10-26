import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import {
  addBand,
  editBandsAt,
  pickBandAt,
  removeBand,
} from '../handPicking.ts';
import type { IrBand } from '../irBand.ts';
import type { IrSpectrum } from '../irSpectrum.ts';
import { loadIrSpectra } from '../loadIrSpectra.ts';
import { toIrSpectrum } from '../toIrSpectrum.ts';

import { calciteSpectrum } from './ramanFixture.ts';

/**
 * The five-band film, read through the real reader, under a known id.
 * @returns The spectrum.
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

/** The carbonyl of the film, as automatic picking reports it. */
const CARBONYL: IrBand = {
  spectrumId: 'film',
  wavenumber: 1708,
  absorbance: 0.5915400684472172,
  transmittance: 25.61296945345416,
  strength: 'S',
};

/**
 * A band of nothing but a wavenumber.
 * @param wavenumber - Where it sits.
 * @returns The band.
 */
function at(wavenumber: number): IrBand {
  return { spectrumId: 's', wavenumber, strength: 'w' };
}

test('a click on either flank of a band picks its top, read as automatic picking reads it', async () => {
  const spectrum = await film();

  expect(pickBandAt(spectrum, 1700, 8)).toStrictEqual(CARBONYL);
  expect(pickBandAt(spectrum, 1730, 8)).toStrictEqual(CARBONYL);
});

test('a click on a mark takes its band away, and anywhere else adds the band under it', async () => {
  const spectrum: IrSpectrum = { ...(await film()), bands: [] };

  const picked = editBandsAt(spectrum, 1730, 8);

  expect(picked).toStrictEqual([CARBONYL]);
  expect(
    editBandsAt({ ...spectrum, bands: picked }, 2950, 8).map(
      (band) => band.wavenumber,
    ),
  ).toStrictEqual([1708, 2948]);
  expect(editBandsAt({ ...spectrum, bands: picked }, 1712, 8)).toStrictEqual(
    [],
  );
});

test('a Raman band is picked on its intensity, and a flat stretch gives none', () => {
  const calcite = calciteSpectrum();

  expect(pickBandAt(calcite, 1010, 8)).toStrictEqual({
    spectrumId: 'calcite',
    wavenumber: 1000,
    intensity: 5100,
    strength: 'S',
  });
  expect(pickBandAt(calcite, 1300, 8)).toBeNull();
});

test('a spectrum with no axis a band is a maximum of gives no band', async () => {
  const { id, name, color, wavenumber, transmittance, meta, origin } =
    await film();
  const transmittanceOnly: IrSpectrum = {
    id,
    name,
    color,
    wavenumber,
    ...(transmittance === undefined ? {} : { transmittance }),
    meta,
    origin,
    visible: true,
  };

  expect(pickBandAt(transmittanceOnly, 1708, 8)).toBeNull();
});

test('a band is put in its place, once, and taken away only from where it is', () => {
  const bands = [at(1000), at(2000)];

  expect(addBand(bands, at(1500)).map((band) => band.wavenumber)).toStrictEqual(
    [1000, 1500, 2000],
  );
  expect(addBand(bands, at(3000)).map((band) => band.wavenumber)).toStrictEqual(
    [1000, 2000, 3000],
  );
  expect(addBand(bands, at(2000))).toBe(bands);
  expect(removeBand(bands, 1000)).toStrictEqual([at(2000)]);
  expect(removeBand(bands, 1500)).toBe(bands);
});
