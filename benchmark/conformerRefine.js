/**
 * What refining a conformer set with GFN2-xTB actually does and costs, which is
 * where the numbers quoted in `conformerRefine.ts` come from.
 *
 * Not a benchmark.js suite: each measurement is one whole geometry optimization
 * of seconds, so the quantity of interest is the wall clock of one pass and the
 * spread of the energies, not a per-call rate.
 *
 * Needs `xtb-wasm` installed next to this package, and runs the optimizations
 * in process rather than in the worker pool, because `Worker` and the bundler's
 * `?url` imports are browser things:
 *   node benchmark/conformerRefine.js           the ranking of five molecules
 *   node benchmark/conformerRefine.js scatter   one minimum from six starts
 */

import { argv, stdout, version } from 'node:process';

import { Molecule } from 'openchemlib';
import { relaxGeometryInProcess } from 'xtb-wasm';

import { refineConformers } from '../src/structure/core/conformerRefine.ts';
import { generateConformers } from '../src/structure/core/conformers.ts';
import { readRelaxableGeometry } from '../src/structure/core/moleculeCoordinates.ts';
import { registerResources } from '../src/structure/core/oclResources.ts';
import { KCAL_PER_MOL_PER_HARTREE } from '../src/xtb/core/xtbRelaxer.ts';

const MOLECULES = [
  ['butane', 'CCCC', 6],
  ['cyclohexane', 'C1CCCCC1', 6],
  ['1,2-dichloroethane', 'ClCCCl', 6],
  ['ethylene glycol', 'OCCO', 8],
  ['ibuprofen', 'CC(C)Cc1ccc(cc1)C(C)C(=O)O', 8],
];

await registerResources();
write(`node ${version}, GFN2-xTB through xtb-wasm, one instance\n`);

if (argv[2] === 'scatter') {
  await scatter();
} else {
  for (const [name, smiles, count] of MOLECULES) {
    // eslint-disable-next-line no-await-in-loop -- one molecule at a time is the measurement
    await ranking(name, smiles, count);
  }
}

// Refine one molecule's set and print both rankings side by side.
async function ranking(name, smiles, count) {
  const set = generateConformers(Molecule.fromSmiles(smiles), options(count));
  const startedAt = performance.now();
  const refined = await refineConformers(set, relaxSerially);
  const elapsed = performance.now() - startedAt;

  write(
    `${name} (${smiles}): ${set.conformers.length} MMFF94s+ conformers refined in ${elapsed.toFixed(0)} ms, ` +
      `${refined.refinement.merged} merged, ${refined.refinement.reordered} reordered`,
  );
  write('  id   MMFF94 rel   GFN2 rel   dispersion   RMSD   cycles');
  let lowest = Number.POSITIVE_INFINITY;
  for (const conformer of set.conformers) {
    if (conformer.energy !== null && conformer.energy < lowest) {
      lowest = conformer.energy;
    }
  }
  for (const conformer of refined.conformers) {
    const { relativeEnergy, dispersionEnergy, rmsd, cycles } =
      conformer.refinement;
    write(
      `  ${String(conformer.id).padStart(2)}   ${(conformer.energy - lowest).toFixed(3).padStart(10)}   ${relativeEnergy.toFixed(3).padStart(8)}   ${dispersionEnergy.toFixed(3).padStart(10)}   ${rmsd.toFixed(3)}   ${String(cycles).padStart(6)}`,
    );
  }
  for (const warning of refined.warnings) write(`  ! ${warning}`);
  write('');
}

// How far apart do relaxations of ONE minimum land? This is what sets
// REFINED_SAME_ENERGY_TOLERANCE.
async function scatter() {
  const set = generateConformers(Molecule.fromSmiles('CCCC'), options(1));
  const base = readRelaxableGeometry(
    Molecule.fromMolfile(set.conformers[0].molfile.data),
  );
  const energies = [];
  for (let trial = 0; trial < 6; trial++) {
    const coordinates = new Float64Array(base.coordinates.length);
    for (let index = 0; index < coordinates.length; index++) {
      // A deterministic wobble of up to 0.02 A, different in each trial.
      coordinates[index] =
        base.coordinates[index] + 0.02 * Math.sin(index * 7.3 + trial * 2.1);
    }
    // eslint-disable-next-line no-await-in-loop -- one trial at a time is the measurement
    const result = await relaxGeometryInProcess({
      geometry: { elements: base.elements, coordinates },
    });
    energies.push(result.energy.total);
    write(
      `  ${result.energy.total.toFixed(9)} Eh   ${result.cycles} cycles   converged=${result.converged}`,
    );
  }
  let lowest = energies[0];
  let highest = energies[0];
  for (const energy of energies) {
    if (energy < lowest) lowest = energy;
    if (energy > highest) highest = energy;
  }
  write(
    `  spread ${((highest - lowest) * KCAL_PER_MOL_PER_HARTREE).toExponential(2)} kcal/mol over 6 perturbed starts`,
  );
}

// A GeometryRelaxer that runs on this thread, one structure after another.
async function relaxSerially(geometries, runOptions) {
  const results = [];
  for (const [index, geometry] of geometries.entries()) {
    // eslint-disable-next-line no-await-in-loop -- one structure at a time is the measurement
    const result = await relaxGeometryInProcess({ geometry });
    results.push({
      coordinates: result.coordinates,
      energy: result.energy.total * KCAL_PER_MOL_PER_HARTREE,
      dispersionEnergy: result.energy.dispersion * KCAL_PER_MOL_PER_HARTREE,
      cycles: result.cycles,
      converged: result.converged,
      warnings: result.warnings,
    });
    runOptions?.onSettled?.(index + 1, geometries.length);
  }
  return results;
}

function options(maxConformers) {
  return {
    strategy: 'adaptive-random',
    maxConformers,
    maxTorsionSets: 10_000,
    use60DegreeSteps: false,
    seed: 42,
    minimisation: 'MMFF94s+',
    maxIterations: 4000,
    timeoutSeconds: 20,
  };
}

function write(line) {
  stdout.write(`${line}\n`);
}
