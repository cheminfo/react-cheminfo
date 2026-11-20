/**
 * The partial bonds of a geometry: pairs of atoms a little too far apart to be
 * bonded, as the bonds being formed and broken in a transition state are.
 *
 * A viewer that infers bonds from distances drops exactly those, so a
 * transition state loses the feature it is about. A pair is a partial bond
 * when it is longer than the longest bond between its elements, but not by
 * more than its {@link PartialBondReach} allows, and when its two atoms are
 * neither both hydrogens nor within two bonds of each other: a 1,3 pair is the
 * two ends of a bond angle, never a bond. Nor does one pass through a third
 * atom: the oxygens either side of a proton in flight are joined through it.
 *
 * Free of molstar: the bonding rule is handed in, so the viewer passes the one
 * it bonds by and a page listing the partial bonds beside it can do the same.
 */

import { BondNeighbours } from './bondNeighbours.ts';
import type { PartialBondReach } from './partialBondRanges.ts';
import {
  FAR_PARTIAL_BOND,
  NEAR_PARTIAL_BOND,
  elementKinds,
  pairRanges,
} from './partialBondRanges.ts';

/** The atoms a partial bond is looked for between. */
export interface PartialBondGeometry {
  /** The element of each atom, e.g. `C`. */
  readonly elements: readonly string[];
  /** Cartesian coordinates, ångström: x, y and z of each atom in turn. */
  readonly coordinates: ArrayLike<number>;
  /** The bonds already drawn, in atom-index pairs: `[a0, b0, a1, b1, …]`. */
  readonly bonds: ArrayLike<number>;
}

/** Options of {@link findPartialBonds}. */
export interface PartialBondOptions {
  /**
   * The longest bond between two elements, ångström, and 0 for a pair never
   * bonded: the viewer passes molstar's own, `bondLimit` from
   * `react-cheminfo/molstar/bonds`.
   */
  readonly bondLimit: (a: string, b: string) => number;
  /**
   * The reach of a pair three bonds apart, or holding a hydrogen.
   * @default NEAR_PARTIAL_BOND
   */
  readonly near?: PartialBondReach;
  /**
   * The reach of any other pair.
   * @default FAR_PARTIAL_BOND
   */
  readonly far?: PartialBondReach;
}

/** One partial bond. */
export interface PartialBond {
  /** One atom, from 0 in the order of the geometry. */
  readonly first: number;
  /** The other, always after `first`. */
  readonly second: number;
  /** Their distance, Å. */
  readonly distance: number;
}

/**
 * Every partial bond of a geometry.
 * @param geometry - The atoms and the bonds already drawn between them.
 * @param options - The bonding rule, and how far past it to look.
 * @returns The partial bonds, ordered by `first` then `second`.
 */
export function findPartialBonds(
  geometry: PartialBondGeometry,
  options: PartialBondOptions,
): PartialBond[] {
  const { elements, coordinates, bonds } = geometry;
  const count = Math.min(elements.length, Math.floor(coordinates.length / 3));
  const kinds = elementKinds(elements, count);
  const ranges = pairRanges(
    kinds.symbols,
    options.bondLimit,
    options.near ?? NEAR_PARTIAL_BOND,
    options.far ?? FAR_PARTIAL_BOND,
  );
  const kindCount = kinds.symbols.length;
  const neighbours = new BondNeighbours(count, bonds);
  const order = alongX(coordinates, count);
  const found: PartialBond[] = [];

  for (let p = 0; p < count; p++) {
    const i = order[p] ?? 0;
    const xi = coordinates[i * 3] ?? 0;
    const yi = coordinates[i * 3 + 1] ?? 0;
    const zi = coordinates[i * 3 + 2] ?? 0;
    const row = (kinds.indices[i] ?? 0) * kindCount;
    for (let q = p + 1; q < count; q++) {
      const j = order[q] ?? 0;
      const dx = (coordinates[j * 3] ?? 0) - xi;
      if (dx > ranges.longest) break;
      const dy = (coordinates[j * 3 + 1] ?? 0) - yi;
      const dz = (coordinates[j * 3 + 2] ?? 0) - zi;
      const squared = dx * dx + dy * dy + dz * dz;
      const pair = row + (kinds.indices[j] ?? 0);
      const lower = ranges.limit[pair] ?? 0;
      const far = ranges.far[pair] ?? 0;
      if (squared <= lower * lower || squared > far * far) continue;
      const separation = neighbours.separation(i, j);
      if (separation < 3) continue;
      const near = ranges.near[pair] ?? 0;
      if (separation === 3 && squared > near * near) continue;
      if (passesThroughAtom(coordinates, count, i, j, squared)) continue;
      found.push({
        first: Math.min(i, j),
        second: Math.max(i, j),
        distance: Math.sqrt(squared),
      });
    }
  }
  return found.toSorted(
    (one, other) => one.first - other.first || one.second - other.second,
  );
}

/**
 * The atoms in increasing x, so that a pair further apart along x than the
 * longest partial bond ends the search from its first atom.
 * @param coordinates - x, y, z of each atom.
 * @param count - How many atoms.
 * @returns Atom indices.
 */
function alongX(coordinates: ArrayLike<number>, count: number): Int32Array {
  const order = new Int32Array(count);
  for (let atom = 0; atom < count; atom++) order[atom] = atom;
  return order.toSorted(
    (a, b) => (coordinates[a * 3] ?? 0) - (coordinates[b * 3] ?? 0),
  );
}

/**
 * Whether a third atom stands between two, nearly on the line joining them:
 * seen from it, the two make an angle of 150° or more.
 * @param coordinates - x, y, z of each atom.
 * @param count - How many atoms.
 * @param i - One end.
 * @param j - The other.
 * @param squared - Their squared distance.
 * @returns True when the line from `i` to `j` passes through an atom.
 */
function passesThroughAtom(
  coordinates: ArrayLike<number>,
  count: number,
  i: number,
  j: number,
  squared: number,
): boolean {
  for (let k = 0; k < count; k++) {
    if (k === i || k === j) continue;
    const toI = squaredDistance(coordinates, k, i);
    const toJ = squaredDistance(coordinates, k, j);
    if (toI >= squared || toJ >= squared) continue;
    // The law of cosines, at k.
    const cosine = (toI + toJ - squared) / (2 * Math.sqrt(toI * toJ));
    if (cosine <= THROUGH_COSINE) return true;
  }
  return false;
}

/** cos 150°. */
const THROUGH_COSINE = -Math.sqrt(3) / 2;

function squaredDistance(
  coordinates: ArrayLike<number>,
  a: number,
  b: number,
): number {
  const dx = (coordinates[a * 3] ?? 0) - (coordinates[b * 3] ?? 0);
  const dy = (coordinates[a * 3 + 1] ?? 0) - (coordinates[b * 3 + 1] ?? 0);
  const dz = (coordinates[a * 3 + 2] ?? 0) - (coordinates[b * 3 + 2] ?? 0);
  return dx * dx + dy * dy + dz * dz;
}
