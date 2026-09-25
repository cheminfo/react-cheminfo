import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { conformerShape, hasFiniteCoordinates } from '../conformerShape.ts';

test('principal moments are weighted by atomic number and sorted', () => {
  const { moments } = conformerShape(rhombus((x, y, z) => [x, y, z]));

  expect(moments[0]).toBeCloseTo(0, 12);
  expect(moments[1]).toBeCloseTo(8, 12);
  expect(moments[2]).toBeCloseTo(12, 12);
});

test('turning, mirroring or renumbering a conformer leaves its moments alone', () => {
  const reference = conformerShape(rhombus((x, y, z) => [x, y, z])).moments;
  const angle = 0.7;
  const turned = conformerShape(
    rhombus((x, y, z) => [
      x * Math.cos(angle) - y * Math.sin(angle),
      x * Math.sin(angle) + y * Math.cos(angle),
      z + 3,
    ]),
  ).moments;
  const mirrored = conformerShape(rhombus((x, y, z) => [-x, y, z])).moments;
  const renumbered = conformerShape(
    rhombus((x, y, z) => [y, x, z], true),
  ).moments;
  for (const moments of [turned, mirrored]) {
    for (let axis = 0; axis < 3; axis++) {
      expect(moments[axis]).toBeCloseTo(reference[axis] ?? Number.NaN, 12);
    }
  }

  expect(renumbered[2]).toBeCloseTo(12, 12);
});

test('an isotropic set of atoms has three equal moments and no handedness', () => {
  const molecule = new Molecule(8, 8);
  const corners = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ] as const;
  for (const [x, y, z] of corners) addAtom(molecule, 6, x, y, z);

  expect(conformerShape(molecule)).toStrictEqual({
    moments: [24, 24, 24],
    chirality: 0,
  });
});

test('a mirror image flips the chirality; turning and renumbering keep it', () => {
  const reference = conformerShape(skewChain((x, y, z) => [x, y, z]));
  const angle = 1.1;
  const turned = conformerShape(
    skewChain((x, y, z) => [
      x,
      y * Math.cos(angle) - z * Math.sin(angle) - 2,
      y * Math.sin(angle) + z * Math.cos(angle),
    ]),
  );
  const mirrored = conformerShape(skewChain((x, y, z) => [x, y, -z]));
  const renumbered = conformerShape(skewChain((x, y, z) => [x, y, z], true));

  expect(reference.chirality).toBe(1);
  expect(turned.chirality).toBeCloseTo(1, 10);
  expect(renumbered.chirality).toBeCloseTo(1, 10);
  expect(mirrored.chirality).toBeCloseTo(-1, 10);
});

test('a shape with a mirror plane, or a flat one, has no chirality', () => {
  const molecule = new Molecule(8, 8);
  addAtom(molecule, 6, 1, 0, 0.5);
  addAtom(molecule, 6, -1, 0, 0.5);
  addAtom(molecule, 8, 0, 2, -0.5);
  addAtom(molecule, 1, 0, -1, -0.5);

  expect(conformerShape(molecule).chirality).toBeCloseTo(0, 12);
  expect(conformerShape(rhombus((x, y, z) => [x, y, z])).chirality).toBe(0);
});

test('a single non-finite coordinate is caught', () => {
  const molecule = rhombus((x, y, z) => [x, y, z]);

  expect(hasFiniteCoordinates(molecule)).toBe(true);

  molecule.setAtomZ(2, Number.NaN);

  expect(hasFiniteCoordinates(molecule)).toBe(false);
});

// Two carbons at x = ±1 and two hydrogens at y = ±2: moments 0, 8 and 12.
function rhombus(
  place: (x: number, y: number, z: number) => [number, number, number],
  hydrogensFirst = false,
): Molecule {
  const molecule = new Molecule(8, 8);
  const carbons = [
    [1, 0, 0],
    [-1, 0, 0],
  ] as const;
  const hydrogens = [
    [0, 2, 0],
    [0, -2, 0],
  ] as const;
  const groups = hydrogensFirst
    ? ([
        [1, hydrogens],
        [6, carbons],
      ] as const)
    : ([
        [6, carbons],
        [1, hydrogens],
      ] as const);
  for (const [atomicNo, positions] of groups) {
    for (const [x, y, z] of positions) {
      addAtom(molecule, atomicNo, ...place(x, y, z));
    }
  }
  return molecule;
}

// Four carbons along a chain twisted out of its plane: a chiral shape.
function skewChain(
  place: (x: number, y: number, z: number) => [number, number, number],
  reversed = false,
): Molecule {
  const carbons = [
    [0, 0, 0],
    [1.5, 0, 0],
    [2, 1.4, 0],
    [3.4, 1.6, 1],
  ] as const;
  const molecule = new Molecule(8, 8);
  for (let index = 0; index < carbons.length; index++) {
    const position = carbons[reversed ? carbons.length - 1 - index : index];
    if (!position) continue;
    const [x, y, z] = position;
    addAtom(molecule, 6, ...place(x, y, z));
  }
  return molecule;
}

function addAtom(
  molecule: Molecule,
  atomicNo: number,
  x: number,
  y: number,
  z: number,
): void {
  const atom = molecule.addAtom(atomicNo);
  molecule.setAtomX(atom, x);
  molecule.setAtomY(atom, y);
  molecule.setAtomZ(atom, z);
}
