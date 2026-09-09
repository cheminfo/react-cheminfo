/**
 * The group outlines of one cell of a pair grid.
 *
 * They are the same shapes the map draws, projected through the cell's own two
 * scales rather than reused from the map's: an ellipse tilted by thirty
 * degrees in the data is tilted by something else entirely on a plot whose two
 * axes carry different numbers of pixels per unit, and a grid whose cells
 * disagree with the map about where a group sits is worse than a grid with no
 * outlines at all.
 */

import type { ReactElement } from 'react';

import type { ChartFrameRender } from '../../chart/ui/ChartFrame.tsx';

import type { ScatterMatrixGrid } from './ScatterMatrixDiagonal.tsx';
import { scatterPairEllipse } from './scatterGroupSpread.ts';
import { scatterOutlineShape } from './scatterOutlineShape.tsx';

/**
 * One outline per group, for the pair of axes a cell stands for.
 *
 * The whole layer is one element so that its keys cannot collide with the
 * marks drawn beside it, and so an end-to-end test finds the outlines of a
 * cell the same way it finds those of the map.
 * @param grid - Everything the grid worked out once, including the measured groups.
 * @param row - Which row the cell sits in, which is the axis up its side.
 * @param column - Which column, which is the axis along its foot.
 * @param frame - The rectangle and the two scales the cell was given.
 * @returns The layer, or `null` when the groups were never measured — no groups were named, or the cells came out too small for a readable outline.
 */
export function scatterMatrixOutlines(
  grid: ScatterMatrixGrid,
  row: number,
  column: number,
  frame: ChartFrameRender,
): ReactElement | null {
  const { groupSpread, colors } = grid;
  if (groupSpread === undefined || colors === undefined) return null;

  const outlines: ReactElement[] = [];
  for (let group = 0; group < groupSpread.groups; group++) {
    const color = colors[group];
    if (color === undefined) continue;
    const measured = scatterPairEllipse(groupSpread, group, column, row);
    if (measured === null) continue;
    outlines.push(
      scatterOutlineShape(group, measured, frame.x, frame.y, { color }),
    );
  }
  if (outlines.length === 0) return null;
  return <g data-layer="ellipses">{outlines}</g>;
}
