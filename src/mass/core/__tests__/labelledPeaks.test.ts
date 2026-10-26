import { expect, test } from 'vitest';

import { selectLabelledPeaks } from '../labelledPeaks.ts';

import { peakListSpectrum } from './massFixtures.ts';

/** The window every test below reads: ten slots of ten m/z, close slots of two. */
const WINDOW = { from: 100, to: 200 } as const;

test('the tallest peak of each slot is named, in increasing m/z', () => {
  const spectrum = peakListSpectrum(
    'one',
    [100, 105, 150, 200],
    [100, 50, 80, 60],
  );

  expect(selectLabelledPeaks(spectrum, WINDOW)).toStrictEqual([
    { x: 100, y: 100, charge: 1, index: 0 },
    { x: 150, y: 80, charge: 1, index: 2 },
    { x: 200, y: 60, charge: 1, index: 3 },
  ]);
});

test('a peak crowding one already named is dropped rather than nudged', () => {
  const crowded = peakListSpectrum('one', [100, 105], [100, 50]);

  expect(selectLabelledPeaks(crowded, WINDOW)).toStrictEqual([
    { x: 100, y: 100, charge: 1, index: 0 },
  ]);
});

test('the charge established for a peak travels with it', () => {
  const spectrum = peakListSpectrum('one', [100, 150], [100, 80], {
    charge: [2, 0],
  });

  expect(selectLabelledPeaks(spectrum, WINDOW)).toStrictEqual([
    { x: 100, y: 100, charge: 2, index: 0 },
    { x: 150, y: 80, charge: 0, index: 1 },
  ]);
});

test('only the most intense peaks are named once the limit is reached', () => {
  const spectrum = peakListSpectrum('one', [100, 150, 200], [100, 80, 60]);

  expect(selectLabelledPeaks(spectrum, { ...WINDOW, limit: 2 })).toStrictEqual([
    { x: 100, y: 100, charge: 1, index: 0 },
    { x: 150, y: 80, charge: 1, index: 1 },
  ]);
});

test('a peak in the noise is left unnamed', () => {
  const spectrum = peakListSpectrum('one', [100, 150], [100, 0.5]);

  expect(selectLabelledPeaks(spectrum, WINDOW)).toStrictEqual([
    { x: 100, y: 100, charge: 1, index: 0 },
  ]);
});

test('a peak whose tip is above the window is left unnamed', () => {
  // Zooming into the baseline: the base peak runs off the top, and the
  // threshold then falls back on the tallest peak still on screen.
  const spectrum = peakListSpectrum('one', [100, 150, 200], [100, 8, 0.5]);

  expect(
    selectLabelledPeaks(spectrum, { ...WINDOW, maxValue: 10 }),
  ).toStrictEqual([
    { x: 150, y: 8, charge: 1, index: 1 },
    { x: 200, y: 0.5, charge: 1, index: 2 },
  ]);
});

test('peaks outside the window are not named', () => {
  const spectrum = peakListSpectrum('one', [100, 150, 400], [100, 80, 90]);

  expect(selectLabelledPeaks(spectrum, WINDOW)).toStrictEqual([
    { x: 100, y: 100, charge: 1, index: 0 },
    { x: 150, y: 80, charge: 1, index: 1 },
  ]);
});

test('a spectrum with no peaks names none', () => {
  expect(selectLabelledPeaks(peakListSpectrum('one', [], []))).toStrictEqual(
    [],
  );
});

test('room for no labels at all is not a window with no bounds', () => {
  const spectrum = peakListSpectrum('one', [100, 150], [100, 80]);

  expect(selectLabelledPeaks(spectrum, { ...WINDOW, limit: 0 })).toStrictEqual(
    [],
  );
});
