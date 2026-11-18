/**
 * What reading a CIF and cutting its cell into molecules costs, file by file,
 * over a folder of Crystallography Open Database entries.
 *
 * Not a benchmark.js suite: the quantity of interest is the wall clock of one
 * whole file, from text to molecules, its spread over a real database, and the
 * files that dominate it.
 *   node benchmark/crystalMolecules.js <folder or .cif files…>
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { argv, stdout, version } from 'node:process';

import { crystalMolecules, readCif } from '../src/crystal.ts';

const files = [];
for (const path of argv.slice(2)) collect(path, files);

const times = [];
const failures = new Map();
let molecules = 0;
let networks = 0;
let tooLarge = 0;
const started = performance.now();
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const start = performance.now();
  let read = 0;
  try {
    const structure = readCif(text);
    read = performance.now() - start;
    const result = crystalMolecules(structure);
    molecules += result.molecules.length;
    networks += result.networks.length;
    if (result.tooLarge) tooLarge++;
    times.push({
      file,
      read,
      total: performance.now() - start,
      atoms: result.cellAtoms,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const kind = message.replaceAll(/"[^"]*"|\d+/g, '…').slice(0, 90);
    failures.set(kind, (failures.get(kind) ?? 0) + 1);
  }
}
const wall = performance.now() - started;

const totals = Float64Array.from(times, (entry) => entry.total).toSorted();
let readSum = 0;
for (const entry of times) readSum += entry.read;
write(`node ${version}, ${files.length} files, ${times.length} read`);
write(
  `wall ${(wall / 1000).toFixed(1)} s, ${(wall / files.length).toFixed(2)} ms per file`,
);
write(
  `per file: median ${quantile(totals, 0.5)} ms, p95 ${quantile(totals, 0.95)} ms, p99 ${quantile(totals, 0.99)} ms, max ${quantile(totals, 1)} ms; readCif ${((100 * readSum) / sumOf(totals)).toFixed(0)} % of it`,
);
write(
  `${molecules} molecules, ${networks} networks, ${tooLarge} cells too large`,
);
write('slowest:');
for (const entry of times.toSorted((a, b) => b.total - a.total).slice(0, 10)) {
  write(
    `  ${entry.total.toFixed(1)} ms (read ${entry.read.toFixed(1)}), ${entry.atoms} atoms in the cell, ${entry.file}`,
  );
}
write('failures:');
for (const [kind, count] of [...failures].toSorted((a, b) => b[1] - a[1])) {
  write(`  ${count} × ${kind}`);
}

function collect(path, list) {
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path).toSorted()) {
      collect(join(path, name), list);
    }
  } else if (path.endsWith('.cif')) {
    list.push(path);
  }
}

function quantile(sorted, q) {
  if (sorted.length === 0) return 'n/a';
  const index = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return sorted[index].toFixed(2);
}

function sumOf(values) {
  let sum = 0;
  for (let index = 0; index < values.length; index++) sum += values[index];
  return sum;
}

function write(line) {
  stdout.write(`${line}\n`);
}
