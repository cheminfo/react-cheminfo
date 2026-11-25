/**
 * What joins a number and its unit: a no-break space, so a line never parts
 * them — `238 MB`, `25 %`, `3 min 20 s`.
 */
export const UNIT_SPACE = '\u00A0';

/**
 * A number and its unit as one word, so no line cuts them apart: `1.075 nm`,
 * `327 px²`, `25 %`; a number without a unit stays as it is.
 * @param number - The number, written.
 * @param unit - Its unit; the empty text for none.
 * @returns The two joined by {@link UNIT_SPACE}.
 */
export function withUnit(number: string, unit: string): string {
  return unit === '' ? number : `${number}${UNIT_SPACE}${unit}`;
}
