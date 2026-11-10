/**
 * What a peak could be: the measured energy against the published levels.
 *
 * This is a suggestion and never a determination. One number cannot identify an
 * element — Ru 3d and C 1s sit within a couple of eV of each other, and so do a
 * dozen other pairs — so the answer is a short ranked list the reader judges
 * against the rest of the spectrum, and the window it is drawn from is one
 * they widen when a sample is charging and narrow when it is not.
 *
 * Nothing is stored on the peak. Which element a peak belongs to depends on the
 * tolerance in force, and that changes while the reader is looking at it, so it
 * is computed where it is shown rather than written into the spectrum.
 */

import { xGetFromToIndex } from 'ml-spectra-processing';

import type { LineStrength } from './lineStrength.ts';
import { lineStrength } from './lineStrength.ts';
import type { ReferenceLevel } from './referenceLevels.ts';
import { referenceEnergies, referenceLevels } from './referenceLevels.ts';
import type { XpsPeak } from './xpsSpectrum.ts';

/** One published level that could account for a measured energy. */
export interface ElementCandidate {
  /** Element symbol of the level. */
  element: string;
  /** The level, as a chemist writes it: `1s`, `2p3/2`. */
  orbital: string;
  /** Where the published level sits, in eV of binding energy. */
  bindingEnergy: number;
  /**
   * How far the measurement sits from it, in eV, signed: positive when the peak
   * is at higher binding energy than the published level, which is the
   * direction an oxidised atom shifts.
   */
  delta: number;
}

/** How wide a window a match is looked for in, and how many are offered. */
export interface AssignElementsOptions {
  /**
   * How far in eV a published level may sit from the measurement. Half an eV is
   * a charge correction, two is a chemical shift, and past about three the
   * answer stops being one element.
   * @default 2
   */
  tolerance?: number;
  /**
   * How many candidates at most, the closest kept.
   * @default 5
   */
  limit?: number;
  /**
   * The weakest line that may be offered: `0` principal lines only, `1` those
   * and their partners, `2` every level in the table.
   *
   * One rather than two, so a minor level is never put forward as what a peak
   * is. Nobody identifies an element from its 4s, and the table is dense enough
   * that one is always within a couple of eV — an oxygen Auger feature at
   * 887 eV comes back as astatine 4p1/2 unless the weak lines are kept out. A
   * peak with no strong line near it is better answered with nothing.
   * @default 1
   */
  minimumStrength?: LineStrength;
}

/** How many peaks of a spectrum one element accounts for. */
export interface ElementPeakCount {
  /** Element symbol. */
  element: string;
  /** How many peaks it is a candidate for. */
  peaks: number;
}

/** How far a published level may sit from a peak unless asked otherwise. */
export const DEFAULT_ASSIGNMENT_TOLERANCE = 2;

/** How many candidates a peak is offered unless asked otherwise. */
export const DEFAULT_ASSIGNMENT_LIMIT = 5;

/** The weakest line put forward as what a peak is, unless asked otherwise. */
export const DEFAULT_MINIMUM_STRENGTH: LineStrength = 1;

/**
 * The published levels that could account for one binding energy.
 *
 * Ranked by how far each sits from the measurement, closest first, so the head
 * of the list is the answer a table shows in its one narrow column and the tail
 * is what a tooltip offers when that answer looks wrong.
 * @param bindingEnergy - The measured energy in eV.
 * @param options - The window to look in, and how many candidates to offer.
 * @returns The candidates, closest first; empty when nothing is near enough.
 */
