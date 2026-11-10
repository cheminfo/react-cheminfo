import { expect, test } from 'vitest';

import { selectLabelledPeaks } from '../labelledPeaks.ts';

import { peakFixture } from './spectrumFixture.ts';

/** A carbon envelope, its main line flanked by two shoulders and a satellite. */
const peaks = [
  peakFixture('a', 284.8, 1000),
  peakFixture('b', 286.2, 400),
  peakFixture('c', 288.7, 150),
  peakFixture('d', 291.5, 60),
];

test('the most intense peaks are named, and named in energy order', () => {
  const chosen = selectLabelledPeaks(peaks, { limit: 2 });

  expect(chosen.map((peak) => peak.id)).toStrictEqual(['a', 'b']);
});

test('naming more than there are peaks names all of them', () => {
  const chosen = selectLabelledPeaks(peaks, { limit: 10 });

  expect(chosen.map((peak) => peak.id)).toStrictEqual(['a', 'b', 'c', 'd']);
});

test('room for no labels names nothing', () => {
  expect(selectLabelledPeaks(peaks, { limit: 0 })).toStrictEqual([]);
  expect(selectLabelledPeaks(peaks, { limit: -1 })).toStrictEqual([]);
});

test('only the peaks inside the window are candidates', () => {
  const chosen = selectLabelledPeaks(peaks, {
    from: 286,
    to: 290,
    limit: 10,
  });

  expect(chosen.map((peak) => peak.id)).toStrictEqual(['b', 'c']);
});

test('a window given backwards holds the same peaks', () => {
  const backwards = selectLabelledPeaks(peaks, {
    from: 290,
    to: 286,
    limit: 10,
  });

  expect(backwards.map((peak) => peak.id)).toStrictEqual(['b', 'c']);
});

test('a peak too near a stronger one already named is dropped', () => {
  // Three eV of spacing keeps 284.8 and 286.2 apart from one another.
  const chosen = selectLabelledPeaks(peaks, {
    limit: 10,
    minimumSpacing: 3,
  });

  expect(chosen.map((peak) => peak.id)).toStrictEqual(['a', 'c']);
});

test('the same peaks zoomed into are all named again', () => {
  const chosen = selectLabelledPeaks(peaks, {
    limit: 10,
    minimumSpacing: 0.2,
  });

  expect(chosen.map((peak) => peak.id)).toStrictEqual(['a', 'b', 'c', 'd']);
});

test('a peak whose tip is off the top of the plot is not named there', () => {
  const chosen = selectLabelledPeaks(peaks, {
    limit: 10,
    maximumIntensity: 500,
  });

  expect(chosen.map((peak) => peak.id)).toStrictEqual(['b', 'c', 'd']);
});

test('two peaks of the same height are chosen the same way every render', () => {
  const tied = [
    peakFixture('high', 290, 100),
    peakFixture('low', 280, 100),
    peakFixture('other', 285, 50),
  ];

  expect(
    selectLabelledPeaks(tied, { limit: 1 }).map((peak) => peak.id),
  ).toStrictEqual(['low']);
});

test('a spectrum whose detection found nothing names nothing', () => {
  expect(selectLabelledPeaks([], { limit: 10 })).toStrictEqual([]);
});

test('the peaks come back as they were given, never as copies', () => {
  const chosen = selectLabelledPeaks(peaks, { limit: 1 });

  expect(chosen[0]).toBe(peaks[0]);
});
