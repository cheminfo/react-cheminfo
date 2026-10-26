import { expect, test } from 'vitest';

import { fittedTo, fullDomain } from '../massDomain.ts';
import type { MassSpectrum } from '../massSpectrum.ts';

test('the window covers the peaks with air either side and room above', () => {
  const spectrum = centroided('a', [100, 200, 300], [10, 50, 20]);

  expect(fullDomain([spectrum])).toStrictEqual({
    x: [96, 304],
    y: [0, 60],
  });
});

test('a profile and a centroid of one spectrum are covered together', () => {
  const spectrum = centroided('a', [200, 300], [10, 20]);
  spectrum.profile = {
    x: Float64Array.from([100, 400]),
    y: Float64Array.from([5, 80]),
  };
  spectrum.showProfile = true;

  expect(fullDomain([spectrum])).toStrictEqual({ x: [94, 406], y: [0, 96] });
});

test('a trace nobody asked to see does not move the axes', () => {
  const shown = centroided('a', [100, 200], [10, 50]);
  const hidden = centroided('b', [1000, 2000], [10, 500]);
  hidden.showCentroid = false;

  expect(fullDomain([shown, hidden])).toStrictEqual({
    x: [98, 202],
    y: [0, 60],
  });
});

test('a previewed distribution is left out of the window', () => {
  const measured = centroided('a', [100, 200], [10, 50]);
  const preview = centroided('preview', [1000, 2000], [10, 500]);
  preview.excludeFromDomain = true;

  expect(fullDomain([measured, preview])).toStrictEqual({
    x: [98, 202],
    y: [0, 60],
  });
});

test('a previewed distribution alone is shown rather than nothing', () => {
  const preview = centroided('preview', [1000, 2000], [10, 500]);
  preview.excludeFromDomain = true;

  expect(fullDomain([preview])).toStrictEqual({ x: [980, 2020], y: [0, 600] });
});

test('the mirrored half is the reflection of the drawn one', () => {
  const top = centroided('a', [100, 200], [10, 50]);
  const bottom = centroided('b', [150, 300], [40, 20]);

  expect(fullDomain([top, bottom], true)).toStrictEqual({
    x: [96, 304],
    y: [-60, 60],
  });
});

test('a spectrum of one peak is given a window to sit in', () => {
  expect(fullDomain([centroided('a', [500.25], [1000])])).toStrictEqual({
    x: [499.25, 501.25],
    y: [0, 1200],
  });
});

test('a spectrum of nothing but zeros keeps a usable intensity axis', () => {
  expect(fullDomain([centroided('a', [100, 200], [0, 0])])).toStrictEqual({
    x: [98, 202],
    y: [0, 1],
  });
});

test('a spectrum whose peak picking found nothing does not collapse the window', () => {
  const measured = centroided('a', [100, 200], [10, 50]);
  const nothingPicked = centroided('b', [], []);

  expect(fullDomain([nothingPicked, measured])).toStrictEqual({
    x: [98, 202],
    y: [0, 60],
  });
  expect(fullDomain([nothingPicked])).toStrictEqual({ x: [0, 1], y: [0, 1] });
});

test('an empty chart still has a window', () => {
  expect(fullDomain([])).toStrictEqual({ x: [0, 1], y: [0, 1] });
  expect(fullDomain([], true)).toStrictEqual({ x: [0, 1], y: [0, 1] });
});

test('a spectrum with nothing drawn is an empty chart', () => {
  const spectrum = centroided('a', [100, 200], [10, 50]);
  spectrum.showCentroid = false;

  expect(fullDomain([spectrum])).toStrictEqual({ x: [0, 1], y: [0, 1] });
});

test('the same spectra drawn differently were fitted to the same thing', () => {
  const sticks = centroided('a', [100, 200], [10, 50]);
  const profiled = centroided('a', [100, 200], [10, 50]);
  profiled.profile = {
    x: Float64Array.from([90, 210]),
    y: Float64Array.from([1, 60]),
  };
  profiled.showProfile = true;
  profiled.showCentroid = false;
  const off = centroided('a', [100, 200], [10, 50]);
  off.showCentroid = false;

  expect(fittedTo([profiled])).toBe(fittedTo([sticks]));
  expect(fittedTo([off])).toBe(fittedTo([sticks]));
  // …and the two windows really do differ, which is what would move the chart.
  expect(fullDomain([profiled])).not.toStrictEqual(fullDomain([sticks]));
});

test('a spectrum loaded, one closed and the mirror are each a different fit', () => {
  const first = centroided('a', [100, 200], [10, 50]);
  const second = centroided('b', [300, 400], [20, 30]);

  expect(fittedTo([first, second])).not.toBe(fittedTo([first]));
  expect(fittedTo([first])).not.toBe(fittedTo([]));
  expect(fittedTo([first], true)).not.toBe(fittedTo([first]));
});

test('a previewed distribution is left out of the fit as it is out of the window', () => {
  const measured = centroided('a', [100, 200], [10, 50]);
  const preview = centroided('preview', [1000, 2000], [10, 500]);
  preview.excludeFromDomain = true;

  expect(fittedTo([measured, preview])).toBe(fittedTo([measured]));
});

/**
 * A centroided spectrum, which is what most files hand over.
 * @param id - Its identity.
 * @param mz - The m/z of each peak, ascending.
 * @param intensity - The intensity of each.
 * @returns The spectrum, with its centroid drawn and no profile.
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
