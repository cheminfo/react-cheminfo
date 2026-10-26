/**
 * How many decimals the masses on screen are written with: as the spectra
 * decide, or as the reader chose.
 *
 * The spectra decide well for what they are — an Orbitrap scan to four
 * decimals, a library spectrum in whole masses — but not for what the reader
 * is doing with them: an ion-trap run read against its precursors wants a
 * decimal its verdict calls noise, and a table pasted into a report wants
 * fewer digits than the instrument gave. So the decision is a setting, `'auto'`
 * until somebody picks a number.
 */

import type { MassSpectrum } from './massSpectrum.ts';
import { mzDecimalsOf } from './resolutionOf.ts';

/** `'auto'` to let the spectra decide, or the number of decimals chosen. */
export type MzDecimalsSetting = 'auto' | number;

/** The most decimals that can be chosen; past it a mass is all noise. */
export const MAXIMUM_MZ_DECIMALS = 5;

/**
 * How many decimals the masses of spectra shown together are written with.
 * @param setting - What the reader chose, `'auto'` for nothing.
 * @param spectra - The spectra being shown together.
 * @returns The decimals: the choice, or what `mzDecimalsOf` decides.
 */
export function mzDecimalsFor(
  setting: MzDecimalsSetting,
  spectra: readonly MassSpectrum[],
): number {
  return setting === 'auto' ? mzDecimalsOf(spectra) : setting;
}

/**
 * A decimals setting as it may be stored, read back from whatever was.
 *
 * A setting arrives from a saved workspace, a host's props or a URL, none of
 * which this viewer wrote, so anything other than `'auto'` or a finite number
 * is not a setting at all — and a number is rounded and held to what can be
 * chosen rather than refused, since `4.0` and `9` both say plainly enough what
 * was meant.
 * @param value - What was stored.
 * @returns The setting, or `undefined` for something that is not one.
 */
export function readMzDecimalsSetting(
  value: unknown,
): MzDecimalsSetting | undefined {
  if (value === 'auto') return 'auto';
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.min(MAXIMUM_MZ_DECIMALS, Math.max(0, Math.round(value)));
}
