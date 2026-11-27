/**
 * A range of values on an axis, written in the order the axis is read.
 */

/**
 * The two ends of what a spectrum spans, joined by an en dash with no space,
 * in the order its axis reads: high to low on a reversed axis.
 * @param values - The values, ascending, read in place.
 * @param format - How one value is written.
 * @param reversed - Whether the axis runs from high to low.
 * @param unit - What follows the range, after a space.
 * @returns `4000–400 cm⁻¹`, or `''` for no value at all.
 */
export function formatValueRange(
  values: readonly number[] | Float64Array,
  format: (value: number) => string,
  reversed = false,
  unit?: string,
): string {
  if (values.length === 0) return '';
  const lowest = values[0] as number;
  const highest = values.at(-1) as number;
  const [first, last] = reversed ? [highest, lowest] : [lowest, highest];
  const range = `${format(first)}–${format(last)}`;
  return unit === undefined ? range : `${range} ${unit}`;
}
