import { expect, test } from 'vitest';

import { readCif } from '../cif/read.ts';
import { crystalMolecules } from '../molecules.ts';
import { createLattice, fractionalToCartesian } from '../symmetry/lattice.ts';

import {
  crystalFile,
  formulaOf,
  onlyMolecule,
  operationCounts,
} from './crystalFile.ts';

test('aspirin: one molecule, whole, where the file wrote it', () => {
  const structure = crystalFile('7050902.cif');
  const result = crystalMolecules(structure);

  expect(result.networks).toStrictEqual([]);
  expect(result.cellAtoms).toBe(84);
  expect(result.tooLarge).toBe(false);

  const aspirin = onlyMolecule(result.molecules);

  expect(formulaOf(aspirin)).toBe('C9 H8 O4');
  expect(aspirin.copies).toBe(4);
  expect(aspirin.bonds).toHaveLength(21);
  expect(operationCounts(aspirin)).toStrictEqual({ 0: 21 });
  expect(aspirin.atoms.map((atom) => atom.label)).toStrictEqual([
    'C1',
    'C2',
    'C3',
    'C4',
    'C5',
    'C6',
    'C7',
    'C8',
    'C9',
    'O1',
    'O2',
    'O3',
    'O4',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'H7',
    'H8',
  ]);

  // Every atom sits at the coordinates the file gives its site.
  const lattice = createLattice(structure.cell);
  for (const atom of aspirin.atoms) {
    const site = structure.sites[atom.siteIndex];
    const expected = fractionalToCartesian(lattice, [
      site?.x ?? Number.NaN,
      site?.y ?? Number.NaN,
      site?.z ?? Number.NaN,
    ]);
    for (let axis = 0; axis < 3; axis++) {
      expect(atom.position[axis]).toBeCloseTo(expected[axis] ?? 0, 10);
    }
  }

  expect(aspirin.bonds[0]?.from).toBe(0);
  expect(aspirin.bonds[0]?.to).toBe(1);
  expect(aspirin.bonds[0]?.length).toBeCloseTo(1.4091, 4);
});

test('naphthalene sits on an inversion centre and comes out whole, once', () => {
  const { molecules, networks } = crystalMolecules(crystalFile('2311088.cif'));

  expect(networks).toStrictEqual([]);

  const naphthalene = onlyMolecule(molecules);

  expect(formulaOf(naphthalene)).toBe('C10 H8');
  expect(naphthalene.bonds).toHaveLength(19);
  expect(naphthalene.copies).toBe(2);
  // Half from the file's own atoms, half from their inversion images.
  expect(operationCounts(naphthalene)).toStrictEqual({ 0: 9, 2: 9 });
});

test('urea sits on a site of symmetry mm2 and comes out whole', () => {
  const { molecules } = crystalMolecules(crystalFile('1566501.cif'));

  const urea = onlyMolecule(molecules);

  expect(formulaOf(urea)).toBe('C H4 N2 O');
  expect(urea.bonds).toHaveLength(7);
  expect(urea.copies).toBe(2);
  expect(operationCounts(urea)).toStrictEqual({ 0: 5, 5: 3 });
  expect(urea.atoms.map((atom) => atom.label)).toStrictEqual([
    'O',
    'N',
    'H1',
    'H2',
    'C',
    'N',
    'H1',
    'H2',
  ]);
});

test('Z′ = 2: two independent molecules, each once', () => {
  const { molecules } = crystalMolecules(crystalFile('1540720.cif'));

  expect(molecules).toHaveLength(2);
  expect(molecules.map((molecule) => formulaOf(molecule))).toStrictEqual([
    'C27 H38 O4',
    'C27 H38 O4',
  ]);
  expect(molecules.map((molecule) => molecule.bonds.length)).toStrictEqual([
    72, 72,
  ]);
  expect(molecules.map((molecule) => molecule.copies)).toStrictEqual([1, 1]);
  expect(molecules.map((molecule) => molecule.atoms[0]?.label)).toStrictEqual([
    'C1A',
    'C1B',
  ]);
});

