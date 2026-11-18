/**
 * The cell read as the periodic graph it is: which atoms are bonded, across
 * which face, and which sets of them reach their own translate.
 */

import type { PeriodicPairs } from './periodicBonds.ts';

/** Every bond of a cell from each atom's side, listed contiguously per atom. */
export interface BondGraph {
  /** `offsets[i]` to `offsets[i + 1]` index the bonds of atom `i`. */
  readonly offsets: Int32Array;
  /** The atom each bond reaches. */
  readonly targets: Int32Array;
  /** The cell it is reached in, three integers per bond. */
  readonly shifts: Int32Array;
  /** The bond length, Å. */
  readonly lengths: Float64Array;
}

/** One connected set of atoms. */
export interface PeriodicComponent {
  /** Its atoms, in the order the walk reached them. */
  readonly atoms: readonly number[];
  /**
   * How many independent directions it repeats along: 0 for a molecule, 1 for
   * a chain, 2 for a layer, 3 for a framework.
   */
  readonly periodicity: 0 | 1 | 2 | 3;
}

/** The connected sets of a cell, and the cell each atom was reached in. */
export interface ComponentWalk {
  readonly components: readonly PeriodicComponent[];
  /**
   * The cell each atom was reached in, three integers per atom: an atom's
   * position plus its shift puts a molecule back together.
   */
  readonly shifts: Int32Array;
}

/**
 * Turn a list of pairs into each atom's bonds.
 * @param atomCount - How many atoms the cell holds.
 * @param pairs - What `findPeriodicBonds` returned.
 * @param keep - One flag per pair, 0 to leave it out.
 *   @default every pair kept
 * @returns The bonds of each atom, both directions of every pair listed.
 */
export function bondGraph(
  atomCount: number,
  pairs: PeriodicPairs,
  keep?: Uint8Array,
): BondGraph {
  const offsets = new Int32Array(atomCount + 1);
  for (let pair = 0; pair < pairs.count; pair++) {
    if (keep?.[pair] === 0) continue;
    const from = pairs.from[pair] ?? 0;
    const to = pairs.to[pair] ?? 0;
    offsets[from + 1] = (offsets[from + 1] ?? 0) + 1;
    offsets[to + 1] = (offsets[to + 1] ?? 0) + 1;
  }
  for (let atom = 0; atom < atomCount; atom++) {
    offsets[atom + 1] = (offsets[atom + 1] ?? 0) + (offsets[atom] ?? 0);
  }
  const total = offsets[atomCount] ?? 0;
  const targets = new Int32Array(total);
  const shifts = new Int32Array(total * 3);
  const lengths = new Float64Array(total);
  const cursor = offsets.slice(0, atomCount);
  for (let pair = 0; pair < pairs.count; pair++) {
    if (keep?.[pair] === 0) continue;
    const from = pairs.from[pair] ?? 0;
    const to = pairs.to[pair] ?? 0;
    const length = pairs.lengths[pair] ?? 0;
    for (let side = 0; side < 2; side++) {
      const atom = side === 0 ? from : to;
      const slot = cursor[atom] ?? 0;
      cursor[atom] = slot + 1;
      targets[slot] = side === 0 ? to : from;
      lengths[slot] = length;
      const sign = side === 0 ? 1 : -1;
      for (let axis = 0; axis < 3; axis++) {
        shifts[slot * 3 + axis] = sign * (pairs.shifts[pair * 3 + axis] ?? 0);
      }
    }
  }
  return { offsets, targets, shifts, lengths };
}

/**
 * Walk every connected set of atoms, noting which cell each atom is reached
 * in. Reaching an atom a second time in another cell means the set is bonded
 * to its own translate, and the independent translations met that way say
 * along how many directions it extends.
 * @param graph - The bonds of each atom.
 * @param skip - One flag per atom, 1 for an atom that belongs to no set.
 *   @default no atom skipped
 * @returns The sets, in the order of their lowest atom, and each atom's cell.
 */
export function walkComponents(
  graph: BondGraph,
  skip?: Uint8Array,
): ComponentWalk {
  const count = graph.offsets.length - 1;
  const seen = new Uint8Array(count);
  const shifts = new Int32Array(count * 3);
  const components: PeriodicComponent[] = [];
  for (let start = 0; start < count; start++) {
    if (seen[start] === 1 || skip?.[start] === 1) continue;
    components.push(walkOne(start, graph, seen, shifts));
  }
  return { components, shifts };
}

function walkOne(
  start: number,
  graph: BondGraph,
  seen: Uint8Array,
  shifts: Int32Array,
): PeriodicComponent {
  const atoms = [start];
  const basis: number[][] = [];
  seen[start] = 1;
  for (let head = 0; head < atoms.length; head++) {
    const from = atoms[head] ?? 0;
    const last = graph.offsets[from + 1] ?? 0;
    for (let bond = graph.offsets[from] ?? 0; bond < last; bond++) {
      const to = graph.targets[bond] ?? 0;
      const a = (shifts[from * 3] ?? 0) + (graph.shifts[bond * 3] ?? 0);
      const b = (shifts[from * 3 + 1] ?? 0) + (graph.shifts[bond * 3 + 1] ?? 0);
      const c = (shifts[from * 3 + 2] ?? 0) + (graph.shifts[bond * 3 + 2] ?? 0);
      if (seen[to] === 1) {
        if (basis.length < 3) {
          addTranslation(
            basis,
            a - (shifts[to * 3] ?? 0),
            b - (shifts[to * 3 + 1] ?? 0),
            c - (shifts[to * 3 + 2] ?? 0),
          );
        }
        continue;
      }
      seen[to] = 1;
      shifts[to * 3] = a;
      shifts[to * 3 + 1] = b;
      shifts[to * 3 + 2] = c;
      atoms.push(to);
    }
  }
  return { atoms, periodicity: basis.length as 0 | 1 | 2 | 3 };
}

/**
 * Keep a lattice translation when it is independent of those already kept.
 * @param basis - The independent translations kept so far.
 * @param a - The translation along a, in cells.
 * @param b - The translation along b, in cells.
 * @param c - The translation along c, in cells.
 */
function addTranslation(basis: number[][], a: number, b: number, c: number) {
  if (a === 0 && b === 0 && c === 0) return;
  const [first, second] = basis;
  if (first === undefined) {
    basis.push([a, b, c]);
    return;
  }
  const cross = [
    (first[1] ?? 0) * c - (first[2] ?? 0) * b,
    (first[2] ?? 0) * a - (first[0] ?? 0) * c,
    (first[0] ?? 0) * b - (first[1] ?? 0) * a,
  ];
  if (second === undefined) {
    if (cross[0] !== 0 || cross[1] !== 0 || cross[2] !== 0) {
      basis.push([a, b, c]);
    }
    return;
  }
  const volume =
    (second[0] ?? 0) * (cross[0] ?? 0) +
    (second[1] ?? 0) * (cross[1] ?? 0) +
    (second[2] ?? 0) * (cross[2] ?? 0);
  if (volume !== 0) basis.push([a, b, c]);
}
