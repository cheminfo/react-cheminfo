import type { BondLimit } from './periodicBonds.ts';

/** Options of `crystalMolecules`. */
export interface CrystalMoleculesOptions {
  /**
   * When two atoms are bonded.
   * @default covalentBondLimit
   */
  readonly bondLimit?: BondLimit;
  /**
   * The most atoms one cell may hold. A larger cell is not searched, and the
   * result says so with `tooLarge`.
   * @default 100000
   */
  readonly maxAtoms?: number;
}

/** One atom of a molecule. */
export interface CrystalMoleculeAtom {
  /** Chemical symbol, e.g. `C`. */
  readonly element: string;
  /** The label of the site it is a copy of, e.g. `C12`. */
  readonly label: string;
  /** Index into `structure.sites` of that site. */
  readonly siteIndex: number;
  /** Index into the operation list of the operation that put it here. */
  readonly operationIndex: number;
  /** Cartesian coordinates, in ångström, in the cell's Cartesian frame. */
  readonly position: readonly [number, number, number];
  /** How much of the site the atom occupies, 1 when the file gives none. */
  readonly occupancy: number;
  /** The disorder group of its site, or `null` when it is in none. */
  readonly disorderGroup: string | null;
}

/** One bond of a molecule. */
export interface CrystalMoleculeBond {
  /** Index into the molecule's atoms. */
  readonly from: number;
  /** Index into the molecule's atoms, always above `from`. */
  readonly to: number;
  /** In ångström. */
  readonly length: number;
}

/** One crystallographically independent molecule, whole. */
export interface CrystalMolecule {
  /**
   * Its atoms: the copies the file's own position generates first, in the
   * order the file lists their sites, then those its symmetry completes.
   */
  readonly atoms: readonly CrystalMoleculeAtom[];
  /** Its bonds, ordered on `from` then `to`. */
  readonly bonds: readonly CrystalMoleculeBond[];
  /** How many copies of it one cell holds. */
  readonly copies: number;
}

/** A set of atoms bonded to its own translate: a chain, a layer or a framework. */
export interface CrystalNetwork {
  /** The sites of the asymmetric unit it is built from, ascending. */
  readonly siteIndices: readonly number[];
  /** How many atoms of one cell belong to it, every symmetry copy included. */
  readonly cellAtoms: number;
  /** How many independent directions it extends along: 1, 2 or 3. */
  readonly periodicity: 1 | 2 | 3;
}

/** What `crystalMolecules` found. */
export interface CrystalMolecules {
  /**
   * One per crystallographically independent molecule — a lone ion or atom
   * included — ordered on the first site of the file each holds.
   */
  readonly molecules: readonly CrystalMolecule[];
  /** One per independent network, ordered the same way. */
  readonly networks: readonly CrystalNetwork[];
  /**
   * How many atoms one cell holds, once the disorder left out and the atoms
   * written twice are removed.
   */
  readonly cellAtoms: number;
  /** Whether the cell held more than `maxAtoms` atoms, so nothing was searched. */
  readonly tooLarge: boolean;
}
