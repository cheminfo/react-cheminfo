/**
 * Hatching laid over a colour: a second, weaker reading of the same thing. A
 * periodic table coloured by how an element answers NMR hatches the elements
 * whose observable isotope is rare, and its legend draws the same hatch.
 */

/**
 * A CSS background drawing diagonal stripes of the ink over a colour.
 *
 * The stripes are the ink the cell already writes in, faded, so they show on a
 * light colour and on a dark one alike and never cost the text its contrast.
 * @param background - The colour underneath, as any CSS colour.
 * @param ink - The ink written on it, which the stripes are drawn in.
 * @param stripe - The width of one stripe, as any CSS length; the gap between
 * two is one and a half of it.
 * @returns The value of a CSS `background`.
 */
export function hatchedBackground(
  background: string,
  ink: string,
  stripe = '3px',
): string {
  const tint = `color-mix(in srgb, ${ink} 26%, transparent)`;
  return `repeating-linear-gradient(135deg, ${tint} 0 ${stripe}, transparent ${stripe} calc(${stripe} * 2.5)), ${background}`;
}
