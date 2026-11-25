import { clamp } from './clamp.ts';
import { MISSING_VALUE } from './missing.ts';
import { UNIT_SPACE } from './unitSpace.ts';

// A number that rounds to zero is written without a sign: `-0.04` to one
// decimal is `0.0`, not `-0.0`.
const SIGN = { signDisplay: 'negative' } as const;

const INTEGER_FORMATTER = new Intl.NumberFormat('en-US', {
  ...SIGN,
  maximumFractionDigits: 0,
});

const COMPACT_FORMATTER = new Intl.NumberFormat('en-US', {
  ...SIGN,
  notation: 'compact',
  maximumFractionDigits: 1,
});

const MAXIMUM_DIGITS = 20;
const MAXIMUM_SIGNIFICANT = 21;
const DEFAULT_DIGITS = 2;
const DEFAULT_PERCENT_DIGITS = 1;
const PERCENT = 100;

const decimalFormatters = new Map<number, Intl.NumberFormat>();

/** A precision counted in significant digits rather than in decimals. */
export interface SignificantDigits {
  /** How many significant digits to keep, from 1 to 21. */
  significant: number;
}

/**
 * How the thousands of a number are grouped: by the locale's comma, or by a
 * no-break space — `33 076`, the grouping SI writes, which no line breaks.
 */
export type NumberGrouping = 'comma' | 'space';

/** How a grouped number is written. */
export interface GroupingOptions {
  /**
   * What groups the thousands.
   * @default 'comma'
   */
  grouping?: NumberGrouping;
}

/**
 * A whole number, grouped in thousands: `1,234,567`, or `1 234 567`.
 *
 * Anything after the decimal point is rounded away. The locale is fixed to
 * `en-US`, so the same page reads the same way wherever it is opened.
 * @param value - The number to write.
 * @param options - See {@link GroupingOptions}.
 * @returns The grouped number, or the missing marker when it is not finite.
 */
export function formatInteger(
  value: number,
  options: GroupingOptions = {},
): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  return formatGrouped(INTEGER_FORMATTER, value, options.grouping);
}

/**
 * A number written by a formatter, its thousands grouped as asked: the
 * formatter's group separator is replaced part by part, never as text, so a
 * locale whose decimal sign is a comma keeps it.
 * @param formatter - The formatter.
 * @param value - The number to write.
 * @param grouping - What groups the thousands.
 * @default grouping 'comma' — the formatter's own
 * @returns The text.
 */
export function formatGrouped(
  formatter: Intl.NumberFormat,
  value: number,
  grouping: NumberGrouping = 'comma',
): string {
  if (grouping === 'comma') return formatter.format(value);
  let text = '';
  for (const part of formatter.formatToParts(value)) {
    text += part.type === 'group' ? UNIT_SPACE : part.value;
  }
  return text;
}

/**
 * A number grouped in thousands and held to a fixed number of decimals:
 * `1,234.50`, or `1 234.50`.
 *
 * The digits are kept even when they are zeros, which is what a column of
 * figures wants; use {@link formatTrimmed} for a label that should not carry
 * them.
 * @param value - The number to write.
 * @param digits - Decimals to show. Defaults to `2`; a count outside 0..20 is clamped into it, and one that is not a finite number falls back to the default.
 * @param options - See {@link GroupingOptions}.
 * @returns The formatted number, or the missing marker when it is not finite.
 */
export function formatDecimal(
  value: number,
  digits = DEFAULT_DIGITS,
  options: GroupingOptions = {},
): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  const safeDigits = wholeCount(digits, 0, MAXIMUM_DIGITS);
  let formatter = decimalFormatters.get(safeDigits);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat('en-US', {
      ...SIGN,
      minimumFractionDigits: safeDigits,
      maximumFractionDigits: safeDigits,
    });
    decimalFormatters.set(safeDigits, formatter);
  }
  return formatGrouped(formatter, value, options.grouping);
}

/**
 * A number rounded with the trailing zeros dropped: `1.5`, `2`, `0.125`.
 *
 * The precision is a count of decimals, or of significant digits when passed
 * as `{ significant }` — which is what a concentration spanning decades wants:
 * `formatTrimmed(0.000_123_45, { significant: 3 })` is `0.000123`. The thousands
 * are not grouped, so the result stays a number a reader can type back in; a
 * number too small or too large for plain digits keeps the exponent JavaScript
 * writes it with, e.g. `1.23e-7`.
 * @param value - The number to write.
 * @param digits - Decimals to round to, or `{ significant }`. Defaults to `2` decimals; a count out of range is clamped into it, and one that is not a finite number falls back to 2.
 * @returns The rounded number, or the missing marker when it is not finite.
 */
export function formatTrimmed(
  value: number,
  digits: number | SignificantDigits = DEFAULT_DIGITS,
): string {
  if (!Number.isFinite(value)) return MISSING_VALUE;
  const rounded =
    typeof digits === 'number'
      ? value.toFixed(wholeCount(digits, 0, MAXIMUM_DIGITS))
      : value.toPrecision(
          wholeCount(digits.significant, 1, MAXIMUM_SIGNIFICANT),
        );
  return Number.parseFloat(rounded).toString();
}

/**
 * A share written as a percentage with its unit, joined by a no-break space:
 * `74.2 %`.
 *
 * The number is held to a fixed count of decimals, so a column of shares lines
 * up and a title and the sentence under it agree on their precision.
 * @param share - The share, from 0 to 1 — a fraction, never a percentage.
 * @param digits - Decimals in the percentage. Defaults to `1`; a count that is not a finite number falls back to it.
 * @returns The percentage and its unit, or the missing marker when the share is not finite.
 */
export function formatPercent(
  share: number,
  digits = DEFAULT_PERCENT_DIGITS,
): string {
  if (!Number.isFinite(share)) return MISSING_VALUE;
  const safeDigits = Number.isFinite(digits) ? digits : DEFAULT_PERCENT_DIGITS;
  return `${formatDecimal(share * PERCENT, safeDigits)}${UNIT_SPACE}%`;
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

function wholeCount(count: number, minimum: number, maximum: number): number {
  return Math.trunc(clamp(count, minimum, maximum, DEFAULT_DIGITS));
}
