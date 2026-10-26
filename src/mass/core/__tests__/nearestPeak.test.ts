import { expect, test } from 'vitest';

import { chartScale } from '../../../chart/core/chartScale.ts';
import type { MassSpectrum } from '../massSpectrum.ts';
import { PEAK_HIT_RADIUS, nearestPeakMz, peakAtMz } from '../nearestPeak.ts';

/** One pixel to one m/z unit, which keeps every distance readable. */
const xScale = chartScale(0, 400, 0, 400);

test('the pointer is on the stick it is nearest to', () => {
  const spectra = [centroided('a', [100, 200, 300], [10, 50, 20])];

  expect(nearestPeakMz(spectra, xScale, 201)).toStrictEqual({
    spectrumId: 'a',
    index: 1,
    mz: 200,
    intensity: 50,
  });
});

test('the whole column above a stick is on it', () => {
  const spectra = [centroided('a', [100, 200, 300], [1, 50, 20])];
  const low = nearestPeakMz(spectra, xScale, 100);

  expect(low).toStrictEqual({
    spectrumId: 'a',
    index: 0,
    mz: 100,
    intensity: 1,
  });
});

test('nothing is on the pointer halfway between two peaks', () => {
  const spectra = [centroided('a', [100, 200, 300], [10, 50, 20])];

  expect(nearestPeakMz(spectra, xScale, 250)).toBeNull();
});

test('the hit radius is the last pixel that counts', () => {
  const spectra = [centroided('a', [200], [50])];

  expect(nearestPeakMz(spectra, xScale, 205.9)?.mz).toBe(200);
  expect(nearestPeakMz(spectra, xScale, 206)).toBeNull();
  expect(PEAK_HIT_RADIUS).toBe(6);
});

test('a narrower radius may be asked for', () => {
  const spectra = [centroided('a', [200], [50])];

  expect(nearestPeakMz(spectra, xScale, 203, 2)).toBeNull();
  expect(nearestPeakMz(spectra, xScale, 201, 2)?.index).toBe(0);
});

test('the nearer of two spectra answers', () => {
  const spectra = [centroided('a', [200], [50]), centroided('b', [203], [30])];

  expect(nearestPeakMz(spectra, xScale, 202)).toStrictEqual({
    spectrumId: 'b',
    index: 0,
    mz: 203,
    intensity: 30,
  });
});

test('a spectrum that is off the chart cannot be pointed at', () => {
  const hidden = centroided('a', [200], [50]);
  hidden.showCentroid = false;

  expect(nearestPeakMz([hidden], xScale, 200)).toBeNull();
});

test('a spectrum shown as its profile answers with its picked peaks', () => {
  const profiled = centroided('a', [200], [50]);
  profiled.showCentroid = false;
  profiled.showProfile = true;

  expect(nearestPeakMz([profiled], xScale, 200)).toStrictEqual({
    spectrumId: 'a',
    index: 0,
    mz: 200,
    intensity: 50,
  });
});

test('a previewed distribution is still hit-tested', () => {
  const preview = centroided('preview', [200], [50]);
  preview.excludeFromDomain = true;

  expect(nearestPeakMz([preview], xScale, 200)?.spectrumId).toBe('preview');
});

test('a spectrum holding no peak is skipped rather than answered for', () => {
  expect(nearestPeakMz([centroided('a', [], [])], xScale, 200)).toBeNull();
  expect(nearestPeakMz([], xScale, 200)).toBeNull();
});

test('a zoomed axis moves the target with the peaks', () => {
  const zoomed = chartScale(199.9, 200.1, 0, 400);
  const spectra = [centroided('a', [199.95, 200.05], [10, 50])];

  expect(nearestPeakMz(spectra, zoomed, 105)).toStrictEqual({
    spectrumId: 'a',
    index: 0,
    mz: 199.95,
    intensity: 10,
  });
  expect(nearestPeakMz(spectra, zoomed, 200)).toBeNull();
});

test('a click is answered by the peak it landed on, given its m/z', () => {
  const spectra = [centroided('a', [100, 200, 300], [10, 50, 20])];

  expect(peakAtMz(spectra, xScale, 201)).toStrictEqual({
    spectrumId: 'a',
    index: 1,
    mz: 200,
    intensity: 50,
  });
  expect(peakAtMz(spectra, xScale, 250)).toBeNull();
});

test('the reach of a click stays six pixels however the axis is zoomed', () => {
  const spectra = [centroided('a', [200], [50])];
  // Two hundredths of an m/z per pixel, so six pixels is 0.12 — where on the
  // unzoomed axis beside it the very same gesture reaches six whole units.
  const zoomed = chartScale(196, 204, 0, 400);

  expect(peakAtMz(spectra, zoomed, 200.1)?.mz).toBe(200);
  expect(peakAtMz(spectra, zoomed, 200.2)).toBeNull();
  expect(peakAtMz(spectra, xScale, 205)?.mz).toBe(200);
});

/**
 * A centroided spectrum, which is what a hit test is run over.
 * @param id - Its identity.
 * @param mz - The m/z of each peak, ascending.
 * @param intensity - The intensity of each.
 * @returns The spectrum, with its centroid drawn.
 */
function centroided(
  id: string,
  mz: number[],
  intensity: number[],
): MassSpectrum {
  return {
    id,
    name: id,
    color: '#000000',
    profile: null,
    centroid: {
      x: Float64Array.from(mz),
      y: Float64Array.from(intensity),
      charge: new Int16Array(mz.length),
    },
    meta: null,
    origin: { format: 'text' },
    showProfile: false,
    showCentroid: true,
  };
}
