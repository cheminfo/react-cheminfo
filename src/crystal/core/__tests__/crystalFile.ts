import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { readCif } from '../cif/read.ts';
import type { CrystalStructure } from '../cif/types.ts';
import type { CrystalMolecule } from '../moleculeTypes.ts';

/**
 * Read one Crystallography Open Database entry kept for the tests.
 * @param name - The file name, e.g. `7050902.cif`.
 * @returns The structure.
 */
export function crystalFile(name: string): CrystalStructure {
  return readCif(readFileSync(join(import.meta.dirname, 'data', name), 'utf8'));
}

/**
 * The one molecule a structure holds.
 * @param molecules - What `crystalMolecules` found.
 * @returns The molecule.
 * @throws {Error} When there is not exactly one.
 */
export function onlyMolecule(
  molecules: readonly CrystalMolecule[],
): CrystalMolecule {
  const [molecule] = molecules;
  if (molecule === undefined || molecules.length !== 1) {
    throw new Error(`expected one molecule, found ${molecules.length}`);
  }
  return molecule;
}

/**
 * The elements of a molecule, alphabetical, written as a CIF formula is.
 * @param molecule - The molecule.
 * @returns e.g. `C9 H8 O4`.
 */
export function formulaOf(molecule: CrystalMolecule): string {
  const counts = new Map<string, number>();
  for (const atom of molecule.atoms) {
    counts.set(atom.element, (counts.get(atom.element) ?? 0) + 1);
  }
  const parts: string[] = [];
  for (const element of [...counts.keys()].toSorted()) {
    const count = counts.get(element) ?? 0;
    parts.push(count === 1 ? element : `${element}${count}`);
  }
  return parts.join(' ');
}

/**
 * How many atoms of a molecule each operation made.
 * @param molecule - The molecule.
 * @returns Operation index to count.
 */
export function operationCounts(
  molecule: CrystalMolecule,
): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const atom of molecule.atoms) {
    counts[atom.operationIndex] = (counts[atom.operationIndex] ?? 0) + 1;
  }
  return counts;
}
