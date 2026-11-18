import { crystalCellAtoms } from './cellAtoms.ts';
import { keptPairs, writtenTwice } from './cellBonds.ts';
import type { CrystalStructure } from './cif/types.ts';
import { bondGraph, walkComponents } from './components.ts';
import { covalentBondLimit } from './covalentRadii.ts';
import type { MoleculeContext } from './moleculeOf.ts';
import { buildMolecule } from './moleculeOf.ts';
import type {
  CrystalMolecule,
  CrystalMolecules,
  CrystalMoleculesOptions,
  CrystalNetwork,
} from './moleculeTypes.ts';
import { findPeriodicBonds } from './periodicBonds.ts';
import { isIdentity } from './symmetry/operation.ts';
import type { CrystalOperation } from './symmetry/types.ts';
import {
  representative,
  siteIndicesOf,
  symmetryClasses,
} from './symmetryClasses.ts';

/**
 * Two atoms closer than this, in ångström, are one atom written twice: no
 * bond is that short.
 */
export const SAME_ATOM_DISTANCE = 0.5;

/**
 * The molecules of a crystal, each whole and once.
 *
 * The asymmetric unit is expanded into the cell, the cell is bonded across its
 * faces by `bondLimit`, and every connected set of atoms is walked. Copies the
 * space group makes of one molecule share the sites they are built from, so
 * they are told apart from an independent molecule by that alone: Z′ = 2 gives
 * two molecules, the four images of a molecule in P2₁/c give one, and a
 * molecule sitting on a special position comes out whole, both halves of it.
 *
 * - **Networks** — a set of atoms bonded to its own translate: a salt, a
 *   mineral, a metal, a coordination polymer — are reported in `networks` and
 *   never returned as molecules.
 * - **Disorder**: the atoms in no disorder group are kept, and the disorder
 *   groups by decreasing mean occupancy, each unless it overlaps one already
 *   kept — the major part of each disorder (see `chooseDisorder`). An atom of
 *   a negative group, as SHELX writes disorder about a special position, is
 *   not bonded to a symmetry copy of an atom in a disorder group, as SHELX
 *   itself does.
 * - **Hydrogen** holds one bond, to its nearest neighbour.
 * - **Atoms written twice** — two sites, or two images of one site, closer than
 *   {@link SAME_ATOM_DISTANCE} — are one atom: the higher occupancy is kept,
 *   the one written first on a tie.
 * @param structure - What `readCif` returned.
 * @param options - Options.
 * @returns The independent molecules, in Cartesian coordinates, and the
 *   networks.
 * @throws {Error} When the file names no space group and lists no operation, or its
 *   cell has angles no cell can have.
 */
export function crystalMolecules(
  structure: CrystalStructure,
  options: CrystalMoleculesOptions = {},
): CrystalMolecules {
  const { bondLimit = covalentBondLimit, maxAtoms = 100_000 } = options;
  const cell = crystalCellAtoms(structure, { maxAtoms });
  if (cell.tooLarge) {
    return {
      molecules: [],
      networks: [],
      cellAtoms: cell.count,
      tooLarge: true,
    };
  }
  const { lattice, operations, atoms } = cell;
  const { sites } = structure;
  const pairs = findPeriodicBonds(atoms, lattice, bondLimit, {
    samePlace: SAME_ATOM_DISTANCE,
  });
  const removed = writtenTwice(atoms, pairs.coincident);
  const graph = bondGraph(
    atoms.length,
    pairs,
    keptPairs(pairs, atoms, sites, removed),
  );
  const { components, shifts } = walkComponents(graph, removed);
  const context: MoleculeContext = {
    atoms,
    sites,
    graph,
    shifts,
    lattice,
    identityIndex: identityIndexOf(operations),
    localOf: new Int32Array(atoms.length).fill(-1),
  };
  const molecules: CrystalMolecule[] = [];
  const networks: CrystalNetwork[] = [];
  for (const members of symmetryClasses(components, atoms, sites.length)) {
    let periodicity = 0;
    let cellAtoms = 0;
    for (const component of members) {
      periodicity = Math.max(periodicity, component.periodicity);
      cellAtoms += component.atoms.length;
    }
    if (periodicity > 0) {
      networks.push({
        siteIndices: siteIndicesOf(members, atoms),
        cellAtoms,
        periodicity: periodicity as 1 | 2 | 3,
      });
    } else {
      const chosen = representative(members, atoms, context.identityIndex);
      molecules.push(buildMolecule(chosen.atoms, members.length, context));
    }
  }
  let cellAtoms = atoms.length;
  for (let index = 0; index < removed.length; index++) {
    cellAtoms -= removed[index] ?? 0;
  }
  return { molecules, networks, cellAtoms, tooLarge: false };
}

function identityIndexOf(
  operations: ReadonlyArray<CrystalOperation<3>>,
): number {
  for (let index = 0; index < operations.length; index++) {
    if (isIdentity(operations[index] as CrystalOperation<3>)) return index;
  }
  return -1;
}
