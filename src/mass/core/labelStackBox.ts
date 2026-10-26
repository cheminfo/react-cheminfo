/**
 * The room a stack of labels over a peak takes, and the peak a pointer resting
 * on it reports.
 *
 * The numbers of a stack take no pointer event of their own: the room they
 * occupy does, as one rectangle per stack, so a stack can be interrogated —
 * resting on it opens whatever a host shows about that peak — without the
 * glyphs becoming a control or stopping the crosshair underneath.
 */

import { PEAK_LABEL } from '../../chart/core/chartTheme.ts';

/** A rectangle in the pixels of the SVG. */
export interface StackBox {
  /** Its left edge. */
  x: number;
  /** Its top edge. */
  y: number;
  /** How wide it is. */
  width: number;
  /** How tall. */
  height: number;
}

/** The peak the pointer is resting on, as the labels report it. */
export interface HoveredPeak {
  /** `${spectrumId}:${index}`, which is how anything said about it is found. */
  key: string;
  /** The m/z measured for it. */
  mz: number;
  /** Its intensity, in the units its spectrum was drawn in. */
  intensity: number;
  /** The charge established for it, `0` when none was. */
  charge: number;
  /** Where a card about it is anchored, in pixels across the SVG. */
  x: number;
  /** The edge of the label stack it hangs off, in pixels down the SVG. */
  y: number;
}

/**
 * The room a stack of labels takes, which is what answers the pointer.
 *
 * A baseline is where the glyphs of a line *sit*, so the box starts a line
 * height above the topmost one and stops just under the lowest. How wide it is
 * cannot be measured from here — an SVG knows nothing of the host's font until
 * it is on screen — so it is the width the theme says a label claims, which is
 * the same number the stacks are spaced by.
 * @param x - Where the stack is centred, in pixels.
 * @param baselines - Where each of its lines is written, in any order.
 * @returns The box, of no size at all when the stack has no lines.
 */
export function labelStackBox(
  x: number,
  baselines: readonly number[] | Float64Array,
): StackBox {
  const { lineHeight, hoverHalfWidth } = PEAK_LABEL;
  let highest = Number.POSITIVE_INFINITY;
  let lowest = Number.NEGATIVE_INFINITY;
  for (const baseline of baselines) {
    if (baseline < highest) highest = baseline;
    if (baseline > lowest) lowest = baseline;
  }
  if (!Number.isFinite(highest)) return { x, y: 0, width: 0, height: 0 };

  return {
    x: x - hoverHalfWidth,
    y: highest - lineHeight,
    width: hoverHalfWidth * 2,
    height: lowest - highest + lineHeight + DESCENDER,
  };
}

/** How far a glyph reaches below its baseline, near enough for a hit area. */
const DESCENDER = 3;
