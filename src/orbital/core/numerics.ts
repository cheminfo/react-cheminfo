/**
 * The numerical machinery the radial functions are built on.
 *
 * Kept apart from `hydrogenic.ts` so that file reads as the physics it is —
 * `R(r)`, `⟨r⟩`, the nodes, the enclosing sphere — with none of it buried under
 * a polynomial recurrence and a bisection.
 */

/**
 * The generalised Laguerre polynomial `L^α_k(x)`, by its three-term recurrence.
 *
 * The closed form overflows well before `n = 7`; `k` is at most 6 here.
 * @param degree - Degree `k` of the polynomial.
 * @param alpha - Order `α` of the polynomial.
 * @param x - Where to evaluate it.
 * @returns The value of the polynomial.
 */
export function laguerre(degree: number, alpha: number, x: number): number {
  if (degree === 0) return 1;
  let previous = 1;
  let current = 1 + alpha - x;
  for (let index = 1; index < degree; index++) {
    const next =
      ((2 * index + 1 + alpha - x) * current - (index + alpha) * previous) /
      (index + 1);
    previous = current;
    current = next;
  }
  return current;
}

/**
 * The root of a function inside a bracket it already changes sign over.
 * @param radial - The function to find a zero of.
 * @param low - Lower end of the bracket.
 * @param high - Upper end.
 * @returns The root, to about a picometre.
 */
export function bisectRoot(
  radial: (distance: number) => number,
  low: number,
  high: number,
): number {
  let left = low;
  let right = high;
  const leftSign = radial(left) < 0;
  for (let step = 0; step < 60 && right - left > 1e-9; step++) {
    const middle = (left + right) / 2;
    if (radial(middle) < 0 === leftSign) left = middle;
    else right = middle;
  }
  return (left + right) / 2;
}

/**
 * Reject quantum numbers that are not a real orbital.
 * @param n - Principal quantum number.
 * @param l - Angular momentum quantum number.
 * @throws {RangeError} When `n < 1`, or ℓ is outside `0 … n − 1`.
 */
export function assertQuantumNumbers(n: number, l: number): void {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError(`the principal quantum number must be 1 or more`);
  }
  if (!Number.isInteger(l) || l < 0 || l >= n) {
    throw new RangeError(`ℓ must be between 0 and ${n - 1} for n = ${n}`);
  }
}

/**
 * The factorial of a small non-negative integer.
 * @param value - The integer.
 * @returns Its factorial.
 */
export function factorial(value: number): number {
  let result = 1;
  for (let index = 2; index <= value; index++) result *= index;
  return result;
}
