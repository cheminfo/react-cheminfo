import { expect, test } from 'vitest';

import { chartPixel, chartScale } from '../../../chart/core/chartScale.ts';
import { radialDistribution } from '../../core/radialDistribution.ts';
import { radialPlotGeometry } from '../radialPlotGeometry.ts';

const threeS = radialDistribution({ n: 3, l: 0, charge: 1 }, { samples: 200 });
const x = chartScale(0, threeS.limit * 100, 40, 440);
const y = chartScale(-1, 1, 200, 0);

test('the density curve has one point per sample and starts at the nucleus', () => {
  const geometry = radialPlotGeometry(threeS, x, y, 100, false);

  expect(geometry.densityLine.split(' L')).toHaveLength(200);
  expect(geometry.densityLine.startsWith('M40.00 100.00')).toBe(true);
  expect(geometry.densityArea.endsWith('L440.00 100.00 L40.00 100.00 Z')).toBe(
    true,
  );
  expect(geometry.amplitudeRuns).toStrictEqual([]);
});

test('the density is scaled to its own peak', () => {
  const geometry = radialPlotGeometry(threeS, x, y, 100, false);

  const top = chartPixel(y, 1).toFixed(2);
  const tops = geometry.densityLine
    .slice(1)
    .split(' L')
    .filter((point) => point.endsWith(` ${top}`));

  expect(tops).toHaveLength(1);
});

test('a 3s amplitude is cut into three runs of alternating sign', () => {
  const geometry = radialPlotGeometry(threeS, x, y, 100, true);

  expect(geometry.amplitudeRuns.map((run) => run.positive)).toStrictEqual([
    true,
    false,
    true,
  ]);
});

test('each cut ends and restarts on zero, at the node', () => {
  const geometry = radialPlotGeometry(threeS, x, y, 100, true);
  const [first, second] = geometry.amplitudeRuns;
  const firstEnd = first?.path.split(' L').at(-1);
  const secondStart = second?.path.slice(1).split(' L', 1)[0];

  expect(firstEnd).toBe(secondStart);

  const [pixelX, pixelY] = (firstEnd ?? '').split(' ').map(Number);

  expect(pixelY).toBe(100);

  const node = chartPixel(x, (threeS.nodeRadii[0] ?? 0) * 100);

  expect(Math.abs((pixelX ?? 0) - node)).toBeLessThan(0.5);
});

test('ångström and picometres differ only in the scale they are read on', () => {
  const inAngstrom = radialPlotGeometry(
    threeS,
    chartScale(0, threeS.limit, 40, 440),
    y,
    1,
    false,
  );
  const inPicometres = radialPlotGeometry(threeS, x, y, 100, false);

  expect(inAngstrom.densityLine).toBe(inPicometres.densityLine);
});
