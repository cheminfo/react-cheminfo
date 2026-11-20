/**
 * The distances a partial bond may span, per pair of elements.
 */

/** How far past the bonding limit a partial bond may be. */
export interface PartialBondReach {
  /** The most a partial bond may be, as a multiple of the bonding limit. */
  readonly stretch: number;
  /** And the most it may exceed the limit by, Å. */
  readonly reach: number;
}

/**
 * The reach of a pair three bonds apart, or holding a hydrogen: 1.4 times the
 * limit, and at most 0.7 Å past it — 2.45 Å for C–C.
 *
 * Three bonds apart, the ends of a ring are already close: 2.59 Å across
 * bicyclo[2.2.2]octane, 2.63 Å across a boat cyclohexane. With a hydrogen, the
 * stretch stops short of a hydrogen bond: O–H is bonded up to 1.1 Å, and
 * O–H···O starts near 1.6 Å. The 0.7 Å holds back the elements whose limit is
 * long already: 1.4 times the 2.48 Å of C–I would reach the carbon three bonds
 * away in a gauche iodoalkane, at 3.4 Å.
 */
export const NEAR_PARTIAL_BOND: PartialBondReach = { stretch: 1.4, reach: 0.7 };

/**
 * The reach of two heavy atoms further apart, or in separate molecules: 1.5
 * times the limit, and at most 0.85 Å past it — 2.6 Å for C–C, which takes in
 * the forming bonds of the usual transition states, 2.0–2.6 Å, while two
 * molecules merely in contact are 3.2 Å apart or more.
 */
export const FAR_PARTIAL_BOND: PartialBondReach = { stretch: 1.5, reach: 0.85 };

/** The limits of every pair of elements, row-major over the elements present. */
export interface PairRanges {
  /** The longest bond, Å; a partial bond is longer. */
  readonly limit: Float64Array;
  /** The longest partial bond three bonds apart, or with a hydrogen, Å. */
  readonly near: Float64Array;
  /** The longest partial bond otherwise, Å. */
  readonly far: Float64Array;
  /** The longest partial bond of all, Å. */
  readonly longest: number;
}

/**
 * The bonding limit and the two partial bond limits of every pair of the
 * elements present, row-major; all 0 for a pair never partially bonded.
 * @param symbols - The elements present.
 * @param bondLimit - The longest bond between two elements, 0 for never.
 * @param nearReach - The reach of a pair three bonds apart, or with a hydrogen.
 * @param farReach - The reach of any other pair.
 * @returns The limits, and the longest partial bond of all.
 */
export function pairRanges(
  symbols: readonly string[],
  bondLimit: (a: string, b: string) => number,
  nearReach: PartialBondReach,
  farReach: PartialBondReach,
): PairRanges {
  const size = symbols.length;
  const limit = new Float64Array(size * size);
  const near = new Float64Array(size * size);
  const far = new Float64Array(size * size);
  let longest = 0;
  for (let a = 0; a < size; a++) {
    for (let b = 0; b < size; b++) {
      const first = symbols[a] ?? '';
      const second = symbols[b] ?? '';
      const bonded = bondLimit(first, second);
      const hydrogens = Number(isHydrogen(first)) + Number(isHydrogen(second));
      if (!(bonded > 0) || hydrogens === 2) continue;
      const cell = a * size + b;
      const nearest = reachOf(bonded, nearReach);
      const farthest =
        hydrogens === 1
          ? nearest
          : Math.max(nearest, reachOf(bonded, farReach));
      limit[cell] = bonded;
      near[cell] = nearest;
      far[cell] = farthest;
      longest = Math.max(longest, farthest);
    }
  }
  return { limit, near, far, longest };
}

function reachOf(limit: number, { stretch, reach }: PartialBondReach): number {
  return Math.max(limit, Math.min(limit * stretch, limit + reach));
}

// Hydrogen and its isotopes, written as molstar reads them.
function isHydrogen(symbol: string): boolean {
  return HYDROGENS.has(symbol.toUpperCase());
}

const HYDROGENS: ReadonlySet<string> = new Set(['H', 'D', 'T']);

/**
 * The elements present, and which of them each atom is.
 * @param elements - The element of each atom.
 * @param count - How many atoms are read.
 * @returns The index of each atom's element, and the elements.
 */
export function elementKinds(elements: readonly string[], count: number) {
  const indices = new Int32Array(count);
  const symbols: string[] = [];
  const known = new Map<string, number>();
  for (let atom = 0; atom < count; atom++) {
    const element = elements[atom] ?? '';
    let kind = known.get(element);
    if (kind === undefined) {
      kind = symbols.length;
      known.set(element, kind);
      symbols.push(element);
    }
    indices[atom] = kind;
  }
  return { indices, symbols };
}