test('a metal is bonded: ferrocene is one molecule, its iron included', () => {
  const { molecules } = crystalMolecules(crystalFile('2101932.cif'));

  const ferrocene = onlyMolecule(molecules);

  expect(formulaOf(ferrocene)).toBe('C10 Fe H10');
  expect(ferrocene.bonds).toHaveLength(30);
  expect(ferrocene.atoms[0]?.position).toStrictEqual([0, 0, 0]);

  const ironBonds = ferrocene.bonds.filter((bond) => bond.from === 0);

  expect(ironBonds).toHaveLength(10);

  for (const bond of ironBonds) {
    expect(bond.length).toBeGreaterThan(2);
    expect(bond.length).toBeLessThan(2.05);
  }
});

test('a hydrated salt gives the cation, each water and the lone chloride', () => {
  const { molecules, networks } = crystalMolecules(crystalFile('1513322.cif'));

  expect(networks).toStrictEqual([]);
  expect(molecules.map((molecule) => formulaOf(molecule))).toStrictEqual([
    'C24 H30 N2 O4',
    'H2 O',
    'H2 O',
    'H2 O',
    'Cl',
  ]);
  expect(molecules.map((molecule) => molecule.copies)).toStrictEqual([
    4, 4, 4, 4, 4,
  ]);
  expect(molecules[4]?.bonds).toStrictEqual([]);
});

test('two independent waters of ice, one completed by a mirror', () => {
  const { molecules } = crystalMolecules(crystalFile('1011023.cif'));

  expect(molecules.map((molecule) => formulaOf(molecule))).toStrictEqual([
    'H2 O',
    'H2 O',
  ]);
  expect(molecules.map((molecule) => molecule.copies)).toStrictEqual([6, 6]);
  expect(molecules[1]?.atoms.map((atom) => atom.label)).toStrictEqual([
    'O2',
    'H3',
    'H3',
  ]);
});

test('a cell above the cap is counted and not searched', () => {
  expect(
    crystalMolecules(crystalFile('7050902.cif'), { maxAtoms: 50 }),
  ).toStrictEqual({
    molecules: [],
    networks: [],
    cellAtoms: 84,
    tooLarge: true,
  });
});

test('the bond rule is the caller’s', () => {
  const { molecules } = crystalMolecules(crystalFile('7050902.cif'), {
    bondLimit: () => 0,
  });

  expect(molecules).toHaveLength(21);

  for (const molecule of molecules) {
    expect(molecule.atoms).toHaveLength(1);
    expect(molecule.copies).toBe(4);
  }
});

test('a molecule is placed where the file wrote it, else where its centre falls', () => {
  // The identity made the atom: it sits a cell away, as written.
  expect(written(['x,y,z', '-x,-y,-z'])).toStrictEqual({
    element: 'Cl',
    label: 'Cl1',
    siteIndex: 0,
    operationIndex: 0,
    position: [10, 10, 10],
    occupancy: 1,
    disorderGroup: null,
  });
  // The inversion, listed first, made it: it stays in the cell.
  expect(written(['-x,-y,-z', 'x,y,z'])?.position).toStrictEqual([0, 0, 0]);
});

/**
 * The first atom of a one-atom structure written with these operations.
 * @param operations - The operation triplets, in file order.
 * @returns The atom.
 */
function written(operations: readonly string[]) {
  return crystalMolecules(
    readCif(
      [
        'data_placed',
        '_cell_length_a 10',
        '_cell_length_b 10',
        '_cell_length_c 10',
        '_cell_angle_alpha 90',
        '_cell_angle_beta 90',
        '_cell_angle_gamma 90',
        'loop_',
        '_symmetry_equiv_pos_as_xyz',
        ...operations,
        'loop_',
        '_atom_site_label',
        '_atom_site_fract_x',
        '_atom_site_fract_y',
        '_atom_site_fract_z',
        'Cl1 1 1 1',
        '',
      ].join('\n'),
    ),
  ).molecules[0]?.atoms[0];
}
