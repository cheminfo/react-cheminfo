/**
 * How many components the pair grid may be asked to lay out.
 *
 * The bar and the panel behind the cog both offer the count, and a ceiling
 * worked out twice is a ceiling that ends up different in the two places — so
 * the reader would find the same stepper dead on one and live on the other.
 * It sits apart from both of them because it is arithmetic rather than a
 * control, and a module that exports a component exports nothing else.
 */

import {
  SCATTER_MATRIX_MOST_AXES,
  scatterMatrixAxesThatFit,
} from '../../scatter/ui/scatterMatrixLayout.ts';

/** How few and how many components the grid may be asked to lay out. */
export interface ProjectionPairsCeiling {
  /** The fewest, which is the smallest grid worth drawing. */
  min: number;
  /** The most, once the run and the width have both had their say. */
  max: number;
}

/**
 * The range the grid's count is held inside.
 *
 * Three things cap it at once: six, which is where thirty-six cells stop being
 * worth the room; what the run produced; and what the width can draw at a
 * readable size. Pressing past any of them is dead rather than silently
 * ignored, so the number in the bar is the number on the screen.
 * @param axisCount - How many components the run produced.
 * @param width - Width of the figure, in pixels; `0` before it is measured.
 * @returns See {@link ProjectionPairsCeiling}.
 */
export function projectionPairsCeiling(
  axisCount: number,
  width: number,
): ProjectionPairsCeiling {
  const wanted = Math.min(SCATTER_MATRIX_MOST_AXES, Math.max(0, axisCount));
  const fits = width > 0 ? scatterMatrixAxesThatFit(width, wanted) : wanted;
  return { min: SMALLEST_GRID, max: Math.max(SMALLEST_GRID, fits) };
}

/** The fewest components a grid is worth drawing for. */
const SMALLEST_GRID = 2;
