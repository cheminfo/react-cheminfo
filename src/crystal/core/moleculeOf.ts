import type { CrystalSite } from './cif/types.ts';
import type { BondGraph } from './components.ts';
import { disorderGroupOf } from './disorder.ts';
import type { ExpandedAtom } from './expand.ts';
import type {
  CrystalMolecule,
  CrystalMoleculeAtom,
  CrystalMoleculeBond,
} from './moleculeTypes.ts';
import type { Lattice } from './symmetry/lattice.ts';

/** Slack on a centroid sitting on a cell face, so it lands in one cell only. */
const CENTRE_TOLERANCE = 1e-6;

/** What a molecule is read from: the cell, its bonds, and the walk over them. */
export interface MoleculeContext {
  readonly atoms: readonly ExpandedAtom[];
  readonly sites: readonly CrystalSite[];
  readonly graph: BondGraph;
  /** The cell each atom was reached in, three integers per atom. */
  readonly shifts: Int32Array;
  readonly lattice: Lattice;
  /** Index of the identity in the operation list, -1 when it is absent. */
  readonly identityIndex: number;
  /** One slot per atom of the cell, -1 everywhere between two calls. */
  readonly localOf: Int32Array;
}

/**
 * One molecule, whole, placed where the file wrote it.
 *
 * The molecule is moved by a whole number of cells so the first atom the
 * file's own position generates sits at the coordinates the file gives it.
 * A molecule with no such atom is moved to the cell its centre falls in.
 * @param members - Its atoms, as indices into the cell.
 * @param copies - How many copies of it one cell holds.
 * @param context - The cell it is read from.
 * @returns The molecule.
 */
export function buildMolecule(
  members: readonly number[],
  copies: number,
  context: MoleculeContext,
): CrystalMolecule {
  const { atoms, sites, shifts, lattice, localOf } = context;
  const order = moleculeOrder(members, context);
  const move = placement(order, context);
  const m = lattice.cartesian;
  const placed: CrystalMoleculeAtom[] = [];
  for (let local = 0; local < order.length; local++) {
    const index = order[local] ?? 0;
    localOf[index] = local;
    const atom = atoms[index] as ExpandedAtom;
    const site = sites[atom.siteIndex] as CrystalSite;
    const fractional = [0, 0, 0];
    for (let axis = 0; axis < 3; axis++) {
      fractional[axis] =
        (atom.position[axis] ?? 0) +
        (shifts[index * 3 + axis] ?? 0) +
        (move[axis] ?? 0);
    }
    const [x = 0, y = 0, z = 0] = fractional;
    placed.push({
      element: atom.element,
      label: atom.label,
      siteIndex: atom.siteIndex,
      operationIndex: atom.operationIndex,
      position: [
        (m[0]?.[0] ?? 0) * x + (m[0]?.[1] ?? 0) * y + (m[0]?.[2] ?? 0) * z,
        (m[1]?.[0] ?? 0) * x + (m[1]?.[1] ?? 0) * y + (m[1]?.[2] ?? 0) * z,
        (m[2]?.[0] ?? 0) * x + (m[2]?.[1] ?? 0) * y + (m[2]?.[2] ?? 0) * z,
      ],
      occupancy: atom.occupancy,
      disorderGroup: disorderGroupOf(site),
    });
  }
  const bonds = moleculeBonds(order, context);
  for (let local = 0; local < order.length; local++) {
    localOf[order[local] ?? 0] = -1;
  }
  return { atoms: placed, bonds, copies };
}

/**
 * The atoms the identity generates first, in site order, then the others by
 * operation and site.
 * @param members - The atoms of the molecule, as indices into the cell.
 * @param context - The cell they are read from.
 * @returns The atoms, as indices into the cell, in molecule order.
 */
function moleculeOrder(
  members: readonly number[],
  context: MoleculeContext,
): Int32Array {
  const { atoms, sites, identityIndex } = context;
  const total = atoms.length;
  const keys = new Float64Array(members.length);
  for (let index = 0; index < members.length; index++) {
    const member = members[index] ?? 0;
    const atom = atoms[member] as ExpandedAtom;
    const rank =
      atom.operationIndex === identityIndex ? 0 : atom.operationIndex + 1;
    keys[index] = (rank * sites.length + atom.siteIndex) * total + member;
  }
  const sorted = keys.toSorted();
  const order = new Int32Array(members.length);
  for (let index = 0; index < sorted.length; index++) {
    order[index] = (sorted[index] ?? 0) % total;
  }
  return order;
}

/**
 * The whole cells that put the molecule where the file wrote it.
 * @param order - The atoms of the molecule, in molecule order.
 * @param context - The cell they are read from.
 * @returns The cell translation, in whole cells.
 */
function placement(
  order: Int32Array,
  context: MoleculeContext,
): [number, number, number] {
  const { atoms, sites, shifts, identityIndex } = context;
  const first = order[0] ?? 0;
  const anchor = atoms[first] as ExpandedAtom;
  if (anchor.operationIndex === identityIndex) {
    const site = sites[anchor.siteIndex] as CrystalSite;
    return [
      Math.round(site.x - (anchor.position[0] + (shifts[first * 3] ?? 0))),
      Math.round(site.y - (anchor.position[1] + (shifts[first * 3 + 1] ?? 0))),
      Math.round(site.z - (anchor.position[2] + (shifts[first * 3 + 2] ?? 0))),
    ];
  }
  const centre = [0, 0, 0];
  for (let local = 0; local < order.length; local++) {
    const index = order[local] ?? 0;
    const position = (atoms[index] as ExpandedAtom).position;
    for (let axis = 0; axis < 3; axis++) {
      centre[axis] =
        (centre[axis] ?? 0) +
        (position[axis] ?? 0) +
        (shifts[index * 3 + axis] ?? 0);
    }
  }
  return [
    -Math.floor((centre[0] ?? 0) / order.length + CENTRE_TOLERANCE),
    -Math.floor((centre[1] ?? 0) / order.length + CENTRE_TOLERANCE),
    -Math.floor((centre[2] ?? 0) / order.length + CENTRE_TOLERANCE),
  ];
}

function moleculeBonds(
  order: Int32Array,
  context: MoleculeContext,
): CrystalMoleculeBond[] {
  const { graph, localOf } = context;
  const bonds: CrystalMoleculeBond[] = [];
  for (let from = 0; from < order.length; from++) {
    const index = order[from] ?? 0;
    const last = graph.offsets[index + 1] ?? 0;
    for (let bond = graph.offsets[index] ?? 0; bond < last; bond++) {
      const to = localOf[graph.targets[bond] ?? 0] ?? -1;
      if (to > from) {
        bonds.push({ from, to, length: graph.lengths[bond] ?? 0 });
      }
    }
  }
  return bonds.toSorted((a, b) => a.from - b.from || a.to - b.to);
}
