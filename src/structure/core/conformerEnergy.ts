/**
 * Which energy of a conformer a reader is being shown.
 *
 * A refined conformer carries two of everything — what the force field said and
 * what the better method said afterwards — and a table that mixes them is a
 * ranking of nothing. So every column reads through one of these, and they all
 * take the same ranking.
 */

// Type-only, so nothing here pulls the generator — or openchemlib — into
// `react-cheminfo/core`, which every page loads.
import type { ConformerRanking } from './conformers.ts';

/**
 * What a refinement has to say for an energy column to read it.
 *
 * The structural minimum rather than the whole `ConformerRefinement`, so a site
 * that carries its conformers in a shape of its own — positions instead of a
 * molfile, say — can still be read by the same helpers and drawn by the same
 * table.
 */
export interface ConformerRowRefinement {
  /** The rank this conformer held before the refinement reordered the set. */
  forceFieldId: number;
  /** Total energy at the relaxed geometry, kcal/mol. */
  energy: number;
  /** Energy above the most stable refined conformer, kcal/mol. */
  relativeEnergy: number;
}

/**
 * The least a conformer must carry to be ranked and drawn.
 *
 * `Conformer` from `react-cheminfo/conformers` satisfies it, and so does any
 * per-site record that keeps the same three numbers.
 */
export interface ConformerRow {
  /** 1-based rank in the set, most stable first. */
  id: number;
  /** Total force-field energy in kcal/mol, `null` when not computed. */
  energy: number | null;
  /** Energy above the most stable conformer, `null` without an energy. */
  relativeEnergy: number | null;
  /**
   * What a better method said, once the set has been refined.
   * @default null
   */
  refinement?: ConformerRowRefinement | null;
}

/**
 * The energy above the most stable conformer, in the ranking asked for.
 * @param conformer - The conformer to read.
 * @param ranking - Which method's energies to read.
 * @default 'force-field'
 * @returns kcal/mol above the lowest, or `null` when that method produced none.
 */
export function relativeEnergyOf(
  conformer: ConformerRow,
  ranking: ConformerRanking = 'force-field',
): number | null {
  return ranking === 'refined'
    ? (conformer.refinement?.relativeEnergy ?? null)
    : conformer.relativeEnergy;
}

/**
 * The total energy, in the ranking asked for, so the two columns of a row
 * describe one method.
 * @param conformer - The conformer to read.
 * @param ranking - Which method's energies to read.
 * @default 'force-field'
 * @returns kcal/mol, or `null` when that method produced none.
 */
export function totalEnergyOf(
  conformer: ConformerRow,
  ranking: ConformerRanking = 'force-field',
): number | null {
  return ranking === 'refined'
    ? (conformer.refinement?.energy ?? null)
    : conformer.energy;
}

/**
 * The ranking a set should be read in: refined once anything has been refined,
 * the force field's until then.
 * @param conformers - The set to inspect.
 * @returns `'refined'` when at least one conformer carries a refinement.
 */
export function bestRanking(
  conformers: readonly ConformerRow[],
): ConformerRanking {
  for (const conformer of conformers) {
    if (conformer.refinement != null) return 'refined';
  }
  return 'force-field';
}
