/**
 * How many bonds apart two atoms are, counted along the bonds drawn, up to
 * three: a pair within two bonds is never a partial bond, and a pair three
 * bonds apart is held to a shorter one.
 */

import type { BondGraph } from '../../crystal/core/components.ts';
import { bondGraph } from '../../crystal/core/components.ts';

/**
 * Answers, for one atom at a time, how far other atoms are along the bonds.
 *
 * The atoms within two bonds of the atom asked about are stamped once, so every
 * pair tested from it costs the neighbours of the other atom only.
 */
export class BondNeighbours {
  readonly #graph: BondGraph;
  // within[atom] === from: the atom is `from` or one of its neighbours.
  readonly #within: Int32Array;
  // second[atom] === from: the atom is two bonds from `from`, and no closer.
  readonly #second: Int32Array;
  #stamped = -1;

  /**
   * Index the bonds of `count` atoms.
   * @param count - How many atoms.
   * @param bonds - Atom-index pairs; a pair naming an atom out of range, or
   * one atom twice, is skipped.
   */
  constructor(count: number, bonds: ArrayLike<number>) {
    this.#graph = bondGraph(count, periodicPairs(count, bonds));
    this.#within = new Int32Array(count).fill(-1);
    this.#second = new Int32Array(count).fill(-1);
  }

  /**
   * How many bonds separate two atoms.
   * @param from - One atom; asking from the same atom in a row is cheapest.
   * @param to - The other.
   * @returns 0 for one atom, 1 for a bonded pair, 2 for a pair with a common
   * neighbour, 3 for a pair three bonds apart, and `Infinity` beyond.
   */
  separation(from: number, to: number): number {
    if (from === to) return 0;
    if (this.#stamped !== from) this.#stamp(from);
    if (this.#within[to] === from) return 1;
    const { offsets, targets } = this.#graph;
    let closest = Infinity;
    const last = offsets[to + 1] ?? 0;
    for (let slot = offsets[to] ?? 0; slot < last; slot++) {
      const neighbour = targets[slot] ?? 0;
      if (this.#within[neighbour] === from) return 2;
      if (this.#second[neighbour] === from) closest = 3;
    }
    return closest;
  }

  #stamp(from: number): void {
    const { offsets, targets } = this.#graph;
    const within = this.#within;
    const second = this.#second;
    this.#stamped = from;
    within[from] = from;
    const last = offsets[from + 1] ?? 0;
    for (let slot = offsets[from] ?? 0; slot < last; slot++) {
      within[targets[slot] ?? 0] = from;
    }
    for (let slot = offsets[from] ?? 0; slot < last; slot++) {
      const neighbour = targets[slot] ?? 0;
      const end = offsets[neighbour + 1] ?? 0;
      for (let next = offsets[neighbour] ?? 0; next < end; next++) {
        const atom = targets[next] ?? 0;
        if (within[atom] !== from) second[atom] = from;
      }
    }
  }
}

/**
 * The bonds as the pairs `bondGraph` reads, all within one cell.
 * @param count - How many atoms.
 * @param bonds - Atom-index pairs.
 * @returns The valid pairs.
 */
function periodicPairs(count: number, bonds: ArrayLike<number>) {
  const from: number[] = [];
  const to: number[] = [];
  const pairs = Math.floor(bonds.length / 2);
  for (let pair = 0; pair < pairs; pair++) {
    const a = bonds[pair * 2] ?? -1;
    const b = bonds[pair * 2 + 1] ?? -1;
    if (!isAtom(a, count) || !isAtom(b, count) || a === b) continue;
    from.push(a);
    to.push(b);
  }
  return {
    count: from.length,
    from: Int32Array.from(from),
    to: Int32Array.from(to),
    shifts: new Int32Array(from.length * 3),
    lengths: new Float64Array(from.length),
    coincident: new Int32Array(0),
  };
}

function isAtom(index: number, count: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < count;
}
