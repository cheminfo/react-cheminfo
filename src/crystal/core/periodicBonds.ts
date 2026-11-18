/**
 * The bonds of one cell, found across its faces.
 *
 * The atoms are binned on a grid of the cell itself, each bin at least one
 * bond long across, so an atom is compared only with the atoms of its own bin
 * and of the bins around it — wrapped across the faces with the cell they lie
 * in — rather than with every atom of 27 cells. A cell a bond is longer than
 * is searched over as many cells as the bond can reach.
 */

import { createGrid } from './bondGrid.ts';
import type { Lattice } from './symmetry/lattice.ts';

/**
 * The longest bond between two elements, in ångström; 0 for a pair never
 * bonded.
 */
export type BondLimit = (a: string, b: string) => number;

/** One atom of a cell, in fractional coordinates. */
export interface PackedAtom {
  readonly element: string;
  readonly position: readonly [number, number, number];
}

/** The bonded pairs of one cell, each listed once. */
export interface PeriodicPairs {
  /** How many pairs. */
  readonly count: number;
  /** The first atom of each pair. */
  readonly from: Int32Array;
  /** The second atom of each pair; never lower than `from`. */
  readonly to: Int32Array;
  /** The cell `to` is bonded in, seen from `from`: three integers per pair. */
  readonly shifts: Int32Array;
  /** The length of each bond, Å. */
  readonly lengths: Float64Array;
  /**
   * The pairs of atoms closer than `samePlace`, which are one atom written
   * twice and are never bonded: `[i, j, i, j, …]`, each `i` below its `j`.
   */
  readonly coincident: Int32Array;
}

/** Options of {@link findPeriodicBonds}. */
export interface PeriodicBondOptions {
  /**
   * Two atoms closer than this, in ångström, are one atom written twice.
   * @default 1e-4
   */
  readonly samePlace?: number;
}

/**
 * Every bond of one cell, each from an atom of the cell to an atom of it or of
 * a cell around it.
 * @param atoms - The atoms of one cell, fractional, wrapped into [0, 1).
 * @param lattice - The cell they sit in.
 * @param bondLimit - When two atoms are bonded.
 * @param options - Options.
 * @returns The bonded pairs, and the atoms written twice.
 */
export function findPeriodicBonds(
  atoms: readonly PackedAtom[],
  lattice: Lattice,
  bondLimit: BondLimit,
  options: PeriodicBondOptions = {},
): PeriodicPairs {
  const { samePlace = 1e-4 } = options;
  const count = atoms.length;
  const kinds = elementKinds(atoms);
  const limits = pairLimits(kinds.symbols, bondLimit);
  let reach = samePlace;
  for (let index = 0; index < limits.length; index++) {
    reach = Math.max(reach, limits[index] ?? 0);
  }
  const xyz = cartesianOf(atoms, lattice);
  const grid = createGrid(atoms, lattice, reach);
  const found = new PairBuffer();
  const reachSquared = reach * reach;
  const sameSquared = samePlace * samePlace;
  const kindCount = kinds.symbols.length;
  const { counts, reaches, start, members, cells } = grid;
  const [na, nb, nc] = counts;
  const [ka, kb, kc] = reaches;
  const m = lattice.cartesian;

  for (let i = 0; i < count; i++) {
    const xi = xyz[i * 3] ?? 0;
    const yi = xyz[i * 3 + 1] ?? 0;
    const zi = xyz[i * 3 + 2] ?? 0;
    const row = (kinds.indices[i] ?? 0) * kindCount;
    for (let oa = -ka; oa <= ka; oa++) {
      const ta = (cells[i * 3] ?? 0) + oa;
      const sa = Math.floor(ta / na);
      for (let ob = -kb; ob <= kb; ob++) {
        const tb = (cells[i * 3 + 1] ?? 0) + ob;
        const sb = Math.floor(tb / nb);
        for (let oc = -kc; oc <= kc; oc++) {
          const tc = (cells[i * 3 + 2] ?? 0) + oc;
          const sc = Math.floor(tc / nc);
          const positive =
            sa > 0 || (sa === 0 && (sb > 0 || (sb === 0 && sc > 0)));
          const bin =
            ((ta - sa * na) * nb + (tb - sb * nb)) * nc + (tc - sc * nc);
          const ox = shiftAxis(m, 0, sa, sb, sc) - xi;
          const oy = shiftAxis(m, 1, sa, sb, sc) - yi;
          const oz = shiftAxis(m, 2, sa, sb, sc) - zi;
          const last = start[bin + 1] ?? 0;
          for (let slot = start[bin] ?? 0; slot < last; slot++) {
            const j = members[slot] ?? 0;
            if (j < i || (j === i && !positive)) continue;
            const dx = (xyz[j * 3] ?? 0) + ox;
            const dy = (xyz[j * 3 + 1] ?? 0) + oy;
            const dz = (xyz[j * 3 + 2] ?? 0) + oz;
            const squared = dx * dx + dy * dy + dz * dz;
            if (squared > reachSquared) continue;
            if (squared < sameSquared) {
              if (j !== i) found.coincide(i, j);
              continue;
            }
            const limit = limits[row + (kinds.indices[j] ?? 0)] ?? 0;
            if (squared > limit * limit) continue;
            found.bond(i, j, sa, sb, sc, Math.sqrt(squared));
          }
        }
      }
    }
  }
  return found.result();
}

