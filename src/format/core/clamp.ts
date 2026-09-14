/**
 * A number held inside a range.
 *
 * A value that is not a finite number — `NaN` from a failed parse, an infinity
 * from a division by zero, a stray value from a link — is not a position
 * between the bounds, so it lands on the fallback rather than on whichever
 * bound the comparison happens to pick.
 * @param value - The number to hold.
 * @param min - The smallest value allowed.
 * @param max - The largest value allowed.
 * @param fallback - What a value that is not finite becomes. Defaults to `min`.
 * @returns The value, raised to `min` or lowered to `max` when it runs past them.
 */
export function clamp(
  value: number,
  min: number,
  max: number,
  fallback = min,
): number {
  if (!Number.isFinite(value)) return fallback;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
