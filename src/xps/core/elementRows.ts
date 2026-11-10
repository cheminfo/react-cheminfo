/**
 * What the peaks of one spectrum say the sample is made of, element by element.
 *
 * The peak table answers "what could *this* peak be", one row at a time, and
 * that is the wrong shape for the question actually being asked of a survey
 * scan: an element is believed because several of its levels turn up at once —
 * an O 1s at 531 with an O 2s at 24, a Mo 3d doublet with its 3p — and a
 * per-peak list scatters that evidence down the page. So the rows here are
 * elements, and what each carries is how much of the spectrum it accounts for.
 *
 * The ordering and the counting are `countedElements`', not a second opinion of
 * our own: one element counts once per peak however many of its levels landed in
 * that peak's window, since two orbitals inside one window is a property of the
 * reference table rather than evidence of anything.
 */

import type { ElementCandidate, ElementPeakCount } from './assignElements.ts';
import { assignSpectrum, countedElements } from './assignElements.ts';
import type { XpsPeak } from './xpsSpectrum.ts';

/** One element the peaks of a spectrum could belong to. */
export interface ElementRow {
  /** Element symbol. */
  element: string;
  /** How many peaks it is a candidate for. */
  peaks: number;
  /**
   * Where those peaks sit, in the order the detection listed them — which is
   * ascending binding energy. This is the evidence: two energies that are the
   * two halves of a known doublet are worth more than one energy in a crowded
   * window.
   */
  energies: number[];
  /** The levels that matched, as a chemist writes them, without repeats. */
  orbitals: string[];
  /** How far the closest of those matches sits from its level, in eV, signed. */
  closest: number;
}

/** How wide a window the elements are looked up in. */
export interface ElementRowsOptions {
  /**
   * How far in eV a published level may sit from a measurement.
   * @default the default of `assignElements`
   */
  tolerance?: number;
}

/**
 * The elements the peaks of a spectrum could be, best supported first.
 * @param peaks - The picked peaks.
 * @param options - How wide a window to identify them in.
 * @returns One row per element, the one accounting for most peaks first and
 * alphabetically among elements accounting for as many as each other.
 */
export function buildElementRows(
  peaks: readonly XpsPeak[],
  options: ElementRowsOptions = {},
): ElementRow[] {
  const { tolerance } = options;
  const assignments = assignSpectrum(peaks, { tolerance });
  const evidence = gatherEvidence(peaks, assignments);

  const counted = countedElements(assignments);
  const rows = new Array<ElementRow>(counted.length);
  for (let index = 0; index < counted.length; index++) {
    const { element, peaks: count } = counted[index] as ElementPeakCount;
    const found = evidence.get(element) as ElementRow;
    rows[index] = { ...found, peaks: count };
  }
  return rows;
}

/**
 * How many of a spectrum's peaks any element at all accounts for.
 *
 * The number that says whether the tolerance is doing anything: two identified
 * peaks of forty is a window too narrow for a charging sample, and forty of
 * forty is one so wide that every peak has become every element.
 * @param peaks - The picked peaks.
 * @param options - How wide a window to identify them in.
 * @returns How many peaks have at least one candidate.
 */
export function countIdentifiedPeaks(
  peaks: readonly XpsPeak[],
  options: ElementRowsOptions = {},
): number {
  return assignSpectrum(peaks, { tolerance: options.tolerance }).size;
}

/**
 * Where each element was seen, and how well.
 *
 * Walked from the peaks rather than from the assignments, because the map is
 * keyed by a peak's identity and what a row shows is the peak's *energy* — and
 * because that walk is what puts the energies in the ascending order the peaks
 * are already in.
 * @param peaks - The picked peaks, as the detection listed them.
 * @param assignments - What `assignSpectrum` found for each of them.
 * @returns One partial row per element, its `peaks` count not yet filled in.
 */
function gatherEvidence(
  peaks: readonly XpsPeak[],
  assignments: ReadonlyMap<string, readonly ElementCandidate[]>,
): Map<string, ElementRow> {
  const evidence = new Map<string, ElementRow>();
  for (const peak of peaks) {
    const candidates = assignments.get(peak.id);
    if (candidates === undefined) continue;
    for (const candidate of candidates) {
      const row = evidence.get(candidate.element);
      if (row === undefined) {
        evidence.set(candidate.element, {
          element: candidate.element,
          peaks: 0,
          energies: [peak.bindingEnergy],
          orbitals: [candidate.orbital],
          closest: candidate.delta,
        });
        continue;
      }
      const last = row.energies.at(-1);
      if (last !== peak.bindingEnergy) row.energies.push(peak.bindingEnergy);
      if (!row.orbitals.includes(candidate.orbital)) {
        row.orbitals.push(candidate.orbital);
      }
      if (Math.abs(candidate.delta) < Math.abs(row.closest)) {
        row.closest = candidate.delta;
      }
    }
  }
  return evidence;
}
