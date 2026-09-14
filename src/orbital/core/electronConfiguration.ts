/**
 * Ground-state electron configurations, by the Aufbau principle and the twenty
 * elements that ignore it.
 *
 * Subshells fill in Madelung order — increasing `n + ℓ`, and increasing `n`
 * within a tie — which is why 4s fills before 3d. That rule gets 98 of the 118
 * elements right; the rest are measured, not derived, and live in
 * {@link ELEMENT_ANOMALIES}. Chromium is the canonical one: Aufbau predicts
 * `[Ar]3d⁴4s²` and the atom is `[Ar]3d⁵4s¹`.
 *
 * Configurations are returned sorted by `n` then `ℓ`, the order a textbook
 * writes them in — `[Ar]3d⁵4s¹`, not `[Ar]4s¹3d⁵`.
 */

import { formatSuperscript } from '../../format/core/superscript.ts';

import { subshellLetter } from './realHarmonics.ts';

/** One subshell, e.g. `{ n: 3, l: 2 }` for 3d. */
export interface Subshell {
  /** Principal quantum number, from 1. */
  n: number;
  /** Angular momentum quantum number: 0 = s, 1 = p, 2 = d, 3 = f. */
  l: number;
}

/** A subshell and how many electrons sit in it. */
export interface SubshellOccupancy extends Subshell {
  /** How many electrons sit in it. */
  electrons: number;
}

/** No known element occupies a shell above n = 7. */
export const MAXIMUM_PRINCIPAL_NUMBER = 7;

/** Protons in the heaviest element that has been made. */
export const HIGHEST_ATOMIC_NUMBER = 118;

/** The atomic numbers of the noble gases, which a configuration abbreviates on. */
export const NOBLE_GASES: readonly number[] = [2, 10, 18, 36, 54, 86, 118];

/**
 * Reject an atomic number outside the periodic table.
 * @param atomicNumber - Proton count to check.
 * @throws {Error} When it is not an integer between 1 and 118.
 */
function assertAtomicNumber(atomicNumber: number): void {
  if (
    !Number.isInteger(atomicNumber) ||
    atomicNumber < 1 ||
    atomicNumber > HIGHEST_ATOMIC_NUMBER
  ) {
    throw new RangeError(`no element with atomic number ${atomicNumber}`);
  }
}

/**
 * Subshells in the order they fill, `s` to `f` and up to n = 7 — everything the
 * 118 known elements use, plus the empty subshells a light atom's virtual
 * orbitals come from.
 */
export const MADELUNG_ORDER: Subshell[] = buildMadelungOrder();

/**
 * How many electrons a subshell holds: `2(2ℓ + 1)`.
 * @param l - Angular momentum quantum number.
 * @returns The capacity, `2(2ℓ + 1)`.
 */
export function subshellCapacity(l: number): number {
  return 2 * (2 * l + 1);
}

/**
 * The measured ground states that Madelung order gets wrong, as the occupancy
 * beyond the preceding noble gas.
 *
 * Half-filled and filled d shells are unusually stable, which is the story for
 * Cr, Cu, Mo, Ag, Au and Gd; the early actinides are relativistic and 6d/5f sit
 * almost on top of each other. Configurations past lawrencium are calculated
 * rather than observed, so nothing beyond Z = 103 is listed here.
 */
export const ELEMENT_ANOMALIES: Record<number, SubshellOccupancy[]> = {
  24: [occupancy(3, 2, 5), occupancy(4, 0, 1)],
  29: [occupancy(3, 2, 10), occupancy(4, 0, 1)],
  41: [occupancy(4, 2, 4), occupancy(5, 0, 1)],
  42: [occupancy(4, 2, 5), occupancy(5, 0, 1)],
  44: [occupancy(4, 2, 7), occupancy(5, 0, 1)],
  45: [occupancy(4, 2, 8), occupancy(5, 0, 1)],
  46: [occupancy(4, 2, 10)],
  47: [occupancy(4, 2, 10), occupancy(5, 0, 1)],
  57: [occupancy(5, 2, 1), occupancy(6, 0, 2)],
  58: [occupancy(4, 3, 1), occupancy(5, 2, 1), occupancy(6, 0, 2)],
  64: [occupancy(4, 3, 7), occupancy(5, 2, 1), occupancy(6, 0, 2)],
  78: [occupancy(4, 3, 14), occupancy(5, 2, 9), occupancy(6, 0, 1)],
  79: [occupancy(4, 3, 14), occupancy(5, 2, 10), occupancy(6, 0, 1)],
  89: [occupancy(6, 2, 1), occupancy(7, 0, 2)],
  90: [occupancy(6, 2, 2), occupancy(7, 0, 2)],
  91: [occupancy(5, 3, 2), occupancy(6, 2, 1), occupancy(7, 0, 2)],
  92: [occupancy(5, 3, 3), occupancy(6, 2, 1), occupancy(7, 0, 2)],
  93: [occupancy(5, 3, 4), occupancy(6, 2, 1), occupancy(7, 0, 2)],
  96: [occupancy(5, 3, 7), occupancy(6, 2, 1), occupancy(7, 0, 2)],
  103: [occupancy(5, 3, 14), occupancy(7, 0, 2), occupancy(7, 1, 1)],
};

