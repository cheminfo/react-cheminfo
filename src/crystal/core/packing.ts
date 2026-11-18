/**
 * Whole molecules instead of atoms cut at the cell walls.
 *
 * The expanded cell holds every atom wrapped into [0, 1), so a molecule lying
 * across a face is drawn in pieces at opposite ends of the box. Here the cell
 * is read as the periodic graph it is: two atoms are bonded, possibly across a
 * face, by the rule handed in — a viewer hands the one it draws bonds with, so
 * what is completed here is exactly what it joins. Each molecule is then moved,
 * whole, to the cell its centre falls in, and appears once per cell.
 *
 * A component that reaches its own translate is not a molecule but a network
 * — rock salt, quartz, a metal — and has no whole to complete: its atoms stay
 * where the cell put them.
 */

import { bondGraph, walkComponents } from './components.ts';
import type { BondLimit, PackedAtom } from './periodicBonds.ts';
import { findPeriodicBonds } from './periodicBonds.ts';
import type { Lattice } from './symmetry/lattice.ts';

/** What {@link packMolecules} found. */
export interface PackingResult {
  /** The atoms, each molecule whole and once per cell. */
  readonly atoms: readonly PackedAtom[];
  /**
   * How many molecules one cell holds: sets of two atoms or more bonded to
   * nothing outside themselves. A lone ion is not counted.
   */
  readonly molecules: number;
  /** Whether some atoms belong to a network extending through the crystal. */
  readonly extended: boolean;
}

/**
 * The most atoms per cell the bonds are searched over, so a cell beyond it is
 * drawn as it is rather than holding a page.
 */
export const MAX_PACKED_ATOMS = 2000;

/** Slack on a centroid sitting on a cell face, so it lands in one cell only. */
const CENTRE_TOLERANCE = 1e-6;

/**
 * Complete the molecules of one cell.
 * @param atoms - Every atom of one cell, fractional, wrapped into [0, 1).
 * @param lattice - The cell they sit in.
 * @param bondLimit - When two atoms are bonded.
 * @returns The atoms, molecules whole; the input unchanged when it holds more
 * than {@link MAX_PACKED_ATOMS}.
 */
export function packMolecules(
  atoms: readonly PackedAtom[],
  lattice: Lattice,
  bondLimit: BondLimit,
): PackingResult {
  const count = atoms.length;
  if (count === 0 || count > MAX_PACKED_ATOMS) {
    return { atoms, molecules: 0, extended: false };
  }
  const graph = bondGraph(count, findPeriodicBonds(atoms, lattice, bondLimit));
  const { components, shifts } = walkComponents(graph);
  const packed: PackedAtom[] = [];
  let molecules = 0;
  let extended = false;
  for (const component of components) {
    if (component.periodicity > 0) {
      extended = true;
      for (const index of component.atoms) {
        packed.push(atoms[index] as PackedAtom);
      }
      continue;
    }
    if (component.atoms.length > 1) molecules++;
    pushMolecule(packed, atoms, component.atoms, shifts);
  }
  return { atoms: packed, molecules, extended };
}

/**
 * Add one molecule, moved whole to the cell its centre falls in.
 * @param packed - The atoms placed so far, appended to.
 * @param atoms - The atoms of the cell.
 * @param members - The atoms of the molecule.
 * @param shifts - The cell each atom was reached in.
 */
function pushMolecule(
  packed: PackedAtom[],
  atoms: readonly PackedAtom[],
  members: readonly number[],
  shifts: Int32Array,
): void {
  const centre = [0, 0, 0];
  for (const index of members) {
    const position = (atoms[index] as PackedAtom).position;
    for (let axis = 0; axis < 3; axis++) {
      centre[axis] =
        (centre[axis] ?? 0) +
        (position[axis] ?? 0) +
        (shifts[index * 3 + axis] ?? 0);
    }
  }
  const move: [number, number, number] = [0, 0, 0];
  for (let axis = 0; axis < 3; axis++) {
    const mean = (centre[axis] ?? 0) / members.length;
    move[axis] = -Math.floor(mean + CENTRE_TOLERANCE);
  }
  for (const index of members) {
    const atom = atoms[index] as PackedAtom;
    const position: [number, number, number] = [0, 0, 0];
    for (let axis = 0; axis < 3; axis++) {
      const shift = shifts[index * 3 + axis] ?? 0;
      position[axis] = (atom.position[axis] ?? 0) + shift + (move[axis] ?? 0);
    }
    packed.push({ element: atom.element, position });
  }
}
