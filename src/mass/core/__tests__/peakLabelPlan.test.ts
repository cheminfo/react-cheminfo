import { expect, test } from 'vitest';

import { plotRect } from '../../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../../chart/core/chartScale.ts';
import { chartScale } from '../../../chart/core/chartScale.ts';
import { fullDomain } from '../massDomain.ts';
import type { MassDomain, MassSpectrum } from '../massSpectrum.ts';
import { planPeakLabels } from '../peakLabelPlan.ts';

import { firstMassFixture } from './massFixtures.ts';

/**
 * The scales of a chart of a given width showing a given window.
 * @param width - The chart's width, in pixels.
 * @param domain - The window it shows.
 * @returns Where the plot sits, and its two scales.
 */
function chartOf(width: number, domain: MassDomain) {
  const plot = plotRect({ width, height: 400 });
  const xScale: ChartScale = chartScale(
    domain.x[0],
    domain.x[1],
    plot.left,
    plot.right,
  );
  const yScale: ChartScale = chartScale(
    domain.y[0],
    domain.y[1],
    plot.bottom,
    plot.top,
  );
  return { plot, xScale, yScale };
}

/**
 * The masses a plan labels, crowded ones as `null`.
 * @param spectrum - The spectrum labelled.
 * @param width - The chart's width.
 * @param domain - The window shown.
 * @returns What each planned stack writes as its m/z line.
 */
function labelledMasses(
  spectrum: MassSpectrum,
  width: number,
  domain: MassDomain,
): Array<string | null> {
  return planPeakLabels({ spectrum, ...chartOf(width, domain) }).map((plan) =>
    Number.isNaN(plan.labelX)
      ? null
      : (plan.lines.find((line) => line.kind === 'mz')?.text ?? ''),
  );
}

test('the whole window labels one peak a slot, the tallest of each', async () => {
  const taxine = await firstMassFixture('taxine-b-ms2.jdx');

  const plans = planPeakLabels({
    spectrum: taxine,
    ...chartOf(760, fullDomain([taxine])),
  });

  expect(plans.map((plan) => plan.lines)).toStrictEqual([
    [
      { kind: 'mz', text: '107.0493' },
      { kind: 'intensity', text: '61.49' },
    ],
    [
      { kind: 'mz', text: '194.1175' },
      { kind: 'intensity', text: '101.23' },
    ],
  ]);
  expect(plans.map((plan) => plan.key)).toStrictEqual([
    `${taxine.id}:3`,
    `${taxine.id}:7`,
  ]);
});

test('zooming in narrows the slots, and brings the crowded peaks back', async () => {
  const taxine = await firstMassFixture('taxine-b-ms2.jdx');

  // A slot is a tenth of the window: 4.5 m/z here, so 80.52 stands within one
  // of the taller 79.05 and goes without.
  expect(
    labelledMasses(taxine, 760, { x: [70, 115], y: [0, 120] }),
  ).toStrictEqual(['71.4512', '79.0544', '107.0493', '113.8762']);
  // And a window of 4 m/z has room for both.
  expect(
    labelledMasses(taxine, 760, { x: [78, 82], y: [0, 120] }),
  ).toStrictEqual(['79.0544', '80.5207']);
});

test('on a narrow chart the taller peak keeps the room', async () => {
  const taxine = await firstMassFixture('taxine-b-ms2.jdx');

  expect(labelledMasses(taxine, 240, fullDomain([taxine]))).toStrictEqual([
    null,
    '194.1175',
  ]);
});

test('a nominal-mass table is labelled in whole numbers', async () => {
  const aflatoxin = await firstMassFixture('aflatoxin-peaks.jdx');

  const plans = planPeakLabels({
    spectrum: aflatoxin,
    mzDecimals: 0,
    ...chartOf(760, fullDomain([aflatoxin])),
  });

  expect(plans.map((plan) => plan.lines[0]?.text)).toContain('330');
  expect(plans.map((plan) => plan.lines[1]?.text)).toContain('100');
});
