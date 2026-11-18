import type { CrystalSite, CrystalStructure } from './cif/types.ts';
import { chooseDisorder, isDummy } from './disorder.ts';
import type { ExpandedAtom } from './expand.ts';
import { expandSite } from './expand.ts';
import { structureOperations } from './operations.ts';
import type { Lattice } from './symmetry/lattice.ts';
import { createLattice } from './symmetry/lattice.ts';
import type { CrystalOperation } from './symmetry/types.ts';

/** Options of {@link crystalCellAtoms}. */
export interface CellAtomsOptions {
  /**
   * The most atoms one cell is expanded into; past it, none is returned.
   * @default 100000
   */
  maxAtoms?: number;
}

/** What one cell of a crystal holds. */
export interface CellAtoms {
  /** The cell. */
  readonly lattice: Lattice;
  /** The space group's operations, as the file states or implies them. */
  readonly operations: ReadonlyArray<CrystalOperation<3>>;
  /**
   * Every atom of the cell, fractional and wrapped into [0, 1): each site that
   * is not a dummy, expanded, with the major part of each disorder kept. Empty
   * when the cell holds more than `maxAtoms`.
   */
  readonly atoms: readonly ExpandedAtom[];
  /** How many atoms the expansion made, disorder included, counted past the cap. */
  readonly count: number;
  /** Whether the cell holds more than `maxAtoms`. */
  readonly tooLarge: boolean;
}

/**
 * The atoms one cell of a crystal holds, which is what a page draws or bonds.
 *
 * Every site that is not a dummy is expanded by the space group, and the
 * disorder is resolved as `chooseDisorder` does: the atoms in no disorder group,
 * and the major part of each.
 * @param structure - What `readCif` returned.
 * @param options - See {@link CellAtomsOptions}.
 * @returns The cell's atoms, its lattice and its operations.
 * @throws {Error} When the file names no space group and lists no operation, or
 *   its cell has angles no cell can have.
 */
export function crystalCellAtoms(
  structure: CrystalStructure,
  options: CellAtomsOptions = {},
): CellAtoms {
  const { maxAtoms = 100_000 } = options;
  const operations = structureOperations(structure);
  const lattice = createLattice(structure.cell);
  const { sites } = structure;
  const expanded = expandSites(sites, operations, maxAtoms);
  if (expanded.count > maxAtoms) {
    return {
      lattice,
      operations,
      atoms: [],
      count: expanded.count,
      tooLarge: true,
    };
  }
  const kept = chooseDisorder(sites, expanded.atoms, lattice);
  const atoms: ExpandedAtom[] = [];
  for (const atom of expanded.atoms) {
    if (kept[atom.siteIndex] === 1) atoms.push(atom);
  }
  return {
    lattice,
    operations,
    atoms,
    count: expanded.count,
    tooLarge: false,
  };
}

/**
 * Every atom of the cell the sites that are not dummies make, counted past the cap.
 * @param sites - The asymmetric unit.
 * @param operations - The full coset list.
 * @param maxAtoms - The most atoms kept.
 * @returns The atoms, and how many the cell holds.
 */
function expandSites(
  sites: readonly CrystalSite[],
  operations: ReadonlyArray<CrystalOperation<3>>,
  maxAtoms: number,
): { atoms: ExpandedAtom[]; count: number } {
  const atoms: ExpandedAtom[] = [];
  let count = 0;
  for (let index = 0; index < sites.length; index++) {
    const site = sites[index] as CrystalSite;
    if (isDummy(site)) continue;
    const images = expandSite(site, index, operations);
    count += images.length;
    if (count > maxAtoms) continue;
    for (let image = 0; image < images.length; image++) {
      atoms.push(images[image] as ExpandedAtom);
    }
  }
  return { atoms, count };
}