export function assignElements(
  bindingEnergy: number,
  options: AssignElementsOptions = {},
): ElementCandidate[] {
  const {
    tolerance = DEFAULT_ASSIGNMENT_TOLERANCE,
    limit = DEFAULT_ASSIGNMENT_LIMIT,
    minimumStrength = DEFAULT_MINIMUM_STRENGTH,
  } = options;
  if (!Number.isFinite(bindingEnergy) || !(tolerance > 0) || !(limit > 0)) {
    return [];
  }

  const from = bindingEnergy - tolerance;
  const to = bindingEnergy + tolerance;
  const { fromIndex } = xGetFromToIndex(referenceEnergies, { from, to });

  // Both bounds resolve to *a* closest level, which can sit outside the window
  // when nothing is inside it, and which is only the first of any levels
  // sharing that energy — the published table has many, so an index taken at
  // face value drops every level after the first at the same eV. The window is
  // therefore widened to whichever ties surround it and closed by value below.
  let start = fromIndex;
  while (start > 0 && (referenceEnergies[start - 1] as number) >= from) {
    start -= 1;
  }
  const end = referenceEnergies.length - 1;

  const candidates: ElementCandidate[] = [];
  for (let index = start; index <= end; index++) {
    const energy = referenceEnergies[index] as number;
    if (energy < from) continue;
    if (energy > to) break;
    const level = referenceLevels[index] as ReferenceLevel;
    if (lineStrength(level.orbital) > minimumStrength) continue;
    candidates.push({
      element: level.element,
      orbital: level.orbital,
      bindingEnergy: energy,
      delta: bindingEnergy - energy,
    });
  }

  // By how strongly the line shows first, and by distance within that. Distance
  // alone puts a minor level of a rare element above the one answer an analyst
  // would give, because the table is dense enough that something is always
  // nearer — see `lineStrength.ts` for the whole of the argument.
  const ranked = candidates.toSorted((left, right) => {
    const byStrength = lineStrength(left.orbital) - lineStrength(right.orbital);
    if (byStrength !== 0) return byStrength;
    return Math.abs(left.delta) - Math.abs(right.delta);
  });
  return ranked.length > limit ? ranked.slice(0, limit) : ranked;
}

/**
 * The candidates for every peak of a spectrum, keyed by the peak's identity.
 *
 * A peak nothing accounts for is left out rather than carrying an empty list,
 * so the size of the map is how many of the peaks were identified at all — the
 * number that tells a reader whether the tolerance is doing anything.
 * @param peaks - The picked peaks.
 * @param options - The window to look in, and how many candidates to offer.
 * @returns The candidates of each peak that has any, closest first.
 */
export function assignSpectrum(
  peaks: readonly XpsPeak[],
  options: AssignElementsOptions = {},
): Map<string, ElementCandidate[]> {
  const assignments = new Map<string, ElementCandidate[]>();
  for (const peak of peaks) {
    const candidates = assignElements(peak.bindingEnergy, options);
    if (candidates.length === 0) continue;
    assignments.set(peak.id, candidates);
  }
  return assignments;
}

/**
 * How many peaks each element accounts for, as the panel summarises it.
 *
 * An element counts once per peak however many of its levels matched that peak,
 * since two orbitals landing in one window is a property of the table and not
 * evidence of anything. The order is the order the summary reads in: the
 * element explaining most of the spectrum first, and alphabetically among
 * elements explaining as much as each other.
 * @param assignments - What `assignSpectrum` found.
 * @returns One row per element, the most-seen first.
 */
export function countedElements(
  assignments: ReadonlyMap<string, readonly ElementCandidate[]>,
): ElementPeakCount[] {
  const counts = new Map<string, number>();
  const seen = new Set<string>();
  for (const candidates of assignments.values()) {
    seen.clear();
    for (const candidate of candidates) {
      if (seen.has(candidate.element)) continue;
      seen.add(candidate.element);
      counts.set(candidate.element, (counts.get(candidate.element) ?? 0) + 1);
    }
  }

  const rows: ElementPeakCount[] = [];
  for (const [element, peaks] of counts) rows.push({ element, peaks });
  return rows.toSorted((left, right) => {
    const byCount = right.peaks - left.peaks;
    if (byCount !== 0) return byCount;
    return left.element < right.element ? -1 : 1;
  });
}
