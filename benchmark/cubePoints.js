/**
 * A/B of `cubePoints`: one closure per axis called three times per sample,
 * against one `chartScale` record per axis written out as a multiply-add.
 *
 *   node benchmark/cubePoints.js 100000
 */

import { argv, stdout, version } from 'node:process';

import Benchmark from 'benchmark';

import {
  chartPadExtent,
  chartValuesExtent,
} from '../src/chart/core/chartExtent.ts';
import { chartScale } from '../src/chart/core/chartScale.ts';
import { cubePoints } from '../src/scatter3d/core/cubePoints.ts';

const COUNT = Number(argv[2] ?? 100000);
const options = { minSamples: 30, maxTime: 30 };

function print(line) {
  stdout.write(`${line}\n`);
}
const PADDING = 0.05;

const across = new Float64Array(COUNT);
const up = new Float64Array(COUNT);
const away = new Float64Array(COUNT);
for (let index = 0; index < COUNT; index++) {
  across[index] = 1600 + ((index * 0.618_033_988_75) % 1) * 200;
  up[index] = -3 + ((index * 0.754_877_666_25) % 1) * 6;
  away[index] = ((index * 0.569_840_290_99) % 1) * 0.02;
}

function axisMapperOld(values, padding) {
  const { min, max } = chartPadExtent(chartValuesExtent(values), padding);
  const span = max - min;
  if (!Number.isFinite(span) || span <= 0) {
    return (value) => (Number.isFinite(value) ? 0 : Number.NaN);
  }
  return (value) => (2 * (value - min)) / span - 1;
}

function cubePointsOld(x, y, z, padding) {
  const toX = axisMapperOld(x, padding);
  const toY = axisMapperOld(y, padding);
  const toZ = axisMapperOld(z, padding);
  const count = Math.min(x.length, y.length, z.length);
  const points = new Array(count);
  for (let index = 0; index < count; index++) {
    points[index] = [toX(x[index]), toY(y[index]), toZ(z[index])];
  }
  return points;
}

function cubeScaleNew(values, padding) {
  const { min, max } = chartPadExtent(chartValuesExtent(values), padding);
  return chartScale(min, max, -1, 1);
}

function cubePointsNew(x, y, z, padding) {
  const { offset: offsetX, factor: factorX } = cubeScaleNew(x, padding);
  const { offset: offsetY, factor: factorY } = cubeScaleNew(y, padding);
  const { offset: offsetZ, factor: factorZ } = cubeScaleNew(z, padding);
  const count = Math.min(x.length, y.length, z.length);
  const points = new Array(count);
  for (let index = 0; index < count; index++) {
    points[index] = [
      offsetX + x[index] * factorX,
      offsetY + y[index] * factorY,
      offsetZ + z[index] * factorZ,
    ];
  }
  return points;
}

function checksum(points) {
  let sum = 0;
  for (let index = 0; index < points.length; index++) {
    const point = points[index];
    sum += point[0] + point[1] + point[2];
  }
  return sum.toFixed(9);
}

const results = new Map();

print(`cubePoints, ${COUNT} samples, node ${version}`);

new Benchmark.Suite()
  .add(
    'old  closure per axis',
    () => {
      results.set(
        'old  closure per axis',
        cubePointsOld(across, up, away, PADDING),
      );
    },
    options,
  )
  .add(
    'new  chartScale records',
    () => {
      results.set(
        'new  chartScale records',
        cubePointsNew(across, up, away, PADDING),
      );
    },
    options,
  )
  .add(
    'src  cubePoints',
    () => {
      results.set('src  cubePoints', cubePoints(across, up, away));
    },
    options,
  )
  .on('cycle', (event) => {
    const { name, stats } = event.target;
    const nsPerElement = (stats.mean * 1e9) / COUNT;
    print(
      `${name.padEnd(26)} ${nsPerElement.toFixed(2)} ns/sample ±${stats.rme.toFixed(1)}% (${stats.sample.length} samples) value ${checksum(results.get(name))}`,
    );
  })
  .run();
