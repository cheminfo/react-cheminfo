import { expect, test } from 'vitest';

import { readCif } from '../cif/read.ts';
import { keptSites } from '../disorder.ts';
import { crystalMolecules } from '../molecules.ts';

import {
  crystalFile,
  formulaOf,
  onlyMolecule,
  operationCounts,
} from './crystalFile.ts';

test('a 97:3 disorder keeps its major part, whatever the assembly says', () => {
  const structure = crystalFile('2104002.cif');
  const kept = keptSites(structure);
  const labels: string[] = [];
  for (let index = 0; index < kept.length; index++) {
    if (kept[index] === 1) labels.push(structure.sites[index]?.label ?? '');
  }

  // C6 is in group 1 of no assembly, the rest of part 1 in assembly A.
  expect(labels).toStrictEqual([
    'S1',
    'C5',
    'C4',
    'C3',
    'C2',
    'C6',
    'O8',
    'C9',
    'H1C5',
    'H1C4',
    'H1C6',
    'H1C9',
    'H2C9',
    'H3C9',
  ]);
});

test('the disordered molecule on an inversion centre comes out whole', () => {
  const { molecules } = crystalMolecules(crystalFile('2104002.cif'));

  const molecule = onlyMolecule(molecules);

  expect(formulaOf(molecule)).toBe('C12 H12 O2 S2');
  expect(molecule.bonds).toHaveLength(29);
  expect(operationCounts(molecule)).toStrictEqual({ 0: 14, 4: 14 });
  expect(
    new Set(molecule.atoms.map((atom) => atom.disorderGroup)),
  ).toStrictEqual(new Set(['1']));
  expect(molecule.atoms[0]?.occupancy).toBe(0.9706);
});

test('group 0 is no group', () => {
  const structure = crystalFile('8000309.cif');

  expect(structure.sites[0]?.disorderGroup).toBe('0');

  const [alanine] = crystalMolecules(structure).molecules;

  expect(alanine?.atoms).toHaveLength(13);
  expect(alanine?.atoms[0]?.disorderGroup).toBeNull();
});

test('of two equal parts the first written is kept, and a dummy never is', () => {
  const structure = readCif(
    tinyCif([
      'C1 C 0.10 0.10 0.10 1 d . .',
      'C2 C 0.25 0.10 0.10 0.5 d A 1',
      'C3 C 0.27 0.12 0.10 0.5 d A 2',
      'X1 C 0.60 0.60 0.60 1 dum . .',
    ]),
  );

  expect(Array.from(keptSites(structure))).toStrictEqual([1, 1, 0, 0]);

  const { molecules } = crystalMolecules(structure);

  expect(molecules.map((molecule) => molecule.atoms.length)).toStrictEqual([2]);
});

test('parts of one assembly are alternatives, of two assemblies only where they meet', () => {
  const structure = readCif(
    tinyCif([
      // Two parts of one CF-like fragment, 1.3 Å apart: alternatives.
      'C1 C 0.10 0.10 0.10 1 d . .',
      'F1 F 0.24 0.10 0.10 0.6 d A 1',
      'F2 F 0.20 0.21 0.10 0.4 d A 2',
      // A second, independent disorder far away, written as its own assembly.
      'O1 O 0.60 0.60 0.60 0.7 d B 3',
      'O2 O 0.62 0.60 0.60 0.3 d C 4',
    ]),
  );

  expect(Array.from(keptSites(structure))).toStrictEqual([1, 1, 0, 1, 0]);
});

test('copies of a disorder about a special position are not bonded together', () => {
  // SHELX's PART -1: the fragment overlaps its own inversion image.
  const structure = readCif(
    tinyCif(['C1 C 0.03 0 0 0.5 d . -1', 'C2 C 0.17 0 0 0.5 d . -1']),
  );
  const { molecules } = crystalMolecules(structure);

  expect(molecules).toHaveLength(1);
  expect(molecules[0]?.atoms).toHaveLength(2);
  expect(molecules[0]?.bonds).toHaveLength(1);
  expect(molecules[0]?.copies).toBe(2);
});

test('an atom written twice is one atom', () => {
  // A centre of inversion 0.002 Å from the atom: its image is the same atom.
  const structure = readCif(tinyCif(['Cl1 Cl 0.0002 0 0 1 d . .']));
  const result = crystalMolecules(structure);

  expect(result.cellAtoms).toBe(1);
  expect(result.molecules).toHaveLength(1);
  expect(result.molecules[0]?.copies).toBe(1);
});

/**
 * A 10 Å cubic cell in P-1, with these atom rows.
 * @param rows - The `_atom_site` rows.
 * @returns A one-block CIF.
 */
function tinyCif(rows: readonly string[]): string {
  return [
    'data_tiny',
    '_cell_length_a 10',
    '_cell_length_b 10',
    '_cell_length_c 10',
    '_cell_angle_alpha 90',
    '_cell_angle_beta 90',
    '_cell_angle_gamma 90',
    'loop_',
    '_symmetry_equiv_pos_as_xyz',
    'x,y,z',
    '-x,-y,-z',
    'loop_',
    '_atom_site_label',
    '_atom_site_type_symbol',
    '_atom_site_fract_x',
    '_atom_site_fract_y',
    '_atom_site_fract_z',
    '_atom_site_occupancy',
    '_atom_site_calc_flag',
    '_atom_site_disorder_assembly',
    '_atom_site_disorder_group',
    ...rows,
    '',
  ].join('\n');
}
