/** Anything whose position in the viewport can be measured, as a heading's. */
interface MeasurableHeading {
  /** Where the heading sits, relative to the viewport. */
  getBoundingClientRect: () => { top: number };
}

/**
 * Which heading the reader is under.
 *
 * The headings are in document order, so the one being read is the last whose
 * top has passed the reading line. Before any has, the first counts, so a
 * table of contents always marks something.
 * @param headings - The headings, in document order.
 * @param readingLine - Distance from the top of the viewport, in CSS pixels,
 * a heading must pass to count as the one being read.
 * @returns Its index, or `-1` when there is no heading at all.
 */
export function activeHeadingIndex(
  headings: ArrayLike<MeasurableHeading>,
  readingLine: number,
): number {
  if (headings.length === 0) return -1;
  let active = 0;
  for (let index = 0; index < headings.length; index++) {
    const heading = headings[index] as MeasurableHeading;
    if (heading.getBoundingClientRect().top > readingLine) break;
    active = index;
  }
  return active;
}
