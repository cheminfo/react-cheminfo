/**
 * Which peaks of a spectrum are worth writing an energy beside.
 *
 * A survey scan picks tens of peaks — every satellite, every Auger line, every
 * shoulder the detection was generous about — and a chart has room for a dozen
 * energies. Two things have to be decided, and they are different questions:
 * **which peaks matter**, which is intensity, and **which of those fit**, which
 * is how near they are on the axis currently on screen.
 *
 * The spacing is therefore given in eV by the caller rather than fixed here,
 * because it is a distance on the *screen* converted through the zoom: at a
 * survey scan's scale two peaks an eV apart are one pixel apart and only one of
 * them can be named, and the same two zoomed onto are half the chart apart and
 * both must be.
 */

import type { XpsPeak } from './xpsSpectrum.ts';

/** The window the labels are chosen for, and how many there is room for. */
export interface LabelledPeaksOptions {
  /**
   * The lower end of the window in eV of binding energy.
   * @default Number.NEGATIVE_INFINITY
   */
  from?: number;
  /**
   * The upper end.
   * @default Number.POSITIVE_INFINITY
   */
  to?: number;
  /**
   * How many peaks are named at most, the most intense first.
   * @default DEFAULT_LABEL_LIMIT, as the caller's settings carry it
   */
  limit?: number;
  /**
   * How near in eV a peak may be to one already named and still be named
   * itself. Convert it from the pixels a label occupies, so the choice follows
   * the zoom.
   * @default 0
   */
  minimumSpacing?: number;
  /**
   * The tallest count the window shows. A peak above it has its tip off the top
   * of the plot, so a label placed there would name a peak whose height cannot
   * be read anyway.
   * @default Number.POSITIVE_INFINITY
   */
  maximumIntensity?: number;
}

/**
 * The peaks of a window that have earned a name.
 *
 * Taken most intense first and kept only when nothing already named stands
 * within `minimumSpacing` of them, which is the whole of the decluttering: the
 * tallest peak of a crowded stretch wins its neighbourhood, and the reader is
 * never shown two energies written over one another. Dropping the loser rather
 * than nudging it apart is deliberate — nudging needs to know how wide a label
 * is, which is a question about the host's font that an SVG cannot answer until
 * it is on screen.
 *
 * What comes back is in ascending energy rather than in the order it was chosen,
 * so the labels are drawn left to right and a React key list stays stable as the
 * window moves.
 * @param peaks - The peaks of one spectrum, as the detection left them.
 * @param options - The window, the room there is, and how near is too near.
 * @returns The chosen peaks, ascending in binding energy; never a copy of one.
 */
export function selectLabelledPeaks(
  peaks: readonly XpsPeak[],
  options: LabelledPeaksOptions = {},
): XpsPeak[] {
  const {
    from = Number.NEGATIVE_INFINITY,
    to = Number.POSITIVE_INFINITY,
    limit = 0,
    minimumSpacing = 0,
    maximumIntensity = Number.POSITIVE_INFINITY,
  } = options;
  if (limit <= 0) return [];

  const low = Math.min(from, to);
  const high = Math.max(from, to);
  const candidates: XpsPeak[] = [];
  for (const peak of peaks) {
    const { bindingEnergy, intensity } = peak;
    if (bindingEnergy < low || bindingEnergy > high) continue;
    if (!(intensity <= maximumIntensity)) continue;
    candidates.push(peak);
  }
  if (candidates.length === 0) return [];

  const ranked = candidates.toSorted(byIntensity);
  const kept: XpsPeak[] = [];
  for (const peak of ranked) {
    if (kept.length >= limit) break;
    if (crowded(kept, peak.bindingEnergy, minimumSpacing)) continue;
    kept.push(peak);
  }
  return kept.toSorted(byEnergy);
}

/**
 * Whether a peak stands too near one already named.
 * @param kept - The peaks already named.
 * @param bindingEnergy - Where the candidate sits, in eV.
 * @param spacing - How near is too near, in eV; `0` lets everything through.
 * @returns Whether naming it would write one label over another.
 */
function crowded(
  kept: readonly XpsPeak[],
  bindingEnergy: number,
  spacing: number,
): boolean {
  if (!(spacing > 0)) return false;
  for (const peak of kept) {
    if (Math.abs(peak.bindingEnergy - bindingEnergy) < spacing) return true;
  }
  return false;
}

/**
 * Rank two peaks by how much they are worth naming.
 *
 * Ties are broken on energy so the choice is the same every render: two peaks of
 * exactly equal height are common in a synthetic spectrum, and a sort that left
 * their order to the engine would make the chart name one of them on one render
 * and the other on the next.
 * @param first - One peak.
 * @param second - The other.
 * @returns Negative when the first is worth more.
 */
function byIntensity(first: XpsPeak, second: XpsPeak): number {
  if (second.intensity !== first.intensity) {
    return second.intensity - first.intensity;
  }
  return first.bindingEnergy - second.bindingEnergy;
}

/**
 * Order two peaks along the binding-energy axis.
 * @param first - One peak.
 * @param second - The other.
 * @returns Negative when the first sits lower.
 */
function byEnergy(first: XpsPeak, second: XpsPeak): number {
  return first.bindingEnergy - second.bindingEnergy;
}
