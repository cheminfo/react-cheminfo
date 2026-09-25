import { isSameShape } from './conformerMinimum.ts';
import type { ConformerShape } from './conformerShape.ts';
import type { Conformer } from './conformers.ts';

/** A refined conformer's energy and shape, which is what tells two minima apart. */
export interface RefinedMinimum {
  /** Refined total energy, kcal/mol. */
  energy: number;
  shape: ConformerShape;
}

/** A ranked set, and how far it moved from the order it came in. */
export interface RefinedRanking {
  /** The conformers, most stable first, renumbered from one in that order. */
  conformers: Conformer[];
  /** How many conformers ended up at a different position than they came in at. */
  reordered: number;
}

/**
 * Order refined conformers from the most stable down, number them from one in
 * that order, and measure every refined energy from the lowest.
 *
 * `reordered` counts the conformers whose position changed, which is the number
 * worth showing: it says how much the better method disagreed with the force
 * field.
 * @param conformers - The refined conformers, in the force field's own order.
 * @returns The ranked conformers and the disagreement count.
 */
export function rankByRefinedEnergy(
  conformers: readonly Conformer[],
): RefinedRanking {
  let lowest = Number.POSITIVE_INFINITY;
  for (const conformer of conformers) {
    const energy = conformer.refinement?.energy;
    if (energy !== undefined && energy < lowest) lowest = energy;
  }
  const ranked = conformers.toSorted(compareRefined);
  const result: Conformer[] = [];
  let reordered = 0;
  for (const [index, conformer] of ranked.entries()) {
    if (conformer.id !== index + 1) reordered++;
    const refinement = conformer.refinement;
    result.push({
      ...conformer,
      id: index + 1,
      refinement:
        refinement === null
          ? null
          : { ...refinement, relativeEnergy: refinement.energy - lowest },
    });
  }
  return { conformers: result, reordered };
}

/**
 * Whether a refined conformer landed in a minimum one of `kept` already holds:
 * the same energy within `tolerance`, and the same shape.
 * @param candidate - The refined conformer's energy and shape.
 * @param kept - The minima kept so far.
 * @param tolerance - Energy gap in kcal/mol under which two energies are one.
 * @returns `true` when one of them is the same minimum.
 */
export function isRefinedDuplicate(
  candidate: RefinedMinimum,
  kept: readonly RefinedMinimum[],
  tolerance: number,
): boolean {
  for (const entry of kept) {
    if (Math.abs(candidate.energy - entry.energy) > tolerance) continue;
    if (isSameShape(candidate.shape, entry.shape)) return true;
  }
  return false;
}

/**
 * Order two conformers by refined energy; one without a refinement ranks after
 * every one that has one.
 * @param a - One conformer.
 * @param b - The other.
 * @returns Negative when `a` is the more stable, positive when `b` is.
 */
function compareRefined(a: Conformer, b: Conformer): number {
  const energyA = a.refinement?.energy;
  const energyB = b.refinement?.energy;
  if (energyA === undefined) return energyB === undefined ? 0 : 1;
  if (energyB === undefined) return -1;
  return energyA - energyB;
}
