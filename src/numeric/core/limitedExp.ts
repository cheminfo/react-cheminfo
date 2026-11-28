/**
 * The exponential of a value, carried on along its tangent beyond a bound so
 * a guess far off never overflows: what a Newton iteration over a diode or an
 * electrode law linearizes.
 * @param value - The exponent.
 * @param max - The exponent past which the exponential turns into its tangent.
 * @default max 80
 * @returns The value, and its derivative.
 */
export function limitedExp(
  value: number,
  max = 80,
): { value: number; slope: number } {
  if (value <= max) {
    const exponential = Math.exp(value);
    return { value: exponential, slope: exponential };
  }
  const edge = Math.exp(max);
  return { value: edge * (1 + value - max), slope: edge };
}
