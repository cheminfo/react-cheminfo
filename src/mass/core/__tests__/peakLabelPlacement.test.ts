import { expect, test } from 'vitest';

import { plotRect } from '../../../chart/core/chartGeometry.ts';
import { chartPixel, chartScale } from '../../../chart/core/chartScale.ts';
import { PEAK_LABEL } from '../../../chart/core/chartTheme.ts';
import type { MassSpectrum } from '../massSpectrum.ts';
import { planPeakLabels } from '../peakLabelPlan.ts';

const plot = plotRect({ width: 600, height: 400 });
const xScale = chartScale(100, 400, plot.left, plot.right);
const yScale = chartScale(0, 100, plot.bottom, plot.top);

test('a stack stands over its peak, saying what it is before what it measures', () => {
  const [plan] = planPeakLabels({
    spectrum: centroided([200.1234], [60], [2]),
    plot,
    xScale,
    yScale,
    showCharges: true,
    annotationLabels: new Map([['a:0', 'C@4.4']]),
  });

  expect(plan?.labelX).toBe(chartPixel(xScale, 200.1234));
  expect(plan?.tipY).toBe(chartPixel(yScale, 60));
  expect(plan?.lines.map((line) => line.text)).toStrictEqual([
    'C@4.4',
    'z = 2',
    '200.1234',
    '60.00',
  ]);
  // Farthest from the stick first, and the stack grows upwards from the tip.
  expect(plan?.baselines[0]).toBeLessThan(plan?.baselines[3] as number);
  expect(plan?.baselines[3]).toBeLessThan(plan?.tipY as number);
});

test('two peaks too close for both stacks leave the fainter one unnamed', () => {
  // Far enough apart to clear the selection's own slots — a tenth of the window
  // — and still closer than a label is wide on a plot this size.
  const crowded = planPeakLabels({
    spectrum: centroided([200, 231], [50, 100], [0, 0]),
    plot,
    xScale,
    yScale,
  });

  // Both are still planned — a peak that goes unwritten is still a peak that
  // was picked, and still carries the mark saying so.
  expect(crowded.map((plan) => plan.peak.x)).toStrictEqual([200, 231]);
  expect(crowded[0]?.labelX).toBeNaN();
  expect(crowded[1]?.labelX).toBe(chartPixel(xScale, 231));

  const apart = planPeakLabels({
    spectrum: centroided([200, 260], [50, 100], [0, 0]),
    plot,
    xScale,
    yScale,
  });

  // In ascending m/z, whichever of them was the taller.
  expect(apart.map((plan) => plan.peak.x)).toStrictEqual([200, 260]);
});

test('a stack over a peak at the edge is slid inside the plot, and its mark is not', () => {
  const [plan] = planPeakLabels({
    spectrum: centroided([100], [100], [0]),
    plot,
    xScale,
    yScale,
  });

  expect(plan?.tipX).toBe(plot.left);
  expect(plan?.labelX).toBe(plot.left + PEAK_LABEL.hoverHalfWidth);
  expect(plan?.box.x).toBe(plot.left);
});

test('a window holding no peak is planned as nothing at all', () => {
  expect(
    planPeakLabels({
      spectrum: centroided([], [], []),
      plot,
      xScale,
      yScale,
    }),
  ).toStrictEqual([]);
});

/**
 * A centroided spectrum with the peaks the test asks for.
 * @param mz - The m/z of each peak, ascending.
 * @param intensity - The intensity of each.
 * @param charge - The charge established for each, `0` for none.
 * @returns The spectrum, drawn as its sticks.
 */
function centroided(
  mz: number[],
  intensity: number[],
  charge: number[],
): MassSpectrum {
  return {
    id: 'a',
    name: 'a',
    color: '#000000',
    profile: null,
    centroid: {
      x: Float64Array.from(mz),
      y: Float64Array.from(intensity),
      charge: Int16Array.from(charge),
    },
    meta: null,
    origin: { format: 'text' },
    showProfile: false,
    showCentroid: true,
  };
}
