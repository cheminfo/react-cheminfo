import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { molfileAtomCount } from '../molfile.ts';
import { readMolfileExport, toMolfileExport } from '../molfileExport.ts';

test('a small molecule is written as V2000 and routed to the mol parser', () => {
  const { format, data } = toMolfileExport(ethanol());

  expect(format).toBe('mol');
  expect(data).toContain('V2000');
  expect(data).not.toContain('V3000');
  expect(molfileAtomCount(data)).toBe(3);
});

test('coordinates are written exactly as OpenChemLib writes them', () => {
  const { data } = toMolfileExport(ethanol());

  expect(atomCoordinates(data)[1]).toStrictEqual([1.5, 0, 0]);
  expect(atomCoordinates(data)[2]).toStrictEqual([2, -1.4, -0.3]);
});

test('the header advertises 3D as soon as the molecule has depth', () => {
  expect(toMolfileExport(ethanol()).data).toContain('OCL MolfileCreator  3D');
});

test('explicit hydrogens reach the molfile', () => {
  const molecule = ethanol();
  molecule.addImplicitHydrogens();

  expect(molfileAtomCount(toMolfileExport(molecule).data)).toBe(9);
});

test('a V3000 molfile is routed to the sdf parser, never to mol', () => {
  const data = ethanol().toMolfileV3();

  expect(readMolfileExport(data)).toStrictEqual({ format: 'sdf', data });
  expect(molfileAtomCount(data)).toBe(3);
});

test('999 atoms still fit V2000, 1000 switch the writer to V3000', () => {
  const small = chain(999);

  expect(small.format).toBe('mol');
  expect(small.data).toContain('V2000');
  expect(molfileAtomCount(small.data)).toBe(999);

  const large = chain(1000);

  expect(large.format).toBe('sdf');
  expect(large.data).toContain('V3000');
  expect(molfileAtomCount(large.data)).toBe(1000);
});

test('a molfile with an empty atom block is refused', () => {
  const empty = new Molecule(0, 0);
  const data = empty.toMolfile();

  expect(molfileAtomCount(data)).toBe(0);

  const message = 'Molfile has an empty atom block';

  expect(() => readMolfileExport(data)).toThrow(message);
  expect(() => toMolfileExport(empty)).toThrow(message);
});

test('text that is not a molfile at all carries no atoms, and is refused', () => {
  expect(molfileAtomCount('CCO')).toBe(0);
  expect(molfileAtomCount('M  V30 BEGIN CTAB\nV3000\n')).toBe(0);
  expect(() => readMolfileExport('CCO')).toThrow(
    'Molfile has an empty atom block',
  );
});

/** Bond lengths of 1.5 Å and 1.43 Å, inside the window OpenChemLib leaves unscaled. */
const ETHANOL_COORDINATES = [
  [0, 0, 0],
  [1.5, 0, 0],
  [2, 1.4, 0.3],
] as const;

function ethanol(): Molecule {
  const molecule = Molecule.fromSmiles('CCO');
  for (let atom = 0; atom < ETHANOL_COORDINATES.length; atom++) {
    const position = ETHANOL_COORDINATES[atom] as readonly number[];
    molecule.setAtomX(atom, position[0] as number);
    molecule.setAtomY(atom, position[1] as number);
    molecule.setAtomZ(atom, position[2] as number);
  }
  return molecule;
}

function chain(atomCount: number) {
  const molecule = new Molecule(atomCount, atomCount);
  for (let atom = 0; atom < atomCount; atom++) {
    molecule.addAtom(6);
    molecule.setAtomX(atom, atom * 1.5);
  }
  return toMolfileExport(molecule);
}

function atomCoordinates(data: string): number[][] {
  const lines = data.split('\n');
  const atomCount = molfileAtomCount(data);
  const coordinates: number[][] = new Array(atomCount);
  for (let atom = 0; atom < atomCount; atom++) {
    const line = lines[atom + 4] as string;
    coordinates[atom] = [
      Number(line.slice(0, 10)),
      Number(line.slice(10, 20)),
      Number(line.slice(20, 30)),
    ];
  }
  return coordinates;
}