/**
 * The ground-state configuration of a neutral atom.
 * @param atomicNumber - Proton count, 1 to 118.
 * @returns Its occupied subshells, sorted by `n` then `ℓ`.
 * @throws {Error} When the atomic number is outside the table.
 */
export function configurationOf(atomicNumber: number): SubshellOccupancy[] {
  assertAtomicNumber(atomicNumber);
  const anomaly = ELEMENT_ANOMALIES[atomicNumber];
  if (anomaly === undefined) return sortByShell(aufbauFill(atomicNumber));
  const core = coreAtomicNumber(atomicNumber);
  return sortByShell([
    ...aufbauFill(core),
    ...anomaly.map((entry) => ({ ...entry })),
  ]);
}

/**
 * Whether an element's ground state departs from Madelung order.
 * @param atomicNumber - Proton count.
 * @returns True for the twenty listed in {@link ELEMENT_ANOMALIES}.
 */
export function isAnomalous(atomicNumber: number): boolean {
  return atomicNumber in ELEMENT_ANOMALIES;
}

/**
 * What Madelung order alone predicts, so the UI can show the two side by side.
 * @param atomicNumber - Proton count, 1 to 118.
 * @returns The predicted occupied subshells, sorted by `n` then `ℓ`.
 */
export function aufbauConfigurationOf(
  atomicNumber: number,
): SubshellOccupancy[] {
  return sortByShell(aufbauFill(atomicNumber));
}

/**
 * The noble gas a configuration is abbreviated against.
 * @param atomicNumber - Proton count.
 * @returns The largest noble gas strictly below it, or 0 for hydrogen and
 * helium, which are written out in full.
 */
export function coreAtomicNumber(atomicNumber: number): number {
  let core = 0;
  for (const noble of NOBLE_GASES) {
    if (noble >= atomicNumber) break;
    core = noble;
  }
  return core;
}

/**
 * Write a configuration the way a textbook does.
 * @param occupancies - Subshells to write, in the order they should appear.
 * @returns A string such as `1s² 2s² 2p⁶`.
 */
export function formatConfiguration(
  occupancies: readonly SubshellOccupancy[],
): string {
  const parts: string[] = [];
  for (const occupancy of occupancies) parts.push(formatOccupancy(occupancy));
  return parts.join(' ');
}

/**
 * Write one subshell, e.g. `3d⁵`.
 * @param occupancy - The subshell and its electron count.
 * @returns The label with a superscript electron count.
 */
export function formatOccupancy(occupancy: SubshellOccupancy): string {
  return `${subshellLabel(occupancy)}${formatSuperscript(occupancy.electrons)}`;
}

/**
 * Write one subshell without its electron count, e.g. `3d`.
 * @param subshell - The subshell.
 * @returns The principal quantum number followed by the subshell letter.
 */
export function subshellLabel(subshell: Subshell): string {
  return `${subshell.n}${subshellLetter(subshell.l)}`;
}

function occupancy(n: number, l: number, electrons: number): SubshellOccupancy {
  return { n, l, electrons };
}

/**
 * Fill `count` electrons into {@link MADELUNG_ORDER}, lowest subshell first.
 * @param count - Electrons to place.
 * @returns The filled subshells, in Madelung order.
 */
function aufbauFill(count: number): SubshellOccupancy[] {
  const filled: SubshellOccupancy[] = [];
  let left = count;
  for (const subshell of MADELUNG_ORDER) {
    if (left <= 0) break;
    const electrons = Math.min(left, subshellCapacity(subshell.l));
    filled.push({ n: subshell.n, l: subshell.l, electrons });
    left -= electrons;
  }
  return filled;
}

function sortByShell(occupancies: SubshellOccupancy[]): SubshellOccupancy[] {
  return occupancies.toSorted((first, second) =>
    first.n === second.n ? first.l - second.l : first.n - second.n,
  );
}

/**
 * Madelung order: ascending `n + ℓ`, then ascending `n`. Capped at ℓ = 3 — the
 * g subshells a Madelung diagram shows after 8s are unoccupied in every known
 * element, and `REAL_HARMONICS` holds no g harmonics to draw them with.
 * @returns The subshells, in filling order.
 */
function buildMadelungOrder(): Subshell[] {
  const order: Subshell[] = [];
  for (let sum = 1; sum <= 10; sum++) {
    for (let l = Math.min(3, Math.ceil(sum / 2) - 1); l >= 0; l--) {
      const n = sum - l;
      if (n > MAXIMUM_PRINCIPAL_NUMBER || n <= l) continue;
      order.push({ n, l });
    }
  }
  return order;
}
