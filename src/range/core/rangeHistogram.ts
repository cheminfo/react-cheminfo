/**
 * The outline of a histogram whose bins split the track into equal widths, as
 * SVG path data in a box one unit wide and one unit tall.
 *
 * One stepped outline rather than a rectangle per bin: adjacent rectangles
 * leave a hairline seam between them wherever their shared edge falls between
 * two pixels, and a thousand bins would be two thousand elements.
 * @param counts - One count per bin, from the low end of the track.
 * @returns The path data, the tallest bin reaching the top; empty when nothing
 * was counted.
 */
export function rangeHistogramPath(counts: ArrayLike<number>): string {
  const bins = counts.length;
  let tallest = 0;
  for (let index = 0; index < bins; index++) {
    const count = counts[index] as number;
    if (count > tallest) tallest = count;
  }
  if (tallest <= 0) return '';

  let path = 'M0 1';
  for (let index = 0; index < bins; index++) {
    const count = counts[index] as number;
    const height = count > 0 ? count / tallest : 0;
    path += `V${trim(1 - height)}H${trim((index + 1) / bins)}`;
  }
  return `${path}V1Z`;
}

/**
 * A coordinate written with the five decimals a box of a few hundred pixels
 * can use.
 * @param value - The coordinate.
 * @returns Its text.
 */
function trim(value: number): string {
  return String(Math.round(value * 1e5) / 1e5);
}
