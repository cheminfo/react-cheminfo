/**
 * Sets of indices joined two at a time (union–find): which ends of the pieces
 * of a bench stand on one conductor, which conductors one circuit joins.
 */

/** Indices from 0 to a size, each in a set of its own until joined. */
export class DisjointSets {
  readonly #parent: Int32Array;

  /**
   * Every index in a set of its own.
   * @param size - How many indices.
   */
  public constructor(size: number) {
    this.#parent = new Int32Array(size);
    for (let index = 0; index < size; index++) this.#parent[index] = index;
  }

  /**
   * The set an index is in, named by its smallest index.
   * @param index - The index.
   * @returns The smallest index of its set.
   */
  public find(index: number): number {
    const parent = this.#parent;
    let root = index;
    while ((parent[root] ?? root) !== root) root = parent[root] ?? root;
    // Every index on the way points at the root, so the next look is short.
    let current = index;
    while (current !== root) {
      const next = parent[current] ?? root;
      parent[current] = root;
      current = next;
    }
    return root;
  }

  /**
   * Join the sets of two indices.
   * @param first - One index.
   * @param second - The other.
   * @returns Whether they were in two sets before.
   */
  public union(first: number, second: number): boolean {
    const a = this.find(first);
    const b = this.find(second);
    if (a === b) return false;
    // The smaller index stays the name, so a set is named the same way
    // whatever order its members were joined in.
    if (a < b) this.#parent[b] = a;
    else this.#parent[a] = b;
    return true;
  }
}
