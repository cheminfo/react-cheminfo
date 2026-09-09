/**
 * The dots of one cell of a pair grid, and the surface that finds them again.
 *
 * They are not an element each. Six axes over five thousand samples is a
 * hundred and eighty thousand marks, and a browser handed that many nodes
 * stops answering the pointer long before it paints; one path of zero-length
 * round-capped segments a colour is at most sixteen nodes a cell and draws the
 * same discs. The scores are read where they stand for the same reason: a grid
 * copying a column per cell allocates n² arrays to show n.
 */

import type { CSSProperties, PointerEvent, ReactElement } from 'react';

import type { ChartFrameRender } from '../../chart/ui/ChartFrame.tsx';

import type { ScatterMatrixGrid } from './ScatterMatrixDiagonal.tsx';

/**
 * Every dot of one cell, as one path per colour, plus the rectangle that turns
 * a pointer position back into a row when the caller wants hovering.
 * @param grid - Everything the grid worked out once and every cell reads.
 * @param row - Which row the cell sits in, which is the axis up its side.
 * @param column - Which column, which is the axis along its foot.
 * @param frame - The rectangle and the two scales the cell was given.
 * @returns The marks, in the order they stack.
 */
export function scatterMatrixDots(
  grid: ScatterMatrixGrid,
  row: number,
  column: number,
  frame: ChartFrameRender,
): ReactElement[] {
  const { scores, colors, groupOf, mask, pointRadius, onHoverChange } = grid;
  const { x, y, plot } = frame;
  const inks = (colors?.length ?? 0) + 1;
  const paths: string[] = new Array(inks * 2).fill('');

  for (let index = 0; index < scores.rows; index++) {
    const valueX = scores.get(index, column);
    const valueY = scores.get(index, row);
    if (!Number.isFinite(valueX) || !Number.isFinite(valueY)) continue;
    const atX = Math.round((x.offset + valueX * x.factor) * 10) / 10;
    const atY = Math.round((y.offset + valueY * y.factor) * 10) / 10;
    const slot =
      inkOf(groupOf, index, inks - 1) * 2 + (mask?.[index] === 0 ? 1 : 0);
    paths[slot] = `${paths[slot] ?? ''}M${atX} ${atY}h0`;
  }

  const marks: ReactElement[] = [];
  for (let slot = 0; slot < paths.length; slot++) {
    const data = paths[slot];
    if (data === undefined || data === '') continue;
    const ink = colors?.[slot >> 1] ?? NO_GROUP_INK;
    const style = dotStyle(ink, pointRadius, slot);
    marks.push(<path key={slot} d={data} style={style} />);
  }
  if (onHoverChange !== undefined) {
    marks.push(
      <rect
        key="tracking"
        x={plot.left}
        y={plot.top}
        width={plot.width}
        height={plot.height}
        style={TRACKING_STYLE}
        onPointerMove={(event) =>
          onHoverChange(nearestRow(event, grid, row, column, frame))
        }
        onPointerLeave={() => onHoverChange(-1)}
      />,
    );
  }
  return marks;
}

/** How far from a dot the pointer still counts as resting on it, in pixels. */
const HOVER_REACH = 10;

/** Opacity of a dot in the selection, of one outside it, and the ungrouped ink. */
const POINT_OPACITY = 0.85;
const FAINT_OPACITY = 0.16;
const NO_GROUP_INK = 'var(--text-muted)';

/** The rectangle that takes the pointer, over the dots and invisible. */
const TRACKING_STYLE = {
  fill: 'none',
  pointerEvents: 'all',
} as const satisfies CSSProperties;

function nearestRow(
  event: PointerEvent<SVGRectElement>,
  grid: ScatterMatrixGrid,
  row: number,
  column: number,
  frame: ChartFrameRender,
): number {
  const { offsetX, offsetY } = event.nativeEvent;
  const { scores } = grid;
  const { x, y } = frame;
  let best = -1;
  let closest = HOVER_REACH * HOVER_REACH;

  for (let index = 0; index < scores.rows; index++) {
    const awayX = x.offset + scores.get(index, column) * x.factor - offsetX;
    const awayY = y.offset + scores.get(index, row) * y.factor - offsetY;
    const away = awayX * awayX + awayY * awayY;
    if (away < closest) {
      closest = away;
      best = index;
    }
  }
  return best;
}

function dotStyle(color: string, radius: number, slot: number): CSSProperties {
  return {
    fill: 'none',
    stroke: color,
    strokeWidth: radius * 2,
    strokeLinecap: 'round',
    strokeOpacity: (slot & 1) === 1 ? FAINT_OPACITY : POINT_OPACITY,
  };
}

function inkOf(
  groupOf: ArrayLike<number> | undefined,
  row: number,
  groups: number,
): number {
  const raw = groupOf?.[row];
  if (raw === undefined || !Number.isFinite(raw)) return groups;
  const group = Math.trunc(raw);
  return group < 0 || group >= groups ? groups : group;
}
