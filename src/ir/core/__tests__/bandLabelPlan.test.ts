import { expect, test } from 'vitest';

import { plotRect } from '../../../chart/core/chartGeometry.ts';
import { chartPixel, chartScale } from '../../../chart/core/chartScale.ts';
import type { AssignedBand } from '../assignBands.ts';
import { assignBands } from '../assignBands.ts';
import { planBandLabels } from '../bandLabelPlan.ts';
import type { IrBand } from '../irBand.ts';
import { nearestBandAt } from '../nearestBand.ts';

const plot = plotRect({ width: 660, height: 264 });

/** Wavenumbers right to left, 4000 at the left edge and 400 at the right. */
const xScale = chartScale(400, 4000, plot.right, plot.left);

/** Percent transmittance, 0 at the bottom and 100 at the top. */
const yScale = chartScale(0, 100, plot.bottom, plot.top);

/**
 * One band, of the little a plan needs.
 * @param wavenumber - Where it sits.
 * @param transmittance - How deep it is, in percent.
 * @returns The band.
 */
function band(wavenumber: number, transmittance = 30): IrBand {
  return {
    spectrumId: 'film',
    wavenumber,
    absorbance: -Math.log10(transmittance / 100),
    transmittance,
    strength: 'S',
  };
}

/**
 * Bands with whatever the table says about them.
 * @param bands - The bands.
 * @returns The assigned bands.
 */
function assign(bands: IrBand[]): AssignedBand[] {
  return assignBands(bands);
}

test('the axis runs right to left, so a high wavenumber is a low pixel', () => {
  const plans = planBandLabels({
    assigned: assign([band(3300), band(1000)]),
    plot,
    xScale,
    yScale,
    mode: 'transmittance',
  });

  expect(plans).toHaveLength(2);
  expect(plans[0]?.band.wavenumber).toBe(3300);
  expect(plans[0]?.tipX).toBeLessThan(plans[1]?.tipX as number);
});

test('a transmittance label hangs below the band it names', () => {
  const [plan] = planBandLabels({
    assigned: assign([band(1710)]),
    plot,
    xScale,
    yScale,
    mode: 'transmittance',
  });

  expect(plan?.baselines[0]).toBeGreaterThan(plan?.tipY as number);
});

test('an absorbance label stands above it', () => {
  const absorbanceY = chartScale(0, 1.2, plot.bottom, plot.top);
  const [plan] = planBandLabels({
    assigned: assign([band(1710)]),
    plot,
    xScale,
    yScale: absorbanceY,
    mode: 'absorbance',
  });

  expect(plan?.baselines[0]).toBeLessThan(plan?.tipY as number);
});

test('a band outside the window is not named at all', () => {
  const zoomed = chartScale(1500, 1800, plot.right, plot.left);
  const plans = planBandLabels({
    assigned: assign([band(1710), band(3300)]),
    plot,
    xScale: zoomed,
    yScale,
    mode: 'transmittance',
  });

  expect(plans).toHaveLength(1);
  expect(plans[0]?.band.wavenumber).toBe(1710);
});

test('the label says the wavenumber, and the assignment only when asked', () => {
  const bare = planBandLabels({
    assigned: assign([band(1710)]),
    plot,
    xScale,
    yScale,
    mode: 'transmittance',
  });
  const named = planBandLabels({
    assigned: assign([band(1710)]),
    plot,
    xScale,
    yScale,
    mode: 'transmittance',
    showAssignments: true,
  });

  expect(bare[0]?.lines).toStrictEqual(['1710']);
  expect(named[0]?.lines).toStrictEqual(['1710', 'ketone C=O stretch']);
});

test('crowded labels are slid apart rather than printed over one another', () => {
  const crowded = assign([band(1700), band(1706), band(1712)]);
  const plans = planBandLabels({
    assigned: crowded,
    plot,
    xScale,
    yScale,
    mode: 'transmittance',
  });

  const centres = plans
    .map((plan) => plan.labelX)
    .filter((centre) => Number.isFinite(centre))
    .toSorted((first, second) => first - second);
  for (let index = 1; index < centres.length; index++) {
    expect(
      (centres[index] as number) - (centres[index - 1] as number),
    ).toBeGreaterThanOrEqual(34);
  }
});

test('the strongest bands win the labels, but come back in axis order', () => {
  const many = assign([
    band(1000, 90),
    band(1500, 20),
    band(2000, 80),
    band(3000, 10),
  ]);
  const plans = planBandLabels({
    assigned: many,
    plot,
    xScale,
    yScale,
    mode: 'transmittance',
    limit: 2,
  });

  // Ascending wavenumber, which on a reversed axis is right to left on screen.
  expect(plans.map((plan) => plan.band.wavenumber)).toStrictEqual([1500, 3000]);
});

test('the band under the pointer is the one nearest it on screen', () => {
  const bands = [band(1710), band(1600)];
  const atCarbonyl = chartPixel(xScale, 1710);

  expect(nearestBandAt(bands, xScale, atCarbonyl)?.wavenumber).toBe(1710);
  expect(nearestBandAt(bands, xScale, atCarbonyl + 3)?.wavenumber).toBe(1710);
  // Far from either, in the middle of the plot.
  expect(nearestBandAt(bands, xScale, atCarbonyl + 40)).toBeNull();
});
