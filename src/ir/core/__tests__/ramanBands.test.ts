import { expect, test } from 'vitest';

import { pickBands } from '../pickBands.ts';

import { calciteSpectrum as threeBands } from './ramanFixture.ts';

test('a Raman band is a maximum of intensity, strong to weak by its height', () => {
  // The strength is where the top sits between the lowest count, 100, and the
  // highest, 5100: all the way, three fifths of the way, a fifth of the way.
  expect(pickBands(threeBands())).toStrictEqual([
    { spectrumId: 'calcite', wavenumber: 1000, intensity: 5100, strength: 'S' },
    { spectrumId: 'calcite', wavenumber: 1600, intensity: 3100, strength: 'm' },
    { spectrumId: 'calcite', wavenumber: 2900, intensity: 1100, strength: 'w' },
  ]);
});

test('a limit keeps the tallest Raman bands', () => {
  expect(pickBands(threeBands(), { limit: 2 })).toStrictEqual([
    { spectrumId: 'calcite', wavenumber: 1000, intensity: 5100, strength: 'S' },
    { spectrumId: 'calcite', wavenumber: 1600, intensity: 3100, strength: 'm' },
  ]);
});

test('a window keeps only the Raman bands inside it', () => {
  expect(pickBands(threeBands(), { from: 1200, to: 2000 })).toStrictEqual([
    { spectrumId: 'calcite', wavenumber: 1600, intensity: 3100, strength: 'm' },
  ]);
});

test('the threshold is a fraction of the tallest Raman band, as in infrared', () => {
  // The 2900 band rises a fifth of the way from the lowest count to the highest,
  // so a threshold of 0.3 of that range drops it.
  const bands = pickBands(threeBands(), { minRelativeHeight: 0.3 });

  expect(bands.map((picked) => picked.wavenumber)).toStrictEqual([1000, 1600]);
});
