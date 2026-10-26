/**
 * The resolution of a spectrum as everything downstream asks for it, and the
 * decimals every number on screen is written with.
 */

import type { MassResolution } from './massResolution.ts';
import { MZ_DECIMALS, statedResolution } from './massResolution.ts';
import type { MassMeta, MassSpectrum } from './massSpectrum.ts';
import { writtenResolution } from './writtenResolution.ts';

/** The evidence a verdict is decided on. */
export interface DecideResolutionOptions {
  /** What the peak widths measured, `null` for a peak table. */
  measured: MassResolution | null;
  /** What the file said about the acquisition. */
  meta: MassMeta | null;
  /** The m/z of every picked peak. */
  masses: Float64Array;
}

/**
 * The strongest verdict there is evidence for.
 *
 * A measurement wins outright. Otherwise the instrument the file names decides
 * the kind, but never the decimals beyond what the masses were written with:
 * an ion trap exporting four decimals resolves one, and a table of whole
 * numbers stays whole whatever instrument it came off — writing `330.0` claims
 * a decimal nobody wrote.
 * @param options - The measurement, the file's records and the masses.
 * @returns The verdict.
 */
export function decideResolution(
  options: DecideResolutionOptions,
): MassResolution {
  const { measured, meta, masses } = options;
  if (measured !== null) return measured;
  const written = writtenResolution(masses);
  const stated = statedResolution(meta);
  if (stated === null || written.kind === 'nominal') return written;
  return { ...stated, decimals: Math.min(stated.decimals, written.decimals) };
}

/**
 * The verdict on a spectrum: the one it was read with, or else the one its file
 * and its masses imply.
 *
 * A spectrum a host built itself carries no verdict, and has no peak widths to
 * measure one from either, so what the file named and what the masses were
 * written with are all there is. Cached per centroid, since the verdict is
 * asked of every drawn spectrum on every change of what is drawn, and a
 * centroid is replaced rather than written into.
 * @param spectrum - The spectrum.
 * @returns How finely it resolves masses.
 */
export function resolutionOf(spectrum: MassSpectrum): MassResolution {
  if (spectrum.resolution !== undefined) return spectrum.resolution;
  const cached = decidedCache.get(spectrum.centroid.x);
  if (cached !== undefined) return cached;
  const resolution = decideResolution({
    measured: null,
    meta: spectrum.meta,
    masses: spectrum.centroid.x,
  });
  decidedCache.set(spectrum.centroid.x, resolution);
  return resolution;
}

/**
 * How many decimals the masses of spectra drawn together are written with when
 * nobody chose: high-resolution masses or nominal ones, nothing in between.
 *
 * A high-resolution spectrum is written to the decimals its verdict allows —
 * four, or fewer where the file wrote fewer, since padding `330.12` out to
 * `330.1200` claims digits nobody measured. Anything else is written as the
 * nominal mass: a low-resolution instrument's decimals are where its noise
 * lives, and a reader who wants them chooses a number of decimals instead.
 *
 * Asked of all of them at once rather than of each, so one table and one axis
 * never disagree about how wide a number is — and the most precise spectrum
 * wins: put a calculated isotopic pattern beside a nominal peak table and the
 * masses go back to four decimals, because rounding the pattern to match would
 * hide the very difference the comparison was made to show.
 * @param spectra - The spectra being shown together.
 * @returns The decimals; four when none of them holds a peak.
 */
export function mzDecimalsOf(spectra: readonly MassSpectrum[]): number {
  let decimals = -1;
  for (const spectrum of spectra) {
    if (spectrum.centroid.x.length === 0) continue;
    const resolution = resolutionOf(spectrum);
    decimals = Math.max(
      decimals,
      resolution.kind === 'high' ? resolution.decimals : MZ_DECIMALS.nominal,
    );
  }
  return decimals === -1 ? MZ_DECIMALS.high : decimals;
}

/** The verdicts already decided, keyed by the masses they were decided on. */
const decidedCache = new WeakMap<Float64Array, MassResolution>();
