/**
 * The marks a legend entry, a reference point or a series can be drawn with.
 *
 * It lives in the framework-free half although only a component ever draws
 * one, because the data that names a mark is written far from the drawing: a
 * k-means centroid says it is a cross while it is still a plain object, long
 * before any of it reaches React. Keeping the union here is what lets a result
 * describe its own marks without a `core` module reaching into a `ui` one.
 */

/** Which mark a legend entry, a marker or a series stands for. */
export type OverlayMarkShape =
  'dot' | 'ring' | 'square' | 'line' | 'dashed' | 'cross';

/**
 * Every mark, in the order a picker offers them.
 *
 * The first three separate one filled thing from another by colour alone; the
 * last three carry a second meaning on one figure — a line for a component
 * beside dots for the samples — which is what keeps a figure readable when the
 * colours run out or the reader does not separate two of them.
 */
export const OVERLAY_MARK_SHAPES: readonly OverlayMarkShape[] = [
  'dot',
  'ring',
  'square',
  'line',
  'dashed',
  'cross',
];

/**
 * Whether a mark is drawn as a solid area rather than as a stroke.
 *
 * A solid mark takes its colour as a fill and a stroked one as a stroke, which
 * is the one thing every renderer of a mark has to know and the one thing that
 * is easy to get wrong in each of them separately.
 * @param shape - The mark.
 * @returns `true` for the filled marks, `false` for the drawn ones.
 */
export function isFilledMark(shape: OverlayMarkShape): boolean {
  return shape === 'dot' || shape === 'square';
}
