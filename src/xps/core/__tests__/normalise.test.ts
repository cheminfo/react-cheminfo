import { expect, test } from 'vitest';

import {
  chartPixel,
  chartScale,
  chartValue,
} from '../../../chart/core/chartScale.ts';
import {
  NORMALISED_MAXIMUM,
  normalisationFactor,
  normalisedScale,
  windowMaximum,
} from '../normalise.ts';

const energy = [280, 285, 290];
const counts = [100, 500, 200];

test('the tallest count inside the window is the one that is found', () => {
  expect(windowMaximum(energy, counts, 279, 291)).toBe(500);
  expect(windowMaximum(energy, counts, 286, 291)).toBe(200);
  expect(windowMaximum(energy, counts, 285, 285)).toBe(500);
  expect(NORMALISED_MAXIMUM).toBe(100);
});

test('a kinetic trace runs the other way and is still scanned', () => {
  const kinetic = [720, 715, 710];

  expect(windowMaximum(kinetic, counts, 712, 718)).toBe(500);
  expect(windowMaximum(kinetic, counts, 705, 712)).toBe(200);
});

test('a window holding nothing has no maximum to normalise against', () => {
  expect(windowMaximum(energy, counts, 400, 500)).toBe(0);
  expect(windowMaximum([], [], 0, 1000)).toBe(0);
});

test('a trace is scaled so its tallest peak in the window reads a hundred', () => {
  expect(normalisationFactor(energy, counts, 279, 291)).toBe(0.2);
  expect(normalisationFactor(energy, counts, 286, 291)).toBe(0.5);
});

test('a window with nothing in it is left as it was measured', () => {
  expect(normalisationFactor(energy, counts, 400, 500)).toBe(1);
  expect(normalisationFactor(energy, [0, 0, 0], 279, 291)).toBe(1);
});

test('a scale that changes nothing is the very scale it was given', () => {
  const yScale = chartScale(0, 1000, 400, 0);

  expect(normalisedScale(yScale, 1)).toBe(yScale);
});

test('a normalised scale draws a trace against its own maximum', () => {
  const yScale = chartScale(0, 110, 400, 0);
  const scaled = normalisedScale(yScale, 0.2);

  // 500 counts is this trace's maximum, so it is drawn at a hundred.
  expect(chartPixel(scaled, 500)).toBe(chartPixel(yScale, 100));
  expect(chartPixel(scaled, 250)).toBe(chartPixel(yScale, 50));
  expect(chartValue(scaled, chartPixel(yScale, 100))).toBeCloseTo(500, 9);
});
