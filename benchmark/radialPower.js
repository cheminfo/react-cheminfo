/**
 * A/B of the radial power in `createRadialFunction`: `scaled ** l` inside the
 * per-sample closure, against one closure that branches on ℓ and multiplies,
 * and against one closure per ℓ.
 *
 * Run one workload per process, so no case inherits another's call feedback:
 *   node benchmark/radialPower.js 0|1|2|3   one orbital (3s, 3p, 3d, 4f)
 *   node benchmark/radialPower.js mixed     all four through one call site,
 *                                           as the grid evaluator calls them
 */

import { argv, stdout, version } from 'node:process';

import Benchmark from 'benchmark';

import { BOHR_IN_ANGSTROM } from '../src/orbital/core/constants.ts';
import { createRadialFunction } from '../src/orbital/core/hydrogenic.ts';
import { factorial } from '../src/orbital/core/numerics.ts';

const COUNT = 10000;
const options = { minSamples: 30, maxTime: 30 };

const ORBITALS = [
  { n: 3, l: 0, charge: 1 },
  { n: 3, l: 1, charge: 1 },
  { n: 3, l: 2, charge: 1 },
  { n: 4, l: 3, charge: 1 },
];

const workload = argv[2] ?? 'mixed';
const selected = workload === 'mixed' ? ORBITALS : [ORBITALS[Number(workload)]];
if (selected.includes(undefined)) {
  throw new Error(`unknown workload ${workload}, expected 0-3 or mixed`);
}

const distances = selected.map((orbital) => {
  const { n, l, charge } = orbital;
  const limit =
    (3 * BOHR_IN_ANGSTROM * (3 * n * n - l * (l + 1))) / (2 * charge);
  const values = new Float64Array(COUNT);
  for (let index = 0; index < COUNT; index++) {
    values[index] = (limit * index) / (COUNT - 1);
  }
  return values;
});

function print(line) {
  stdout.write(`${line}\n`);
}

function laguerreOld(degree, alpha, x) {
  if (degree === 0) return 1;
  let previous = 1;
  let current = 1 + alpha - x;
  for (let index = 1; index < degree; index++) {
    const next =
      ((2 * index + 1 + alpha - x) * current - (index + alpha) * previous) /
      (index + 1);
    previous = current;
    current = next;
  }
  return current;
}

function createRadialOld(parameters) {
  const { n, l, charge } = parameters;
  const degree = n - l - 1;
  const alpha = 2 * l + 1;
  const rho = (2 * charge) / (n * BOHR_IN_ANGSTROM);
  const normalisation = Math.sqrt(
    rho * rho * rho * (factorial(degree) / (2 * n * factorial(n + l))),
  );
  return (distance) => {
    const scaled = rho * distance;
    return (
      normalisation *
      scaled ** l *
      Math.exp(-scaled / 2) *
      laguerreOld(degree, alpha, scaled)
    );
  };
}

function laguerreBranch(degree, alpha, x) {
  if (degree === 0) return 1;
  let previous = 1;
  let current = 1 + alpha - x;
  for (let index = 1; index < degree; index++) {
    const next =
      ((2 * index + 1 + alpha - x) * current - (index + alpha) * previous) /
      (index + 1);
    previous = current;
    current = next;
  }
  return current;
}

function createRadialBranch(parameters) {
  const { n, l, charge } = parameters;
  const degree = n - l - 1;
  const alpha = 2 * l + 1;
  const rho = (2 * charge) / (n * BOHR_IN_ANGSTROM);
  const normalisation = Math.sqrt(
    rho * rho * rho * (factorial(degree) / (2 * n * factorial(n + l))),
  );
  return (distance) => {
    const scaled = rho * distance;
    const power =
      l === 0
        ? 1
        : l === 1
          ? scaled
          : l === 2
            ? scaled * scaled
            : l === 3
              ? scaled * scaled * scaled
              : scaled ** l;
    return (
      normalisation *
      power *
      Math.exp(-scaled / 2) *
      laguerreBranch(degree, alpha, scaled)
    );
  };
}

function laguerreClosures(degree, alpha, x) {
  if (degree === 0) return 1;
  let previous = 1;
  let current = 1 + alpha - x;
  for (let index = 1; index < degree; index++) {
    const next =
      ((2 * index + 1 + alpha - x) * current - (index + alpha) * previous) /
      (index + 1);
    previous = current;
    current = next;
  }
  return current;
}

