import { expect, test } from 'vitest';

import type { CrystalStructure } from '../cif/types.ts';
import { crystalMolecules } from '../molecules.ts';

import { crystalFile } from './crystalFile.ts';

test('the cell holds Z formula units of the molecules found', () => {
  const cases: ReadonlyArray<[string, number]> = [
    ['7050902.cif', 4],
    ['2311088.cif', 2],
    ['1566501.cif', 2],
    ['2101932.cif', 2],
    ['1540720.cif', 2],
    ['1513322.cif', 4],
    ['8000309.cif', 4],
    ['2104002.cif', 4],
  ];
  const found: Record<string, Record<string, number>> = {};
  const expected: Record<string, Record<string, number>> = {};
  for (const [name, z] of cases) {
    const structure = crystalFile(name);
    found[name] = cellComposition(structure);
    expected[name] = formulaComposition(structure.formula, z);
  }

  expect(found).toStrictEqual(expected);
});

/**
 * How many atoms of each element the molecules put in one cell.
 * @param structure - What `readCif` returned.
 * @returns Element to count.
 */
function cellComposition(structure: CrystalStructure): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const molecule of crystalMolecules(structure).molecules) {
    for (const atom of molecule.atoms) {
      counts[atom.element] = (counts[atom.element] ?? 0) + molecule.copies;
    }
  }
  return counts;
}

/**
 * How many atoms of each element Z formula units hold.
 * @param formula - `_chemical_formula_sum`, e.g. `C9 H8 O4`.
 * @param z - How many formula units one cell holds.
 * @returns Element to count.
 */
function formulaComposition(
  formula: string,
  z: number,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const token of formula.split(' ')) {
    const groups = /^(?<element>[A-Z][a-z]?)(?<count>\d*)$/.exec(token)?.groups;
    const element = groups?.element ?? '';
    const count = groups?.count ?? '';
    counts[element] = (count === '' ? 1 : Number(count)) * z;
  }
  return counts;
}

test('a mineral, a metal-free framework and a layer are networks', () => {
  expect(crystalMolecules(crystalFile('9010144.cif'))).toStrictEqual({
    molecules: [],
    networks: [{ siteIndices: [0, 1], cellAtoms: 9, periodicity: 3 }],
    cellAtoms: 9,
    tooLarge: false,
  });
  expect(crystalMolecules(crystalFile('9008564.cif')).networks).toStrictEqual([
    { siteIndices: [0], cellAtoms: 8, periodicity: 3 },
  ]);
  // Graphite's sheets, and gypsum's calcium sulfate layers with their water.
  expect(crystalMolecules(crystalFile('9011577.cif')).networks).toStrictEqual([
    { siteIndices: [0, 1], cellAtoms: 4, periodicity: 2 },
  ]);
  expect(crystalMolecules(crystalFile('9013164.cif')).networks).toStrictEqual([
    { siteIndices: [0, 1, 2, 3, 4, 5, 6], cellAtoms: 48, periodicity: 2 },
  ]);
});
