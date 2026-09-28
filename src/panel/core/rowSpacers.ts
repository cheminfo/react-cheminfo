/**
 * The empty room a virtualised table leaves around the rows it actually drew.
 *
 * A table that draws twenty of five thousand rows must still be five thousand
 * rows tall, or the scrollbar would say the list is a screenful long and the
 * rows would jump under the thumb. Two empty rows carry that height — one above
 * the drawn ones, one below — which keeps every cell in the column layout the
 * browser computes for a real table, where absolutely positioning the rows
 * would not.
 */

/** Where one drawn row sits in the list, in pixels from the top of it. */
export interface RowPlacement {
  /** Its top edge. */
  start: number;
  /** Its bottom edge. */
  end: number;
}

/** The two empty rows standing in for everything that was not drawn. */
export interface RowSpacers {
  /** How tall the one above the drawn rows is, in pixels. */
  before: number;
  /** How tall the one below them is. */
  after: number;
}

/**
 * The height of the empty row above the drawn rows and of the one below.
 *
 * With nothing drawn — the first render, before the scroll region has been
 * measured, and every render of an empty table — the whole list becomes the
 * lower spacer. That is what gives the region a scrollbar of the right length
 * on the render before it knows which rows are in view, instead of a table that
 * measures nothing because it is showing nothing.
 * @param drawn - The rows being drawn, in order.
 * @param total - How tall the whole list is, in pixels.
 * @returns The height of each spacer.
 */
export function rowSpacers(
  drawn: readonly RowPlacement[],
  total: number,
): RowSpacers {
  const first = drawn[0];
  const last = drawn.at(-1);
  if (first === undefined || last === undefined) {
    return { before: 0, after: Math.max(0, total) };
  }
  return { before: first.start, after: Math.max(0, total - last.end) };
}
