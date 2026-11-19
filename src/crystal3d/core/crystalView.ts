/**
 * What a crystal view draws, from the atoms of one cell: its molecules whole
 * or the atoms the cell walls cut, repeated over as many cells as fit.
 */

import { packMolecules } from '../../crystal/core/packing.ts';
import type {
  BondLimit,
  PackedAtom,
} from '../../crystal/core/periodicBonds.ts';
import type { Lattice } from '../../crystal/core/symmetry/lattice.ts';
import { fractionalToCartesian } from '../../crystal/core/symmetry/lattice.ts';

import { largestRepeatThatFits } from './cellStack.ts';
import { supercellAtoms } from './supercell.ts';
import type { ViewerAtom } from './types.ts';

/**
 * How the cell is drawn: each molecule whole, in the cell its centre falls in,
 * or every atom inside the cell, cut where its walls cut it.
 */
export type CrystalPacking = 'molecules' | 'cell';

/** Every packing, in the order a control offers them. */
export const CRYSTAL_PACKINGS: readonly CrystalPacking[] = [
  'molecules',
  'cell',
];

/**
 * Which bonds are drawn: every one, all but those to a metal atom (molstar
 * draws those dashed, and a coordination network of them hides the rest), or
 * none.
 */
export type CrystalBonds = 'all' | 'noMetal' | 'none';

/** Every choice of bonds, in the order a control offers them. */
export const CRYSTAL_BONDS: readonly CrystalBonds[] = [
  'all',
  'noMetal',
  'none',
];

/** The cells along each axis a control offers, and a link may ask for. */
export const CELL_COUNT_RANGE = { minimum: 1, maximum: 4 } as const;

/** Options of {@link crystalView}. */
export interface CrystalViewOptions {
  /**
   * How the cell is drawn.
   * @default 'molecules'
   */
  packing?: CrystalPacking;
  /**
   * Cells along each axis asked for; fewer are drawn when they would hold too
   * many atoms.
   * @default 1
   */
  cells?: number;
  /**
   * When two atoms are bonded, which is what completes a molecule. Pass the
   * rule the viewer draws bonds with, so what is completed is what is joined.
   */
  bondLimit: BondLimit;
}

/** What {@link crystalView} found. */
export interface CrystalView {
  /** The atoms to draw, Cartesian ångström, repeated over the cells. */
  readonly atoms: ViewerAtom[];
  /** Cells drawn along each axis: what was asked, or fewer. */
  readonly cells: number;
  /** Atoms in one cell, as drawn. */
  readonly atomsPerCell: number;
  /** Molecules in one cell, 0 when the cell is drawn as it is cut. */
  readonly molecules: number;
  /** Whether some atoms belong to a network running through the crystal. */
  readonly extended: boolean;
}

/**
 * The atoms a crystal view draws.
 * @param cellAtoms - Every atom of one cell, fractional, wrapped into [0, 1).
 * @param lattice - The cell they sit in.
 * @param options - See {@link CrystalViewOptions}.
 * @returns The atoms and what they hold.
 */
export function crystalView(
  cellAtoms: readonly PackedAtom[],
  lattice: Lattice,
  options: CrystalViewOptions,
): CrystalView {
  const { packing = 'molecules', cells: asked = 1, bondLimit } = options;
  const packed =
    packing === 'molecules'
      ? packMolecules(cellAtoms, lattice, bondLimit)
      : { atoms: cellAtoms, molecules: 0, extended: false };
  const cells = largestRepeatThatFits(packed.atoms.length, asked);
  const oneCell: ViewerAtom[] = [];
  for (const atom of packed.atoms) {
    const [x = 0, y = 0, z = 0] = fractionalToCartesian(lattice, atom.position);
    oneCell.push({ element: atom.element, position: [x, y, z] });
  }
  return {
    atoms: supercellAtoms(oneCell, lattice.cell, [cells, cells, cells]),
    cells,
    atomsPerCell: packed.atoms.length,
    molecules: packed.molecules,
    extended: packed.extended,
  };
}

/** How a crystal view is set: what a control changes and a link may carry. */
export interface CrystalViewSettings {
  /** How the cell is drawn. */
  readonly packing: CrystalPacking;
  /** Cells along each axis. */
  readonly cells: number;
  /** Whether the box of the unit cell is drawn. */
  readonly unitCell: boolean;
  /** Which bonds are drawn. */
  readonly bonds: CrystalBonds;
}

/** One cell, its molecules whole, inside its box. */
export const DEFAULT_CRYSTAL_VIEW_SETTINGS: CrystalViewSettings = {
  packing: 'molecules',
  cells: 1,
  unitCell: true,
  bonds: 'all',
};
