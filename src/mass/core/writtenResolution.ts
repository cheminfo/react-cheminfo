/**
 * The weakest evidence of resolution, and the only one a bare peak table has:
 * how many decimals its masses were written with.
 *
 * Weak because the decimals say what the exporter wrote rather than what the
 * instrument resolved — an ion trap that exports four decimals is read as high
 * resolution by it, and nothing in the numbers can tell that apart. Whole
 * numbers are the case it is sure of: a table of them is a nominal-mass table
 * whatever wrote it.
 */

import type { MassResolution } from './massResolution.ts';
import { MZ_DECIMALS } from './massResolution.ts';

/**
 * The most decimals a written mass is looked at for.
 *
 * Beyond six the digits are the noise of a binary fraction rather than anything
 * an exporter wrote, and every mass computed rather than typed reaches it.
 */
export const MAXIMUM_WRITTEN_DECIMALS = 6;

/**
 * The resolution the written masses imply.
 *
 * Whole numbers are a nominal-mass table; one or two decimals are a coarse
 * measurement; three or more are taken for a resolved one. The decimals the
 * masses were written with are also how many they are shown with, up to four.
 * @param masses - The m/z of every peak, as they were read.
 * @returns The verdict, `nominal` for a spectrum holding no peak at all.
 */
export function writtenResolution(masses: Float64Array): MassResolution {
  const written = writtenDecimals(masses);
  const kind = written === 0 ? 'nominal' : written < 3 ? 'low' : 'high';
  return {
    kind,
    resolvingPower: null,
    basis: 'decimals',
    decimals: Math.min(written, MZ_DECIMALS.high),
  };
}

/**
 * How many decimals the masses were written with, the most any of them needs.
 *
 * Tested against a tolerance rather than for equality, because a JCAMP scales
 * every value by its `##XFACTOR=` on the way in and `1631 × 0.1` is
 * `163.10000000000002` — one decimal written, sixteen in the double. The count
 * only ever grows, so each mass is tested from the decimals already found.
 * @param masses - The m/z of every peak.
 * @returns The decimals, from 0 to `MAXIMUM_WRITTEN_DECIMALS`.
 */
export function writtenDecimals(masses: Float64Array): number {
  let most = 0;
  for (const mass of masses) {
    if (!Number.isFinite(mass)) continue;
    while (most < MAXIMUM_WRITTEN_DECIMALS && !isWrittenWith(mass, most)) {
      most++;
    }
    if (most === MAXIMUM_WRITTEN_DECIMALS) break;
  }
  return most;
}

/**
 * Whether a mass was written with no more than so many decimals.
 * @param mass - The mass.
 * @param decimals - How many decimals.
 * @returns Whether rounding it there changes nothing an exporter wrote.
 */
function isWrittenWith(mass: number, decimals: number): boolean {
  return Math.abs(mass - Number(mass.toFixed(decimals))) <= DECIMAL_EPSILON;
}

/**
 * How far a mass may sit from its rounding and still be written that way.
 *
 * Far below the smallest step tested, a millionth, and far above the error a
 * scaling by `##XFACTOR=` leaves in a double, which is around 1e-13 at m/z 1000.
 */
const DECIMAL_EPSILON = 1e-8;
