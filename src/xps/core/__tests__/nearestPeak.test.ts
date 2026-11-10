import { expect, test } from 'vitest';

import { chartScale } from '../../../chart/core/chartScale.ts';
import {
  PEAK_HIT_RADIUS,
  nearestPeakEnergy,
  sameNearestPeak,
} from '../nearestPeak.ts';

import { peakFixture, spectrumFixture } from './spectrumFixture.ts';

/** One pixel to the eV, drawn backwards as a binding-energy axis is. */
const xScale = chartScale(280, 300, 20, 0);

const carbon = spectrumFixture('carbon', {
  peaks: [peakFixture('main', 285, 1000), peakFixture('shifted', 288, 200)],
});

test('six pixels is how near the pointer has to be', () => {
  expect(PEAK_HIT_RADIUS).toBe(6);
});

test('the pointer is on the peak it is nearest to', () => {
  // 285 eV sits at 15 pixels on an axis running from 300 on the left.
  const found = nearestPeakEnergy([carbon], 'binding', xScale, 15);

  expect(found?.spectrumId).toBe('carbon');
  expect(found?.peak.id).toBe('main');
  expect(found?.energy).toBe(285);
});

test('the whole column above a peak is reachable, whatever its height', () => {
  const faint = nearestPeakEnergy([carbon], 'binding', xScale, 12);

  expect(faint?.peak.id).toBe('shifted');
});

test('a pointer further away than the radius is on nothing', () => {
  expect(nearestPeakEnergy([carbon], 'binding', xScale, 4)).toBeNull();
});

test('a peak exactly the radius away misses', () => {
  const alone = spectrumFixture('alone', {
    peaks: [peakFixture('main', 285, 1000)],
  });

  expect(nearestPeakEnergy([alone], 'binding', xScale, 9.5)?.peak.id).toBe(
    'main',
  );
  expect(nearestPeakEnergy([alone], 'binding', xScale, 9)).toBeNull();
});

test('the peaks are placed on whichever axis the chart is drawn on', () => {
  const kineticScale = chartScale(700, 720, 0, 20);
  const found = nearestPeakEnergy([carbon], 'kinetic', kineticScale, 15);

  expect(found?.peak.id).toBe('main');
  expect(found?.energy).toBe(715);
});

test('a hidden spectrum cannot be pointed at', () => {
  const hidden = spectrumFixture('hidden', {
    visible: false,
    peaks: [peakFixture('main', 285, 1000)],
  });

  expect(nearestPeakEnergy([hidden], 'binding', xScale, 15)).toBeNull();
});

test('a previewed reference is still interrogable', () => {
  const preview = spectrumFixture('preview', {
    excludeFromDomain: true,
    peaks: [peakFixture('reference', 285, 1000)],
  });

  expect(nearestPeakEnergy([preview], 'binding', xScale, 15)?.peak.id).toBe(
    'reference',
  );
});

test('the nearest of two spectra wins, not the first', () => {
  const other = spectrumFixture('oxide', {
    peaks: [peakFixture('oxidised', 286, 500)],
  });
  const found = nearestPeakEnergy([carbon, other], 'binding', xScale, 14);

  expect(found?.spectrumId).toBe('oxide');
  expect(found?.peak.id).toBe('oxidised');
});

test('a spectrum whose detection found nothing is passed over', () => {
  expect(
    nearestPeakEnergy([spectrumFixture('a')], 'binding', xScale, 15),
  ).toBeNull();
});

test('two peaks at the same energy in two spectra are not one peak', () => {
  const first = nearestPeakEnergy([carbon], 'binding', xScale, 15);
  const other = spectrumFixture('second', {
    peaks: [peakFixture('main', 285, 900)],
  });
  const second = nearestPeakEnergy([other], 'binding', xScale, 15);

  expect(first?.peak.id).toBe(second?.peak.id);
  expect(sameNearestPeak(first, second)).toBe(false);
  expect(sameNearestPeak(first, first)).toBe(true);
  expect(sameNearestPeak(null, null)).toBe(true);
  expect(sameNearestPeak(first, null)).toBe(false);
});
