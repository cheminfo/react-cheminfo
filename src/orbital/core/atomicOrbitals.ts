/**
 * Every orbital of one element, assembled from the four parts that describe it.
 *
 * The configuration says which subshells hold electrons, Slater's rules say how
 * strongly each is bound, the hydrogen-like radial function gives it a size and
 * its radial nodes, and a real spherical harmonic gives it a shape. This module
 * is only the join — it computes nothing itself, which is what keeps each of
 * those four testable on its own.
 *
 * Electrons inside a subshell are spread by Hund's rule: every orbital of the
 * subshell takes one before any takes a second. That is why nitrogen shows
 * three singly-occupied 2p orbitals and oxygen one pair and two singles.
 */

import {
  MADELUNG_ORDER,
  configurationOf,
  subshellLabel,
} from './electronConfiguration.ts';
import type { HydrogenicParameters } from './hydrogenic.ts';
import { meanRadius, orbitalEnergy, radialNodeCount } from './hydrogenic.ts';
import {
  MINIMUM_CHARGE,
  defaultMaximumShell,
  hundDistribution,
  outermostShell,
  withoutOutermostElectron,
} from './occupancy.ts';
import type { RealHarmonic } from './realHarmonics.ts';
import { harmonicsOf, subshellLetter } from './realHarmonics.ts';
import { slaterScreening } from './screening.ts';

/** One atomic orbital of one element: a shape, a size and an occupancy. */
export interface AtomicOrbital {
  /** Url-safe and unique within the element, e.g. `3dx2-y2`. */
  id: string;
  n: number;
  /** Angular momentum quantum number: 0 = s, 1 = p, 2 = d, 3 = f. */
  l: number;
  /** Which of the `2ℓ + 1` real harmonics of the subshell. */
  harmonic: RealHarmonic;
  /** Subshell name without the subscript, e.g. `3d`. */
  shell: string;
  /** Electrons in this one orbital: 0, 1 or 2, after Hund's rule. */
  electrons: number;
  /** Electrons in the whole subshell. */
  subshellElectrons: number;
  /** Effective nuclear charge from Slater's rules. */
  effectiveCharge: number;
  /** Shielding `S` those rules produced. */
  shielding: number;
  /** `−13.6 Z_eff²/n²`, electronvolts. */
  energy: number;
  /** `n − ℓ − 1` spheres on which the wavefunction changes sign. */
  radialNodes: number;
  /** ℓ planes or cones on which it changes sign. */
  angularNodes: number;
  /** `⟨r⟩`, ångström. */
  meanRadius: number;
  /** True when the subshell is empty in the ground state. */
  isVirtual: boolean;
  /** True when this is the outermost occupied shell. */
  isValence: boolean;
}

/** Options for {@link atomicOrbitalsOf}. */
export interface AtomicOrbitalOptions {
  /**
   * Highest principal quantum number to include. Defaults to one shell past
   * the outermost occupied one, and never below 4 — a hydrogen atom whose list
   * stopped at 2p would be missing exactly the 3d and 4f pictures it is famous
   * for.
   * @default max(4, outermost occupied n + 1), capped at 7
   */
  maximumShell?: number;
}

/**
 * Every orbital of an element, in Madelung (roughly energetic) order.
 * @param atomicNumber - Proton count, 1 to 118.
 * @param options - See {@link AtomicOrbitalOptions}.
 * @returns The orbitals, occupied ones first in filling order and the empty
 * ones after them in the same order.
 * @throws {Error} When the atomic number is outside the periodic table.
 */
