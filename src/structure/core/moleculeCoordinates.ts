import type { Molecule } from 'openchemlib';

import type { RelaxableGeometry } from './geometryRelaxer.ts';

/**
 * Read the elements and 3D coordinates of a molecule into the flat form an
 * engine takes.
 * @param molecule - A molecule carrying 3D coordinates. Not modified.
 * @returns Its geometry in ångström, one entry per atom of `getAllAtoms()`.
 */
export function readRelaxableGeometry(molecule: Molecule): RelaxableGeometry {
  const atoms = molecule.getAllAtoms();
  const elements = new Array<string>(atoms);
  const coordinates = new Float64Array(atoms * 3);
  for (let atom = 0; atom < atoms; atom++) {
    elements[atom] = molecule.getAtomLabel(atom);
    coordinates[atom * 3] = molecule.getAtomX(atom);
    coordinates[atom * 3 + 1] = molecule.getAtomY(atom);
    coordinates[atom * 3 + 2] = molecule.getAtomZ(atom);
  }
  return { elements, coordinates };
}

/**
 * Write flat coordinates back onto a molecule, atom for atom.
 * @param molecule - The molecule to move. Mutated.
 * @param coordinates - Flat `x,y,z` per atom in ångström.
 * @throws {Error} When there is not one position per atom.
 */
export function writeRelaxedCoordinates(
  molecule: Molecule,
  coordinates: Float64Array,
): void {
  const atoms = molecule.getAllAtoms();
  if (coordinates.length !== atoms * 3) {
    throw new Error(
      `The relaxed geometry has ${coordinates.length / 3} positions for ${atoms} atoms.`,
    );
  }
  for (let atom = 0; atom < atoms; atom++) {
    molecule.setAtomX(atom, coordinates[atom * 3] as number);
    molecule.setAtomY(atom, coordinates[atom * 3 + 1] as number);
    molecule.setAtomZ(atom, coordinates[atom * 3 + 2] as number);
  }
}

/**
 * Root-mean-square displacement between two geometries of the same atoms, each
 * taken about its own centroid, in ångström.
 *
 * Removing the centroids is what makes the number mean "how far the atoms
 * moved" rather than "how far the molecule was translated": a relaxer is free
 * to recentre a molecule, and the `GeometryRelaxer` contract forbids it to
 * rotate one.
 * @param before - Flat coordinates before.
 * @param after - Flat coordinates after.
 * @returns The RMSD in ångström, `0` for an empty geometry.
 * @throws {Error} When the two do not hold the same number of atoms.
 */
export function centredRmsd(before: Float64Array, after: Float64Array): number {
  if (before.length !== after.length) {
    throw new Error(
      `Cannot compare ${before.length / 3} positions with ${after.length / 3}.`,
    );
  }
  const atoms = before.length / 3;
  if (atoms === 0) return 0;
  const centreBefore = centroid(before, atoms);
  const centreAfter = centroid(after, atoms);
  let total = 0;
  for (let atom = 0; atom < atoms; atom++) {
    for (let axis = 0; axis < 3; axis++) {
      const gap =
        (before[atom * 3 + axis] as number) -
        (centreBefore[axis] as number) -
        ((after[atom * 3 + axis] as number) - (centreAfter[axis] as number));
      total += gap * gap;
    }
  }
  return Math.sqrt(total / atoms);
}

function centroid(coordinates: Float64Array, atoms: number): Float64Array {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let atom = 0; atom < atoms; atom++) {
    x += coordinates[atom * 3] as number;
    y += coordinates[atom * 3 + 1] as number;
    z += coordinates[atom * 3 + 2] as number;
  }
  return new Float64Array([x / atoms, y / atoms, z / atoms]);
}
