/**
 * How the electrons of one atom are laid out over its orbitals, and the two
 * adjustments a *virtual* orbital needs.
 *
 * Split out of `atomicOrbitals.ts` so that module stays what it says it is —
 * the join of a configuration, a screening, a radial function and a harmonic —
 * with none of the bookkeeping in the way.
 */

import type { SubshellOccupancy } from './electronConfiguration.ts';
import { groupRank } from './screening.ts';

/** No known element occupies a shell above n = 7. */
const HIGHEST_SHELL = 7;

/**
 * Slater's rules can hand a badly-screened orbital a charge at or below zero —
 * a 7p on hydrogen, say — which has no bound hydrogen-like solution. Clamping
 * to a small positive charge keeps such an orbital enormous and diffuse, which
 * is the honest picture, rather than throwing.
 */
export const MINIMUM_CHARGE = 0.3;

/**
 * Spread electrons over the orbitals of a subshell by Hund's rule.
 * @param electrons - Electrons in the subshell.
 * @param orbitalCount - `2ℓ + 1`.
 * @returns One count per orbital: singles first, then pairs.
 */
export function hundDistribution(
  electrons: number,
  orbitalCount: number,
): number[] {
  const spread = new Array<number>(orbitalCount).fill(0);
  const capacity = orbitalCount * 2;
  let left = Math.min(electrons, capacity);
  for (let pass = 0; pass < 2 && left > 0; pass++) {
    for (let index = 0; index < orbitalCount && left > 0; index++) {
      spread[index] = (spread[index] as number) + 1;
      left -= 1;
    }
  }
  return spread;
}

/**
 * How far up the list goes when the caller does not say.
 * @param valenceShell - Outermost occupied shell.
 * @returns One shell past it, never below 4 and never above 7.
 */
export function defaultMaximumShell(valenceShell: number): number {
  return Math.min(HIGHEST_SHELL, Math.max(4, valenceShell + 1));
}

/**
 * The configuration with one electron taken out of the outermost occupied
 * subshell — the atom as it is while one of its electrons sits in a virtual
 * orbital.
 * @param configuration - The ground-state configuration to reduce.
 * @returns The reduced configuration, empty subshells dropped.
 */
export function withoutOutermostElectron(
  configuration: readonly SubshellOccupancy[],
): SubshellOccupancy[] {
  let outermost = -1;
  for (let index = 0; index < configuration.length; index++) {
    const entry = configuration[index] as SubshellOccupancy;
    const best = configuration[outermost];
    if (
      outermost === -1 ||
      best === undefined ||
      groupRank(entry) > groupRank(best)
    ) {
      outermost = index;
    }
  }
  const reduced: SubshellOccupancy[] = [];
  for (let index = 0; index < configuration.length; index++) {
    const entry = configuration[index] as SubshellOccupancy;
    const electrons =
      index === outermost ? entry.electrons - 1 : entry.electrons;
    if (electrons > 0) reduced.push({ ...entry, electrons });
  }
  return reduced;
}

/**
 * The outermost shell an atom actually occupies.
 * @param configuration - Its configuration.
 * @returns The largest `n` holding an electron.
 */
export function outermostShell(
  configuration: readonly SubshellOccupancy[],
): number {
  let outermost = 1;
  for (const entry of configuration) {
    if (entry.electrons > 0 && entry.n > outermost) outermost = entry.n;
  }
  return outermost;
}
