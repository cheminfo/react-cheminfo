/**
 * A/B of `projectCloud`: `projectPoint` per sample (trig, a tuple and an object
 * each) and a sorted copy of the row order, against one pass that rotates with
 * the trig hoisted, writes straight into the typed arrays and sorts in place.
 *
 * Run one size per process:
 *   node benchmark/projectCloud.js 10000
 *   node benchmark/projectCloud.js 100000
 */

import { argv, stdout, version } from 'node:process';

import Benchmark from 'benchmark';

import { projectCloud } from '../src/scatter3d/ui/cloudGeometry.ts';

const COUNT = Number(argv[2] ?? 10000);
const options = { minSamples: 30, maxTime: 30 };
const VIEWPORT = { scale: 180, centerX: 320, centerY: 240 };
const CHECKED_CAMERA = { yaw: 0.6, pitch: 0.5 };

const cube = new Array(COUNT);
for (let index = 0; index < COUNT; index++) {
  cube[index] = [
    (((index * 0.618_033_988_75) % 1) * 2 - 1) * 0.9,
    (((index * 0.754_877_666_25) % 1) * 2 - 1) * 0.9,
    (((index * 0.569_840_290_99) % 1) * 2 - 1) * 0.9,
  ];
}

function print(line) {
  stdout.write(`${line}\n`);
}

function rotatePointOld(point, camera) {
  const [x, y, z] = point;
  const cosPitch = Math.cos(camera.pitch);
  const sinPitch = Math.sin(camera.pitch);
  const upright = y * cosPitch - z * sinPitch;
  const tipped = y * sinPitch + z * cosPitch;
  const cosYaw = Math.cos(camera.yaw);
  const sinYaw = Math.sin(camera.yaw);
  return [x * cosYaw + tipped * sinYaw, upright, -x * sinYaw + tipped * cosYaw];
}

function projectPointOld(point, camera, viewport) {
  const [right, up, towards] = rotatePointOld(point, camera);
  const { scale, centerX, centerY } = viewport;
  return {
    x: centerX + right * scale,
    y: centerY - up * scale,
    depth: towards,
  };
}

function projectCloudOld(points, camera, viewport) {
  const count = points.length;
  const x = new Float64Array(count);
  const y = new Float64Array(count);
  const depths = new Float64Array(count);
  for (let index = 0; index < count; index++) {
    const at = projectPointOld(points[index], camera, viewport);
    x[index] = at.x;
    y[index] = at.y;
    depths[index] = at.depth;
  }
  const rows = new Uint32Array(count);
  for (let index = 0; index < count; index++) rows[index] = index;
  const order = rows.toSorted((a, b) => depths[a] - depths[b]);
  return { points: { x, y }, depths, order };
}

function projectCloudNew(points, camera, viewport) {
  const count = points.length;
  const x = new Float64Array(count);
  const y = new Float64Array(count);
  const depths = new Float64Array(count);
  const order = new Uint32Array(count);
  const cosPitch = Math.cos(camera.pitch);
  const sinPitch = Math.sin(camera.pitch);
  const cosYaw = Math.cos(camera.yaw);
  const sinYaw = Math.sin(camera.yaw);
  const { scale, centerX, centerY } = viewport;
  for (let index = 0; index < count; index++) {
    const point = points[index];
    const across = point[0];
    const up = point[1];
    const away = point[2];
    const upright = up * cosPitch - away * sinPitch;
    const tipped = up * sinPitch + away * cosPitch;
    x[index] = centerX + (across * cosYaw + tipped * sinYaw) * scale;
    y[index] = centerY - upright * scale;
    depths[index] = -across * sinYaw + tipped * cosYaw;
    order[index] = index;
  }
  order.sort((a, b) => depths[a] - depths[b]);
  return { points: { x, y }, depths, order };
}

function checksum(cloud) {
  let sum = 0;
  let weighted = 0;
  for (let index = 0; index < COUNT; index++) {
    sum += cloud.points.x[index] + cloud.points.y[index] + cloud.depths[index];
    weighted += index * cloud.order[index];
  }
  return `${sum.toFixed(6)} order ${weighted}`;
}

const variants = new Map([
  ['old  projectPoint + toSorted', projectCloudOld],
  ['new  one pass + sort', projectCloudNew],
  ['src  projectCloud', projectCloud],
]);
let turnOld = 0;
let turnNew = 0;
let turnSrc = 0;

print(`projectCloud, ${COUNT} samples, node ${version}`);

new Benchmark.Suite()
  .add(
    'old  projectPoint + toSorted',
    () => {
      turnOld = (turnOld + 1) % 64;
      projectCloudOld(
        cube,
        { yaw: 0.6 + turnOld * 0.05, pitch: 0.5 },
        VIEWPORT,
      );
    },
    options,
  )
  .add(
    'new  one pass + sort',
    () => {
      turnNew = (turnNew + 1) % 64;
      projectCloudNew(
        cube,
        { yaw: 0.6 + turnNew * 0.05, pitch: 0.5 },
        VIEWPORT,
      );
    },
    options,
  )
  .add(
    'src  projectCloud',
    () => {
      turnSrc = (turnSrc + 1) % 64;
      projectCloud(cube, { yaw: 0.6 + turnSrc * 0.05, pitch: 0.5 }, VIEWPORT);
    },
    options,
  )
  .on('cycle', (event) => {
    const { name, stats } = event.target;
    const nsPerElement = (stats.mean * 1e9) / COUNT;
    const value = checksum(variants.get(name)(cube, CHECKED_CAMERA, VIEWPORT));
    print(
      `${name.padEnd(30)} ${nsPerElement.toFixed(2)} ns/sample ±${stats.rme.toFixed(1)}% (${stats.sample.length} samples) value ${value}`,
    );
  })
  .run();
