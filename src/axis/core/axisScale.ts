/**
 * Which of the two scales a quantity is read on, and who decided.
 *
 * Every quantity has a scale it is usually read on — a concentration spanning
 * ten decades is read logarithmically, a first ionisation energy linearly — and
 * a reader may overrule it. The two are kept apart rather than collapsed into
 * one boolean, because a figure that forgets which it is holding gets both of
 * the following wrong: picking another quantity has to bring that quantity's
 * own scale rather than carry the last one over, and a link has to stay silent
 * about a scale nobody chose, so that it keeps opening the way the quantity is
 * read even after the usual scale is reconsidered.
 */

/** The two scales an axis is drawn on. */
export type AxisScale = 'linear' | 'log';

/** A reader's choice, or `null` while they have not made one. */
export type AxisScaleChoice = AxisScale | null;

/**
 * The scale an axis is actually drawn on.
 * @param usual - How the quantity on the axis is normally read.
 * @param chosen - What the reader asked for, or `null` to leave it to the
 *   quantity.
 * @returns The scale to draw.
 */
export function resolveAxisScale(
  usual: AxisScale,
  chosen: AxisScaleChoice,
): AxisScale {
  return chosen ?? usual;
}

/**
 * Narrow an arbitrary string — one off a query parameter — to a scale.
 * @param value - Candidate scale.
 * @returns True when it is one of the two.
 */
export function isAxisScale(value: string): value is AxisScale {
  return value === 'linear' || value === 'log';
}
