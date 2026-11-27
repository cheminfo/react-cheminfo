/**
 * The number a box of text reads as, and the text a number is shown with.
 *
 * A box that hands its text straight to `Number` is a box nobody can type a
 * decimal into: `0.` reads as `0`, and a control rendered from that number
 * writes `0` back over the dot before the next keystroke arrives. So the text
 * and the number are two values here, and the text is the one the reader owns.
 */

import { withDecimalSeparator } from '../../format/core/numbers.ts';
import { roundTo } from '../../format/core/roundTo.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';

/** Text that reads as a finite number, comma or dot. */
const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

/** Text a reader is partway through: `-`, `0.`, `1e`, `1e-`, or empty. */
const PARTIAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d*)(?:e[+-]?\d*)?$/i;

/** A sign on its own, which is where typing a negative number starts. */
const SIGN = /^[+-]?$/;

/** Decimals `roundTo` can keep, and the most a step is rounded to. */
const MAXIMUM_DECIMALS = 15;

/**
 * The number some text reads as.
 *
 * A decimal comma is read as a decimal point, because a keyboard laid out for
 * French or German puts a comma where the number pad's decimal key is and a
 * reader typing `0,2` means two tenths.
 * @param text - What is in the box.
 * @param integer - Whether only whole numbers are wanted. Defaults to `false`.
 * @returns The number, or undefined while the text does not read as one.
 */
export function readNumber(text: string, integer = false): number | undefined {
  const trimmed = text.trim().replace(',', '.');
  if (!NUMBER.test(trimmed)) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  if (integer && !Number.isInteger(parsed)) return undefined;
  return parsed;
}

/**
 * Whether the text can still become a number as more is typed.
 *
 * `0.`, `-` and `1e-` are all on the way to a number and must not be reported
 * as mistakes; `0.2x` is not, and a box may say so while it is being typed.
 * @param text - What is in the box.
 * @returns Whether anything typed so far rules a number out.
 */
export function isPartialNumber(text: string): boolean {
  const trimmed = text.trim().replace(',', '.');
  return SIGN.test(trimmed) || PARTIAL.test(trimmed);
}

/**
 * The text a number is shown with, with the decimal separator of the page's
 * language: `0.2` in English, `0,2` in French, German, Spanish and Italian.
 * Either is read back by {@link readNumber}.
 * @param value - The number, or nothing when the box is empty.
 * @param language - The language of the page. Defaults to English.
 * @returns Its text, empty when there is no number.
 */
export function numberText(
  value: number | undefined,
  language: Language = DEFAULT_LANGUAGE,
): string {
  if (value === undefined || !Number.isFinite(value)) return '';
  return withDecimalSeparator(String(value), language);
}

/**
 * A number moved by one press of an arrow key or a stepper button.
 *
 * The result is rounded to the decimals the two operands carry, so stepping
 * `0.1` up by `0.2` lands on `0.3` rather than on `0.30000000000000004` — a
 * value that is then shown, shared in a link and stored in full.
 * @param value - Where the box is now.
 * @param delta - What the press adds; negative going down.
 * @returns The number the box moves to.
 */
export function stepNumber(value: number, delta: number): number {
  return roundedTo(
    value + delta,
    Math.max(decimalsOf(value), decimalsOf(delta)),
  );
}

/**
 * A number moved onto the grid of steps laid from an origin.
 *
 * Rounded to the decimals the step and the origin carry, for the reason
 * {@link stepNumber} is: a slider dragged in steps of `0.1` must report `0.3`,
 * because that is what ends up written in the link.
 * @param value - Where the number is now.
 * @param step - The spacing of the grid. A step that is not above zero leaves
 * the number where it is.
 * @param origin - A point the grid passes through. Defaults to `0`.
 * @returns The grid point nearest the number.
 */
export function snapToStep(value: number, step: number, origin = 0): number {
  if (!(step > 0) || !Number.isFinite(value)) return value;
  const snapped = origin + Math.round((value - origin) / step) * step;
  return roundedTo(snapped, Math.max(decimalsOf(step), decimalsOf(origin)));
}

/**
 * A number rounded to the decimals its operands carry — left as it is when they
 * carry none, or more than a number holds, where rounding would erase it.
 * @param value - The number.
 * @param decimals - The decimals its operands are written with.
 * @returns The number, rounded when there is something to round to.
 */
function roundedTo(value: number, decimals: number): number {
  if (decimals === 0 || decimals > MAXIMUM_DECIMALS) return value;
  return roundTo(value, decimals);
}

/**
 * How many decimals a number is written with.
 *
 * A number written out is held to fifteen, the most a double keeps; one written
 * in exponent form counts the decimals it stands for — `1e-7` seven, `1.5e-7`
 * eight, `1e21` none — however many that is.
 * @param value - The number.
 * @returns Its count of decimals.
 */
function decimalsOf(value: number): number {
  const text = String(Math.abs(value));
  const exponentAt = text.indexOf('e');
  if (exponentAt === -1) {
    const dot = text.indexOf('.');
    return dot === -1 ? 0 : Math.min(text.length - dot - 1, MAXIMUM_DECIMALS);
  }
  const mantissa = text.slice(0, exponentAt);
  const dot = mantissa.indexOf('.');
  const written = dot === -1 ? 0 : mantissa.length - dot - 1;
  return Math.max(0, written - Number(text.slice(exponentAt + 1)));
}