function createRadialClosures(parameters) {
  const { n, l, charge } = parameters;
  const degree = n - l - 1;
  const alpha = 2 * l + 1;
  const rho = (2 * charge) / (n * BOHR_IN_ANGSTROM);
  const normalisation = Math.sqrt(
    rho * rho * rho * (factorial(degree) / (2 * n * factorial(n + l))),
  );
  switch (l) {
    case 0:
      return (distance) => {
        const scaled = rho * distance;
        return (
          normalisation *
          Math.exp(-scaled / 2) *
          laguerreClosures(degree, alpha, scaled)
        );
      };
    case 1:
      return (distance) => {
        const scaled = rho * distance;
        return (
          normalisation *
          scaled *
          Math.exp(-scaled / 2) *
          laguerreClosures(degree, alpha, scaled)
        );
      };
    case 2:
      return (distance) => {
        const scaled = rho * distance;
        return (
          normalisation *
          (scaled * scaled) *
          Math.exp(-scaled / 2) *
          laguerreClosures(degree, alpha, scaled)
        );
      };
    case 3:
      return (distance) => {
        const scaled = rho * distance;
        return (
          normalisation *
          (scaled * scaled * scaled) *
          Math.exp(-scaled / 2) *
          laguerreClosures(degree, alpha, scaled)
        );
      };
    default:
      return (distance) => {
        const scaled = rho * distance;
        return (
          normalisation *
          scaled ** l *
          Math.exp(-scaled / 2) *
          laguerreClosures(degree, alpha, scaled)
        );
      };
  }
}

// A real page builds several closures per orbital (grid, nodes, box), so the
// first one is thrown away: V8 must not specialise on a lone closure's context.
function closures(factory) {
  return selected.map((orbital) => {
    factory(orbital);
    return factory(orbital);
  });
}

const oldRadials = closures(createRadialOld);
const branchRadials = closures(createRadialBranch);
const closureRadials = closures(createRadialClosures);
const srcRadials = closures(createRadialFunction);

function sweepOld(radials) {
  let sum = 0;
  for (let orbital = 0; orbital < radials.length; orbital++) {
    const radial = radials[orbital];
    const values = distances[orbital];
    for (let index = 0; index < COUNT; index++) sum += radial(values[index]);
  }
  return sum;
}

function sweepBranch(radials) {
  let sum = 0;
  for (let orbital = 0; orbital < radials.length; orbital++) {
    const radial = radials[orbital];
    const values = distances[orbital];
    for (let index = 0; index < COUNT; index++) sum += radial(values[index]);
  }
  return sum;
}

function sweepClosures(radials) {
  let sum = 0;
  for (let orbital = 0; orbital < radials.length; orbital++) {
    const radial = radials[orbital];
    const values = distances[orbital];
    for (let index = 0; index < COUNT; index++) sum += radial(values[index]);
  }
  return sum;
}

function sweepSrc(radials) {
  let sum = 0;
  for (let orbital = 0; orbital < radials.length; orbital++) {
    const radial = radials[orbital];
    const values = distances[orbital];
    for (let index = 0; index < COUNT; index++) sum += radial(values[index]);
  }
  return sum;
}

const results = new Map();
const elements = COUNT * selected.length;

print(
  `radial power, workload ${workload}, ${elements} samples, node ${version}`,
);

new Benchmark.Suite()
  .add(
    'old  scaled ** l',
    () => {
      results.set('old  scaled ** l', sweepOld(oldRadials));
    },
    options,
  )
  .add(
    'new  branch on l',
    () => {
      results.set('new  branch on l', sweepBranch(branchRadials));
    },
    options,
  )
  .add(
    'alt  closure per l',
    () => {
      results.set('alt  closure per l', sweepClosures(closureRadials));
    },
    options,
  )
  .add(
    'src  createRadialFunction',
    () => {
      results.set('src  createRadialFunction', sweepSrc(srcRadials));
    },
    options,
  )
  .on('cycle', (event) => {
    const { name, stats } = event.target;
    const nsPerElement = (stats.mean * 1e9) / elements;
    print(
      `${name.padEnd(28)} ${nsPerElement.toFixed(3)} ns/sample ±${stats.rme.toFixed(1)}% (${stats.sample.length} samples) value ${results.get(name)}`,
    );
  })
  .run();
