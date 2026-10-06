/**
 * How a row holding two figures is divided, and how that travels in a link.
 *
 * The share is the *first* pane's, as a whole percentage, because it is written
 * into the address: `?split=35` is a number somebody can read off a link,
 * retype into a slide and hand out. A link that names none opens the page at
 * its own default, and nothing is written until a splitter has been dragged, so
 * an ordinary link stays an ordinary link.
 *
 * One name across the family: a reader who has learned to widen the chart on
 * one of our tools has learned it on all of them.
 */

import type { ShareParamCodec } from '../../share/core/params.ts';
import { integerParam } from '../../share/core/params.ts';

/** Query parameter a row's division is carried in, on every site. */
export const SPLIT_PARAM = 'split';

/**
 * The narrowest either pane is left at. Under a fifth of the row neither side
 * is read, and a drag that lands there is one nobody can undo without the
 * splitter they have just squeezed out of sight.
 */
export const MIN_SPLIT = 20;

/** The widest the first pane goes, which is {@link MIN_SPLIT} from the other end. */
export const MAX_SPLIT = 100 - MIN_SPLIT;

/** The range a row may be divided in, where a page wants its own. */
export interface SplitRange {
  /**
   * The narrowest the first pane is left at.
   * @default 20
   */
  min?: number;
  /**
   * The widest the first pane is left at.
   * @default 80
   */
  max?: number;
}

/**
 * The share to keep, given one asked for by a drag or named by a link.
 * @param value - The share asked for.
 * @param range - The range this row is divided in.
 * @returns A whole percentage inside it.
 */
export function clampSplit(value: number, range: SplitRange = {}): number {
  const { min = MIN_SPLIT, max = MAX_SPLIT } = range;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * The codec a site reads `split=` with, for its share vocabulary or its route
 * table. `null` is "the page's own share", which is what an absent parameter
 * and an unreadable one both mean, and what writes no parameter at all.
 * @param range - The range this row is divided in.
 * @returns The codec.
 */
export function splitParam(
  range: SplitRange = {},
): ShareParamCodec<number | null> {
  const { min = MIN_SPLIT, max = MAX_SPLIT } = range;
  return integerParam({ min, max, default: null });
}
