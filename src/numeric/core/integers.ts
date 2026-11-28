/**
 * The greatest common divisor of two whole numbers, never negative.
 * @param a - One.
 * @param b - The other.
 * @returns gcd(a, b); 0 only when both are 0.
 */
export function greatestCommonDivisor(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const rest = x % y;
    x = y;
    y = rest;
  }
  return x;
}

/**
 * The least common multiple of two whole numbers, never negative.
 * @param a - One.
 * @param b - The other.
 * @returns lcm(a, b); 0 when either is 0.
 */
export function leastCommonMultiple(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / greatestCommonDivisor(a, b)) * b);
}
