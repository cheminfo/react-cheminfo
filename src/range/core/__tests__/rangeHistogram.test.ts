import { expect, test } from 'vitest';

import { rangeHistogramPath } from '../rangeHistogram.ts';

test('the outline steps through each bin, scaled to the tallest', () => {
  expect(rangeHistogramPath([2, 4, 0, 1])).toBe(
    'M0 1V0.5H0.25V0H0.5V1H0.75V0.75H1V1Z',
  );
});

test('typed counts are read in place, and coordinates keep five decimals', () => {
  expect(rangeHistogramPath(Float64Array.from([1, 3, 3]))).toBe(
    'M0 1V0.66667H0.33333V0H0.66667V0H1V1Z',
  );
});

test('a histogram with nothing counted draws nothing', () => {
  expect(rangeHistogramPath([0, 0, 0])).toBe('');
  expect(rangeHistogramPath([])).toBe('');
});