function shiftAxis(
  m: number[][],
  axis: number,
  sa: number,
  sb: number,
  sc: number,
): number {
  const row = m[axis];
  return (row?.[0] ?? 0) * sa + (row?.[1] ?? 0) * sb + (row?.[2] ?? 0) * sc;
}

function cartesianOf(atoms: readonly PackedAtom[], lattice: Lattice) {
  const m = lattice.cartesian;
  const xyz = new Float64Array(atoms.length * 3);
  for (let index = 0; index < atoms.length; index++) {
    const [x, y, z] = (atoms[index] as PackedAtom).position;
    for (let axis = 0; axis < 3; axis++) {
      const row = m[axis];
      xyz[index * 3 + axis] =
        (row?.[0] ?? 0) * x + (row?.[1] ?? 0) * y + (row?.[2] ?? 0) * z;
    }
  }
  return xyz;
}

/**
 * The elements present, and which of them each atom is.
 * @param atoms - The atoms of the cell.
 * @returns The index of each atom’s element, and the elements.
 */
function elementKinds(atoms: readonly PackedAtom[]) {
  const indices = new Int32Array(atoms.length);
  const symbols: string[] = [];
  const known = new Map<string, number>();
  for (let index = 0; index < atoms.length; index++) {
    const element = (atoms[index] as PackedAtom).element;
    let kind = known.get(element);
    if (kind === undefined) {
      kind = symbols.length;
      known.set(element, kind);
      symbols.push(element);
    }
    indices[index] = kind;
  }
  return { indices, symbols };
}

/**
 * The bond limit of every pair of the elements present, row-major.
 * @param symbols - The elements present.
 * @param bondLimit - When two atoms are bonded.
 * @returns The limits, row-major over the elements present.
 */
function pairLimits(symbols: readonly string[], bondLimit: BondLimit) {
  const size = symbols.length;
  const limits = new Float64Array(size * size);
  for (let a = 0; a < size; a++) {
    for (let b = 0; b < size; b++) {
      const limit = bondLimit(symbols[a] ?? '', symbols[b] ?? '');
      limits[a * size + b] = Math.max(limit, 0);
    }
  }
  return limits;
}

/** The pairs as they are found, turned into typed arrays once at the end. */
class PairBuffer {
  readonly #from: number[] = [];
  readonly #to: number[] = [];
  readonly #shifts: number[] = [];
  readonly #lengths: number[] = [];
  readonly #coincident: number[] = [];

  bond(
    i: number,
    j: number,
    sa: number,
    sb: number,
    sc: number,
    length: number,
  ) {
    this.#from.push(i);
    this.#to.push(j);
    this.#shifts.push(sa, sb, sc);
    this.#lengths.push(length);
  }

  coincide(i: number, j: number) {
    this.#coincident.push(i, j);
  }

  result(): PeriodicPairs {
    return {
      count: this.#from.length,
      from: Int32Array.from(this.#from),
      to: Int32Array.from(this.#to),
      shifts: Int32Array.from(this.#shifts),
      lengths: Float64Array.from(this.#lengths),
      coincident: Int32Array.from(this.#coincident),
    };
  }
}
