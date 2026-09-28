/**
 * Matching picked bands against the correlation table.
 *
 * Every assignment whose range contains the band is kept, and that is the whole
 * design: infrared assignment is not a lookup with one answer, and a viewer that
 * showed only the best-fitting vibration would be asserting a structure the
 * spectrum does not determine. A band at 1715 cm⁻¹ comes back as four
 * candidates, ordered so the most specific claim reads first, and choosing
 * between them is the chemist's job — which is what the `note` on each is for.
 */

import type { BandAssignment } from './bandAssignments.ts';
import { BAND_ASSIGNMENTS } from './bandAssignments.ts';
import type { IrBand } from './irBand.ts';

/** One band, with everything it might be. */
export interface AssignedBand {
  /** The band that was picked. */
  band: IrBand;
  /**
   * Every vibration whose range contains it, narrowest range first.
   *
   * Narrowest first because a narrow range is a more specific claim: at
   * 1745 cm⁻¹ the ester's fifteen-wavenumber window says more than the
   * anhydride's ninety, so it is the one worth reading first. Empty for a band
   * in a region the table says nothing about, which is most of the fingerprint.
   */
  candidates: BandAssignment[];
}

/** How bands are assigned. */
export interface AssignBandsOptions {
  /**
   * The table to match against.
   * @default BAND_ASSIGNMENTS
   */
  assignments?: readonly BandAssignment[];
  /**
   * How far outside a range a band may still fall, in cm⁻¹.
   *
   * The ranges are conventional values rounded to tens, and a real band sits a
   * few wavenumbers either side of where a table puts it — a ketone at 1703 is
   * a ketone. Widening every range by a little is honest about that, where
   * matching exactly would leave the strongest band in the spectrum unassigned
   * for being two wavenumbers low.
   * @default 5
   */
  tolerance?: number;
  /**
   * Whether a band whose strength disagrees with the table is still offered.
   *
   * It is, by default. A weak band where the table expects a strong one is
   * evidence about concentration or about the assignment being wrong, and either
   * way it is evidence the reader should see rather than have filtered away.
   * @default true
   */
  keepStrengthMismatch?: boolean;
}

/**
 * Assign every band, keeping every candidate.
 * @param bands - The bands that were picked.
 * @param options - The table, and how tightly to match it.
 * @returns One entry per band, in the order the bands were given.
 */
export function assignBands(
  bands: readonly IrBand[],
  options: AssignBandsOptions = {},
): AssignedBand[] {
  const {
    assignments = BAND_ASSIGNMENTS,
    tolerance = 5,
    keepStrengthMismatch = true,
  } = options;

  const assigned: AssignedBand[] = new Array<AssignedBand>(bands.length);
  for (let index = 0; index < bands.length; index++) {
    const band = bands[index] as IrBand;
    const candidates: BandAssignment[] = [];
    for (const assignment of assignments) {
      if (
        band.wavenumber < assignment.from - tolerance ||
        band.wavenumber > assignment.to + tolerance
      ) {
        continue;
      }
      if (!keepStrengthMismatch && assignment.strength !== band.strength) {
        continue;
      }
      candidates.push(assignment);
    }
    assigned[index] = {
      band,
      candidates: candidates.toSorted(byNarrowestRange),
    };
  }
  return assigned;
}

/**
 * How many of the bands the table had something to say about.
 *
 * Reported as a count rather than a fraction, because the denominator is the
 * number of bands picked and that follows the picking threshold — a coverage
 * percentage would move when somebody adjusted a slider, and read as the
 * assignment having improved.
 * @param assigned - The assigned bands.
 * @returns How many carry at least one candidate.
 */
export function countAssigned(assigned: readonly AssignedBand[]): number {
  let count = 0;
  for (const entry of assigned) {
    if (entry.candidates.length > 0) count++;
  }
  return count;
}

/**
 * The name to write on a band, when there is room for one line.
 *
 * The narrowest candidate's group and vibration, which is the first of the
 * ranked list — the same order the panel shows, so the chart and the table never
 * disagree about which claim leads.
 * @param entry - One assigned band.
 * @returns The label, or `null` when nothing was assigned.
 */
export function bandLabel(entry: AssignedBand): string | null {
  const best = entry.candidates[0];
  if (best === undefined) return null;
  return `${best.group} ${best.vibration}`;
}

/**
 * Order two assignments by how specific they are, narrowest range first.
 * @param first - One assignment.
 * @param second - The other.
 * @returns The comparison; equal widths keep the table's own order.
 */
function byNarrowestRange(
  first: BandAssignment,
  second: BandAssignment,
): number {
  return first.to - first.from - (second.to - second.from);
}
