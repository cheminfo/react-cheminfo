import { expect, test } from 'vitest';

import {
  intensitySpan,
  peakProminence,
  summitIndex,
} from '../peakProminence.ts';

test('a summit is found from anywhere on its own slope', () => {
  const counts = Float64Array.from([0, 1, 4, 9, 3, 1, 0]);

  expect(summitIndex(counts, 3)).toBe(3);
  expect(summitIndex(counts, 1)).toBe(3);
  expect(summitIndex(counts, 5)).toBe(3);
});

test('the climb stays on its own peak rather than crossing to a taller one', () => {
  const counts = Float64Array.from([0, 5, 0, 1, 20, 1, 0]);

  // Starting on the small peak reaches the small peak, not the tall one over
  // the valley beside it — two lines a few points apart are two peaks.
  expect(summitIndex(counts, 1)).toBe(1);
  expect(summitIndex(counts, 4)).toBe(4);
});

test('an index off the end of the array is clamped onto it', () => {
  const counts = Float64Array.from([3, 2, 1]);

  expect(summitIndex(counts, -5)).toBe(0);
  expect(summitIndex(counts, 99)).toBe(0);
});

test('prominence is the drop to the higher of the two valleys', () => {
  //                                0   1  2   3  4  5
  const counts = Float64Array.from([0, 20, 5, 10, 4, 0]);

  // The summit at index 3 is bounded on its left by the taller peak at index 1,
  // so that walk stops at the col of 5; on its right nothing is taller and the
  // walk runs to the end, reaching 0. The higher col is 5, and the peak stands
  // 5 above it.
  expect(peakProminence(counts, 3)).toBe(5);
});

test('the tallest peak of all is prominent above the lowest point of the trace', () => {
  // Nothing bounds it on either side, so both walks run to the ends: this is
  // the definition doing what it should, not a special case.
  const counts = Float64Array.from([3, 6, 2, 10, 4, 8, 1]);

  // Both walks run to the ends, reaching 2 on the left and 1 on the right; the
  // higher of the two is 2, so the peak stands 8 above it.
  expect(peakProminence(counts, 3)).toBe(8);
});

test('prominence is measured from the summit even when the index is beside it', () => {
  // The failure this pins: `ml-gsd` reports the index where its derivative
  // crossed zero, which on a line three points wide is the neighbour of the
  // tallest sample. Anchored there, the walk terminates against the summit one
  // step away and reports nothing.
  const counts = Float64Array.from([10, 12, 100, 80, 15, 11, 10]);

  expect(peakProminence(counts, 3)).toBe(90);
  expect(peakProminence(counts, 2)).toBe(90);
});

test('a peak standing on a rising background keeps its own prominence', () => {
  // The survey-scan case: the background climbs by 500 across the trace while
  // the line itself is only 200 tall, and the answer is 200 either way.
  const counts = new Float64Array(101);
  for (let index = 0; index < counts.length; index++) {
    counts[index] = 100 + index * 5;
  }
  counts[50] = (counts[50] as number) + 200;

  // 195 rather than 200: the col on the high side is the point just past the
  // line, which the background has already carried five counts higher. What
  // matters is that the answer is the size of the line and not the 500 counts
  // the background climbs across the trace, which is what an absolute
  // threshold would have measured.
  expect(peakProminence(counts, 50)).toBe(195);
});

test('the highest peak of a trace is prominent by its whole height', () => {
  const counts = Float64Array.from([0, 1, 50, 1, 0]);

  expect(peakProminence(counts, 2)).toBe(50);
});

test('an empty trace has no prominence and no span', () => {
  const counts = new Float64Array(0);

  expect(peakProminence(counts, 0)).toBe(0);
  expect(intensitySpan(counts)).toBe(0);
});

test('the span is the distance from the lowest count to the highest', () => {
  expect(intensitySpan(Float64Array.from([120, 20, 90, 400]))).toBe(380);
  expect(intensitySpan(Float64Array.from([7, 7, 7]))).toBe(0);
});
