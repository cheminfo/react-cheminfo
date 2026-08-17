import { MISSING_VALUE } from './missing.ts';

const INTEGER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const COMPACT_FORMATTER = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const MAXIMUM_DIGITS = 20;
const DEFAULT_DIGITS = 2;

const decimalFormatters = new Map<number, Intl.NumberFormat>();

/**
 * A whole number, grouped in thousands: `1,234,567`.
 *
 * Anything after the decimal point is rounded away. The locale is fixed to
 * `en-US`, so the same page reads the same way wherever it is opened.
 * @param value - The number to write.
 * @returns The grouped number, or the missing marker when it is not finite.
 */
export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  return INTEGER_FORMATTER.format(value);
}

/**
 * A number grouped in thousands and held to a fixed number of decimals:
 * `1,234.50`.
 *
 * The digits are kept even when they are zeros, which is what a column of
 * figures wants; use {@link formatTrimmed} for a label that should not carry
 * them.
 * @param value - The number to write.
 * @param digits - Decimals to show. Defaults to `2`; a count outside 0..20 is clamped into it, and one that is not a number falls back to the default.
 * @returns The formatted number, or the missing marker when it is not finite.
 */
export function formatDecimal(value: number, digits = DEFAULT_DIGITS): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  const safeDigits = clampDigits(digits);
  let formatter = decimalFormatters.get(safeDigits);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: safeDigits,
      maximumFractionDigits: safeDigits,
    });
    decimalFormatters.set(safeDigits, formatter);
  }
  return formatter.format(value);
}

/**
 * A number rounded to `digits` decimals with the trailing zeros dropped:
 * `1.5`, `2`, `0.125`.
 *
 * The thousands are not grouped, so the result stays a number a reader can
 * type back in — this is the form an axis tick, a chip or an exported cell
 * takes.
 * @param value - The number to write.
 * @param digits - Decimals to round to. Defaults to `2`; a count outside 0..20 is clamped into it, and one that is not a number falls back to the default.
 * @returns The rounded number, or the missing marker when it is not finite.
 */
export function formatTrimmed(value: number, digits = DEFAULT_DIGITS): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  return Number.parseFloat(value.toFixed(clampDigits(digits))).toString();
}

/**
 * A number shortened for a cramped axis or a badge: `999`, `1.2K`, `3.4M`.
 * @param value - The number to write.
 * @returns The shortened number, or the missing marker when it is not finite.
 */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  return COMPACT_FORMATTER.format(value);
}

function clampDigits(digits: number): number {
  if (!Number.isFinite(digits)) return DEFAULT_DIGITS;
  return Math.min(MAXIMUM_DIGITS, Math.max(0, Math.trunc(digits)));
}
