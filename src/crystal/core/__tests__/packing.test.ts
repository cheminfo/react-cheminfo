import { join } from 'node:path';

import { expect, test } from 'vitest';

import type { CrystalStructure } from '../cif/types.ts';
import { covalentBondLimit } from '../covalentRadii.ts';
import { expandStructure } from '../expand.ts';
import { structureOperations } from '../operations.ts';
import { MAX_PACKED_ATOMS, packMolecules } from '../packing.ts';
import type { PackedAtom } from '../periodicBonds.ts';
import { createLattice } from '../symmetry/lattice.ts';

import { crystalFile } from './crystalFile.ts';

test('naphthalene: two whole molecules, centred on the inversion centres', () => {
  const { atoms, lattice } = cellOf(crystalFile('2311088.cif'));
  const packed = packMolecules(atoms, lattice, covalentBondLimit);

  expect(packed.molecules).toBe(2);
  expect(packed.extended).toBe(false);
  expect(packed.atoms).toHaveLength(36);
  expect(centres(packed.atoms, 18)).toStrictEqual([
    [0, 0, 0],
    [0, 0.5, 0.5],
  ]);
});

test('aspirin: four whole molecules, each centred inside the cell', () => {
  const { atoms, lattice } = cellOf(crystalFile('7050902.cif'));
  const packed = packMolecules(atoms, lattice, covalentBondLimit);

  expect(packed.molecules).toBe(4);
  expect(packed.extended).toBe(false);
  expect(packed.atoms).toHaveLength(84);

  for (const centre of centres(packed.atoms, 21)) {
    for (const value of centre) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  }
});

test('quartz is one network, left as the cell holds it', () => {
  const { atoms, lattice } = cellOf(crystalFile('9010144.cif'));
  const packed = packMolecules(atoms, lattice, covalentBondLimit);

  expect(packed.extended).toBe(true);
  expect(packed.molecules).toBe(0);
  // The same atoms, where the cell put them, in the order they were reached.
  expect(packed.atoms).toHaveLength(atoms.length);
  expect(new Set(packed.atoms)).toStrictEqual(new Set(atoms));
});

test('halite, bonded by the covalent rule, is a network too', () => {
  const halite = crystalFile(
    join('..', '..', 'cif', '__tests__', 'data', 'cod-1000041-halite.cif'),
  );
  const { atoms, lattice } = cellOf(halite);
  const packed = packMolecules(atoms, lattice, covalentBondLimit);

  expect(packed.molecules).toBe(0);
  expect(packed.extended).toBe(true);
  expect(packed.atoms).toHaveLength(8);
});

test('a cell too large to search is drawn as it is', () => {
  const { lattice } = cellOf(crystalFile('9010144.cif'));
  const atoms: PackedAtom[] = [];
  for (let index = 0; index <= MAX_PACKED_ATOMS; index++) {
    atoms.push({ element: 'C', position: [index / 10_000, 0, 0] });
  }
  const packed = packMolecules(atoms, lattice, covalentBondLimit);

  expect(packed.atoms).toBe(atoms);
  expect(packed.molecules).toBe(0);
});

/**
 * One cell of a structure, every atom wrapped into it.
 * @param structure - What `readCif` returned.
 * @returns Its atoms, wrapped into one cell, and the cell.
 */
function cellOf(structure: CrystalStructure) {
  return {
    atoms: expandStructure(structure.sites, structureOperations(structure)),
    lattice: createLattice(structure.cell),
  };
}

/**
 * The centre of each run of `size` atoms, rounded to a thousandth.
 * @param atoms - The packed atoms, molecule after molecule.
 * @param size - How many atoms one molecule holds.
 * @returns The centres, fractional, sorted along b.
 */
function centres(atoms: readonly PackedAtom[], size: number): number[][] {
  const result: number[][] = [];
  for (let start = 0; start < atoms.length; start += size) {
    const sum = [0, 0, 0];
    for (let index = start; index < start + size; index++) {
      const position = atoms[index]?.position ?? [0, 0, 0];
      for (let axis = 0; axis < 3; axis++) {
        sum[axis] = (sum[axis] ?? 0) + (position[axis] ?? 0);
      }
    }
    result.push(
      sum.map((value) => Math.round((value / size) * 1000) / 1000 || 0),
    );
  }
  return result.toSorted((a, b) => (a[1] ?? 0) - (b[1] ?? 0));
}
