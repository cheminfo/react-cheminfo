/**
 * The number a box of text reads as, and the text a number is shown with.
 *
 * A box that hands its text straight to `Number` is a box nobody can type a
 * decimal into: `0.` reads as `0`, and a control rendered from that number
 * writes `0` back over the dot before the next keystroke arrives. So the text
 * and the number are two values here, and the text is the one the reader owns.
 */

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
 * The text a number is shown with.
 * @param value - The number, or nothing when the box is empty.
 * @returns Its text, empty when there is no number.
 */
export function numberText(value: number | undefined): string {
  return value === undefined || !Number.isFinite(value) ? '' : String(value);
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
  const decimals = Math.max(decimalsOf(value), decimalsOf(delta));
  const moved = value + delta;
  if (decimals === 0) return moved;
  const factor = 10 ** decimals;
  return Math.round(moved * factor) / factor;
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
  const decimals = Math.max(decimalsOf(step), decimalsOf(origin));
  const factor = 10 ** decimals;
  return Math.round(snapped * factor) / factor;
}

/**
 * How many decimals a number is written with.
 * @param value - The number.
 * @returns Its count of decimals, `0` for anything written in exponent form.
 */
function decimalsOf(value: number): number {
  const text = String(Math.abs(value));
  const dot = text.indexOf('.');
  if (dot === -1 || text.includes('e')) return 0;
  return Math.min(text.length - dot - 1, MAXIMUM_DECIMALS);
}
