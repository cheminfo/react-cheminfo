import { formatDecimal } from '../../format/core/numbers.ts';
import { formatSuperscript } from '../../format/core/superscript.ts';

const COMFORTABLE_LABEL = 6;

/**
 * How many decimals a label needs so that every tick on one axis is written
 * the same width.
 *
 * A step is always 1, 2 or 5 times a power of ten, so the answer is the step's
 * decimal exponent and nothing more.
 * @param step - The tick spacing.
 * @returns The decimals; `0` for a step of one or more.
 */
export function chartTickDecimals(step: number): number {
  return Math.max(0, -decimalExponent(step));
}

/**
 * One tick written out, through `formatDecimal` so an axis reads like the rest
 * of the family's numbers, or through a site's own writer.
 * @param value - The tick value.
 * @param decimals - Decimals to keep, from {@link chartTickDecimals}.
 * @param exponent - A power of ten already lifted into the axis title. Defaults to `0`.
 * @param format - How the label is written, handed the value divided by that
 * power and the decimals. Defaults to `formatDecimal`.
 * @returns The label. A negative zero is written as zero, which is what a
 * reader expects to find at an origin.
 */
export function chartTickLabel(
  value: number,
  decimals: number,
  exponent = 0,
  format: (value: number, decimals: number) => string = formatDecimal,
): string {
  const lift = Number.isFinite(exponent) ? Math.trunc(exponent) : 0;
  const scaled = lift === 0 ? value : value / 10 ** lift;
  return format(scaled === 0 ? 0 : scaled, decimals);
}

/**
 * The factor an axis title carries when its labels were divided down, written
 * as ` (×10⁻⁹)` with real superscript digits.
 * @param exponent - The power of ten lifted out; `0` for none.
 * @returns The suffix, or an empty string when there is nothing to say.
 */
export function chartExponentSuffix(exponent: number): string {
  if (!Number.isFinite(exponent)) return '';
  const whole = Math.trunc(exponent);
  if (whole === 0) return '';
  return ` (×10${formatSuperscript(whole)})`;
}

/**
 * The power of ten lifted out of every label of an axis, so the labels stay
 * two or three characters wide: only where that actually shortens them.
 * @param values - The tick values, ascending.
 * @param step - The tick spacing.
 * @returns The power, or `0` when none is lifted.
 */
export function liftedExponent(
  values: readonly number[],
  step: number,
): number {
  const low = Math.abs(values[0] ?? 0);
  const largest = Math.max(low, Math.abs(values.at(-1) ?? 0));
  if (largest === 0 || !Number.isFinite(largest) || step <= 0) return 0;
  const top = decimalExponent(largest);
  const fine = decimalExponent(step);
  const plain = labelWidth(Math.max(1, top + 1), -fine);
  if (plain <= COMFORTABLE_LABEL) return 0;
  return labelWidth(1, top - fine) < plain ? top : 0;
}

/**
 * The power of ten of a number written in scientific notation.
 * @param value - The number.
 * @returns Its decimal exponent, `0` for a number that has none.
 */
export function decimalExponent(value: number): number {
  const exponent = Number(Math.abs(value).toExponential().split('e', 2)[1]);
  return Number.isFinite(exponent) ? exponent : 0;
}

function labelWidth(digits: number, decimals: number): number {
  return decimals > 0 ? digits + decimals + 1 : digits;
}