export function atomicOrbitalsOf(
  atomicNumber: number,
  options: AtomicOrbitalOptions = {},
): AtomicOrbital[] {
  const configuration = configurationOf(atomicNumber);
  const valenceShell = outermostShell(configuration);
  const { maximumShell = defaultMaximumShell(valenceShell) } = options;
  const occupancies = new Map<string, number>();
  for (const entry of configuration) {
    occupancies.set(`${entry.n}.${entry.l}`, entry.electrons);
  }
  const promoted = withoutOutermostElectron(configuration);

  const orbitals: AtomicOrbital[] = [];
  for (const subshell of MADELUNG_ORDER) {
    if (subshell.n > maximumShell) continue;
    const subshellElectrons =
      occupancies.get(`${subshell.n}.${subshell.l}`) ?? 0;
    // An empty orbital is the one an electron would be *promoted* into, so the
    // electron doing the promoting is not also left behind to screen it. This
    // is what makes hydrogen's 3s and 4f come out as the exact hydrogen
    // orbitals every textbook draws, rather than as unbound ones: screened by
    // its own single electron, hydrogen's 3s would see a nuclear charge of zero.
    const screening = slaterScreening(
      atomicNumber,
      subshellElectrons === 0 ? promoted : configuration,
      subshell,
    );
    // Slater's rules can still over-screen a far virtual orbital; a charge at
    // or below zero has no bound radial function at all.
    const charge = Math.max(screening.effectiveCharge, MINIMUM_CHARGE);
    const parameters: HydrogenicParameters = {
      n: subshell.n,
      l: subshell.l,
      charge,
    };
    const harmonics = harmonicsOf(subshell.l);
    const spread = hundDistribution(subshellElectrons, harmonics.length);
    for (let index = 0; index < harmonics.length; index++) {
      const harmonic = harmonics[index] as RealHarmonic;
      orbitals.push({
        id: orbitalId(subshell.n, subshell.l, harmonic),
        n: subshell.n,
        l: subshell.l,
        harmonic,
        shell: subshellLabel(subshell),
        electrons: spread[index] as number,
        subshellElectrons,
        effectiveCharge: charge,
        shielding: screening.shielding,
        energy: orbitalEnergy(parameters),
        radialNodes: radialNodeCount(parameters),
        angularNodes: subshell.l,
        meanRadius: meanRadius(parameters),
        isVirtual: subshellElectrons === 0,
        isValence: subshellElectrons > 0 && subshell.n === valenceShell,
      });
    }
  }
  return orbitals;
}

/**
 * Find one orbital of an element by its id.
 * @param orbitals - What {@link atomicOrbitalsOf} returned.
 * @param id - Orbital id, e.g. `2px`.
 * @returns The orbital, or `null` when the id names none.
 */
export function findAtomicOrbital(
  orbitals: readonly AtomicOrbital[],
  id: string,
): AtomicOrbital | null {
  for (const orbital of orbitals) {
    if (orbital.id === id) return orbital;
  }
  return null;
}

/**
 * The hydrogen-like parameters an orbital is drawn from.
 * @param orbital - The orbital.
 * @returns Its principal quantum number, ℓ and effective charge.
 */
export function hydrogenicParametersOf(
  orbital: AtomicOrbital,
): HydrogenicParameters {
  return { n: orbital.n, l: orbital.l, charge: orbital.effectiveCharge };
}

/**
 * The id of one orbital, as it appears in a URL.
 * @param n - Principal quantum number.
 * @param l - Angular momentum quantum number.
 * @param harmonic - Which real harmonic of the subshell.
 * @returns The id, e.g. `4fxyz`.
 */
export function orbitalId(
  n: number,
  l: number,
  harmonic: RealHarmonic,
): string {
  return `${n}${subshellLetter(l)}${harmonic.key}`;
}

/**
 * The orbital a student should land on when they pick an element: the first
 * one of the outermost occupied subshell, which is what the element's chemistry
 * is about.
 * @param orbitals - What {@link atomicOrbitalsOf} returned.
 * @returns Its id, or `null` when the list is empty.
 */
export function defaultOrbitalId(
  orbitals: readonly AtomicOrbital[],
): string | null {
  let candidate: AtomicOrbital | null = null;
  for (const orbital of orbitals) {
    if (orbital.electrons === 0) continue;
    if (candidate === null) {
      candidate = orbital;
    } else if (orbital.n > candidate.n) {
      candidate = orbital;
    } else if (orbital.n === candidate.n && orbital.l > candidate.l) {
      candidate = orbital;
    }
  }
  return (candidate ?? orbitals[0])?.id ?? null;
}
