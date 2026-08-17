/**
 * Slater's rules: how much of the nucleus an electron actually feels.
 *
 * A hydrogen-like orbital needs one number, the effective nuclear charge, and
 * taking the full `Z` would draw carbon's 2p six times too small. Slater's rules
 * estimate the shielding `S` from the other electrons, and `Z_eff = Z − S` is
 * what the radial function is built with.
 *
 * They are an empirical fit from 1930, not a calculation — but they are the ones
 * every general-chemistry course teaches, they reproduce the periodic trends
 * that matter (Z_eff rises across a period, barely moves down a group), and a
 * student can check the arithmetic here against the one they did by hand.
 *
 * The electrons are grouped as Slater grouped them, with s and p sharing a
 * group and each d and f standing alone:
 *
 * ```
 * [1s] [2s2p] [3s3p] [3d] [4s4p] [4d] [4f] [5s5p] [5d] [5f] [6s6p] [6d] [7s7p]
 * ```
 */

import type { Subshell, SubshellOccupancy } from './electronConfiguration.ts';

/** The shielding an orbital feels, and what is left of the nuclear charge. */
export interface Screening {
  /** Sum of the shielding contributions, `S`. */
  shielding: number;
  /** `Z − S`, the charge the hydrogen-like radial function is built with. */
  effectiveCharge: number;
}

/**
 * Apply Slater's rules to one subshell of one atom.
 * @param atomicNumber - Proton count, the `Z` the shielding is subtracted from.
 * @param configuration - Every occupied subshell of the atom.
 * @param subshell - The subshell whose electron is being screened.
 * @returns Its shielding and effective nuclear charge.
 */
export function slaterScreening(
  atomicNumber: number,
  configuration: readonly SubshellOccupancy[],
  subshell: Subshell,
): Screening {
  const rank = groupRank(subshell);
  const isCore = subshell.n === 1;
  const isDiffuse = subshell.l >= 2;
  let shielding = 0;
  for (const occupied of configuration) {
    const otherRank = groupRank(occupied);
    if (otherRank > rank) continue;
    if (otherRank === rank) {
      // An electron does not shield itself, so one is left out — but only from
      // its *own* subshell. 2s and 2p share a group, and every one of carbon's
      // two 2s electrons shields its 2p electron in full.
      const others = Math.max(
        0,
        occupied.electrons - (sameSubshell(occupied, subshell) ? 1 : 0),
      );
      shielding += others * (isCore ? 0.3 : 0.35);
      continue;
    }
    if (isDiffuse) {
      // A d or f electron is screened completely by everything inside it.
      shielding += occupied.electrons;
      continue;
    }
    shielding +=
      occupied.electrons * (occupied.n === subshell.n - 1 ? 0.85 : 1);
  }
  return {
    shielding,
    effectiveCharge: atomicNumber - shielding,
  };
}

/**
 * Where a subshell sits in Slater's left-to-right ordering of groups.
 *
 * s and p of the same shell share a group, so they share a rank; d and f each
 * get their own, placed after the s/p group of the same `n`.
 * @param subshell - The subshell to rank.
 * @returns A comparable rank; equal ranks mean the same Slater group.
 */
export function groupRank(subshell: Subshell): number {
  return subshell.n * 10 + (subshell.l <= 1 ? 0 : subshell.l);
}

function sameSubshell(first: Subshell, second: Subshell): boolean {
  return first.n === second.n && first.l === second.l;
}
