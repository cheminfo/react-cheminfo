/**
 * A number as a hover card writes it.
 *
 * Three decimals, with the trailing zeros dropped, so a column of scores lines
 * up on its decimal point without `0.478000` claiming six digits of precision
 * that a projection of four measurements does not have. A value that is not a
 * number at all is written as a dash rather than as `NaN`, which reads to
 * everyone outside programming as a fault in the page.
 * @param value - The number.
 * @returns It, written out.
 */
export function formatProjectionValue(value: number): string {
  if (!Number.isFinite(value)) return UNKNOWN_VALUE;
  return String(Number(value.toFixed(DECIMALS)));
}

const DECIMALS = 3;
const UNKNOWN_VALUE = '—';
