import { clamp } from './clamp.ts';

const MAXIMUM_DECIMALS = 15;
const DEFAULT_DECIMALS = 2;
const POWERS_OF_TEN = [
  1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14,
  1e15,
] as const;

/**
 * A number rounded to a fixed count of decimals, and still a number.
 *
 * This is the rounding an SVG coordinate or a stored setting takes: `12.3456`
 * becomes `12.35`, so a figure writes short attributes and two renders of the
 * same data write the same markup. Use `formatTrimmed` when a string is wanted.
 * @param value - The number to round.
 * @param decimals - Decimals to keep, from 0 to 15. Defaults to `2`; a count that is not a finite number falls back to it.
 * @returns The rounded number; a value that is not finite comes back unchanged.
 */
export function roundTo(value: number, decimals = DEFAULT_DECIMALS): number {
  if (!Number.isFinite(value)) return value;
  const index = Math.trunc(
    clamp(decimals, 0, MAXIMUM_DECIMALS, DEFAULT_DECIMALS),
  );
  const factor = POWERS_OF_TEN[index] ?? 1;
  return Math.round(value * factor) / factor;
}
