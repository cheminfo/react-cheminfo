/**
 * Whether a spectrum resolves masses finely enough for their decimals to mean
 * anything.
 *
 * A peak table typed out of a low-resolution instrument report holds whole
 * numbers — `163`, `325`, `487` — and writing them as `163.0000` claims four
 * digits of accuracy nobody measured. A high-resolution measurement is the
 * opposite case: `325.1129` and `325.1503` are different ions, and rounding them
 * together loses the whole point of having measured them. Nothing about a single
 * number says which of the two it is, so the answer is read off the spectrum.
 *
 * Three kinds of evidence are read, and the strongest one present decides —
 * `decideResolution` is where they are weighed:
 *
 * 1. **The peaks themselves.** A profile carries the width of every peak, and
 *    the resolving power `m / Δm` at half height is what "high resolution" is
 *    defined by. This is a measurement, so it is believed over anything a file
 *    says about itself.
 * 2. **What the file says the instrument was.** A Thermo scan filter starting
 *    `FTMS` is an Orbitrap, one starting `ITMS` an ion trap, and a JCAMP of the
 *    old MS dialect writes `##.INSTRUMENT PARAMETERS= LOW RESOLUTION` outright.
 * 3. **How many decimals the masses were written with**, which is all a bare
 *    peak table has to say — `writtenResolution.ts`.
 */

import { gaussianWidthToFWHM } from 'ml-peak-shape-generator';
import { xMedian } from 'ml-spectra-processing';

import type { MassMeta } from './massSpectrum.ts';

/** How finely a spectrum resolves masses. */
export type MassResolutionKind = 'high' | 'low' | 'nominal';

/** Which evidence the verdict was read from, the strongest first. */
export type MassResolutionBasis = 'peakWidth' | 'instrument' | 'decimals';

/** The verdict on one spectrum, and what it rests on. */
export interface MassResolution {
  /** Whether the masses are resolved, resolved coarsely, or written whole. */
  kind: MassResolutionKind;
  /**
   * The resolving power `m / Δm` at half height, the median over the tallest
   * peaks — `null` unless it was measured, which needs a profile.
   */
  resolvingPower: number | null;
  /** What the verdict was read from. */
  basis: MassResolutionBasis;
  /** How many decimals an m/z of this spectrum is written with. */
  decimals: number;
}

/** A picked peak with the width the peak picking measured for it. */
export interface WidthPeak {
  /** Where it sits, in m/z. */
  x: number;
  /** How tall it is. */
  y: number;
  /** Its width between inflection points, in m/z, as `ml-gsd` reports it. */
  width: number;
}

/**
 * The resolving power from which a spectrum counts as high resolution.
 *
 * Ten thousand at half height is the conventional threshold, and it falls in
 * the gap between the two families of instrument rather than inside either:
 * quadrupoles, ion traps and linear time-of-flights work at a few thousand at
 * most, while reflectron time-of-flights, Orbitraps and FT-ICRs start above it.
 */
export const HIGH_RESOLVING_POWER = 10_000;

/** How many of the tallest peaks the resolving power is the median of. */
export const MEASURED_PEAKS = 20;

/** How many decimals an m/z is written with, for each kind of spectrum. */
export const MZ_DECIMALS: Readonly<Record<MassResolutionKind, number>> = {
  high: 4,
  low: 1,
  nominal: 0,
};

/**
 * The resolving power measured on the peaks of a profile.
 *
 * The median over the tallest peaks rather than over all of them, because a
 * peak a few counts above the noise has a width the noise decided, and rather
 * than the base peak alone, because one peak sitting on an unresolved shoulder
 * would decide the whole spectrum. The width `ml-gsd` reports is the distance
 * between the inflection points, which is converted to the width at half height
 * as a gaussian's is: what a resolving power is quoted against.
 * @param peaks - The peaks the profile was picked into, each with its width.
 * @returns The verdict, `null` when no peak carries a usable width.
 */
export function measuredResolution(
  peaks: readonly WidthPeak[],
): MassResolution | null {
  const usable: WidthPeak[] = [];
  for (const peak of peaks) {
    if (peak.x > 0 && peak.width > 0 && Number.isFinite(peak.width)) {
      usable.push(peak);
    }
  }
  if (usable.length === 0) return null;

  const tallest = usable
    .toSorted((first, second) => second.y - first.y)
    .slice(0, MEASURED_PEAKS);
  const powers = new Float64Array(tallest.length);
  for (let index = 0; index < tallest.length; index++) {
    const peak = tallest[index] as WidthPeak;
    powers[index] = peak.x / gaussianWidthToFWHM(peak.width);
  }
  const resolvingPower = xMedian(powers);
  const kind = resolvingPower >= HIGH_RESOLVING_POWER ? 'high' : 'low';
  return {
    kind,
    resolvingPower,
    basis: 'peakWidth',
    decimals: MZ_DECIMALS[kind],
  };
}

/**
 * The resolution the file says the instrument worked at, when it says so.
 *
 * Only the rows that name an instrument are read, and a high verdict is looked
 * for first: an `LTQ-Orbitrap` names an ion trap and an Orbitrap, and the
 * spectrum came out of the Orbitrap. A time-of-flight is deliberately left
 * undecided — a reflectron one is high resolution and a linear one is not, and
 * the name is the same.
 * @param meta - What the file said about the acquisition.
 * @returns The verdict, `null` when the file names no instrument it can be
 * read off.
 */
export function statedResolution(meta: MassMeta | null): MassResolution | null {
  if (meta === null) return null;
  for (const field of meta.fields) {
    if (!INSTRUMENT_FIELDS.has(field.label)) continue;
    const kind = HIGH_INSTRUMENT.test(field.value)
      ? 'high'
      : LOW_INSTRUMENT.test(field.value)
        ? 'low'
        : null;
    if (kind !== null) {
      return {
        kind,
        resolvingPower: null,
        basis: 'instrument',
        decimals: MZ_DECIMALS[kind],
      };
    }
  }
  return null;
}

/** The acquisition rows that name the instrument, and so its resolution. */
const INSTRUMENT_FIELDS = new Set([
  'Analyser',
  'Instrument',
  'Instrument parameters',
]);

/** The instruments, and the words, that say high resolution. */
const HIGH_INSTRUMENT =
  /\bHIGH[\s-]RESOLUTION\b|\bHRMS\b|\bFTMS\b|ORBITRAP|\bFT-?ICR\b|\bEXACTIVE\b|\bEXPLORIS\b/i;

/** The instruments, and the words, that say a unit-resolution measurement. */
const LOW_INSTRUMENT =
  /\bLOW[\s-]RESOLUTION\b|\bITMS\b|\bION[\s-]TRAP\b|\bTRAP\b|QUADRUPOLE/i;
