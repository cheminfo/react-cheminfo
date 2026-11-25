/**
 * A number rounded to a count of significant digits, and still a number.
 *
 * This is the rounding a stated quantity takes — a size converted to another
 * unit, a pixel size written into a workflow — so `0.268_814_5` read to four
 * digits is `0.2688` and `12_345.678` is `12_350`, and two conversions of one
 * value write the same number. `roundTo` counts decimals instead.
 * @param value - The number to round.
 * @param digits - Significant digits to keep, from 1 to 100.
 * @returns The rounded number; a value that is not finite comes back unchanged.
 * @throws {RangeError} For a count of digits outside 1–100.
 */
export function roundSignificant(value: number, digits: number): number {
  if (!Number.isFinite(value)) return value;
  return Number(value.toPrecision(digits));
}
