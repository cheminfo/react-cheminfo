const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUPERSCRIPT_MINUS = '⁻';

/**
 * A whole number written in Unicode superscript characters: `14` becomes `¹⁴`,
 * `-3` becomes `⁻³`.
 *
 * It is how an exponent, a charge or a subshell occupancy is written inside a
 * plain string — an axis title, an `<option>`, a copied value — where no
 * `<sup>` element can go.
 * @param value - The number to write; anything after the decimal point is dropped.
 * @returns The superscript digits with their sign, or an empty string when the value is not finite.
 */
export function formatSuperscript(value: number): string {
  if (!Number.isFinite(value)) return '';
  const whole = Math.trunc(value);
  let text = whole < 0 ? SUPERSCRIPT_MINUS : '';
  for (const digit of Math.abs(whole).toString()) {
    text += SUPERSCRIPT_DIGITS.charAt(Number(digit));
  }
  return text;
}
