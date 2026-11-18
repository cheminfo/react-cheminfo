import { expect, test } from 'vitest';

import { chartPixel, chartScale } from '../../../chart/core/chartScale.ts';
import type { MassSpectrum } from '../massSpectrum.ts';
import { spectrumYScale, verticalScaleOf } from '../verticalScale.ts';

const yScale = chartScale(0, 100, 400, 0);

test('only a positive finite scale is taken', () => {
  expect(verticalScaleOf(withScale(undefined))).toBe(1);
  expect(verticalScaleOf(withScale(2.5))).toBe(2.5);
  expect(verticalScaleOf(withScale(0))).toBe(1);
  expect(verticalScaleOf(withScale(-3))).toBe(1);
  expect(verticalScaleOf(withScale(Number.NaN))).toBe(1);
  expect(verticalScaleOf(withScale(Number.POSITIVE_INFINITY))).toBe(1);
});

test('a spectrum drawn as measured keeps the chart axis itself', () => {
  expect(spectrumYScale(yScale, withScale(undefined))).toBe(yScale);
  expect(spectrumYScale(yScale, withScale(1))).toBe(yScale);
});

test('a scaled spectrum stretches about the baseline', () => {
  const doubled = spectrumYScale(yScale, withScale(2));

  expect(chartPixel(doubled, 0)).toBe(chartPixel(yScale, 0));
  expect(chartPixel(doubled, 25)).toBe(chartPixel(yScale, 50));
});

function withScale(verticalScale: number | undefined): MassSpectrum {
  return {
    id: 'a',
    name: 'a',
    color: '#000000',
    profile: null,
    centroid: {
      x: Float64Array.from([100]),
      y: Float64Array.from([10]),
      charge: new Int16Array(1),
    },
    meta: null,
    origin: { format: 'text' },
    showProfile: false,
    showCentroid: true,
    ...(verticalScale === undefined ? {} : { verticalScale }),
  };
}
