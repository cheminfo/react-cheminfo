import type { CSSProperties, ReactElement } from 'react';

import { chartAxisTitle } from '../../chart/core/chartLabels.ts';
import type { ChartFrameProps } from '../../chart/ui/ChartFrame.tsx';
import { ChartFrame } from '../../chart/ui/ChartFrame.tsx';

import type { ScatterMatrixGrid } from './ScatterMatrixDiagonal.tsx';
import { ScatterMatrixDiagonal } from './ScatterMatrixDiagonal.tsx';
import { scatterMatrixDots } from './scatterMatrixDots.tsx';
import {
  SCATTER_MATRIX_MARGINS as MARGINS,
  SCATTER_MATRIX_SHARE_IN_TITLE,
  scatterMatrixTickCount,
} from './scatterMatrixLayout.ts';
import { scatterMatrixOutlines } from './scatterMatrixOutlines.tsx';

/** What one cell of a `ScatterMatrix` needs. */
export interface ScatterMatrixCellProps {
  /** Everything the grid worked out once and every cell reads. */
  grid: ScatterMatrixGrid;
  /** Which row it sits in, which is the axis up its side. */
  row: number;
  /** Which column, which is the axis along its foot. */
  column: number;
}

/**
 * One cell of the grid: a frame on the two shared scales, the group outlines
 * and a cloud of dots — or the distribution that stands in for `y = x` where
 * the two axes are the same.
 *
 * Every cell reads one shared object rather than props of its own, because the
 * ranges, the counted distributions and the measured groups belong to the grid
 * and not to any one of its thirty-six cells.
 * @param props - See {@link ScatterMatrixCellProps}.
 * @returns The cell.
 */
export function ScatterMatrixCell(props: ScatterMatrixCellProps): ReactElement {
  const { grid, row, column } = props;
  const open = opener(grid, row, column);
  const pair = `${grid.axes[row]?.name ?? ''} versus ${grid.axes[column]?.name ?? ''}`;

  return (
    <div
      data-scatter-cell={`${column},${row}`}
      role={open === undefined ? 'img' : 'button'}
      tabIndex={open === undefined ? undefined : 0}
      aria-label={open === undefined ? pair : `${pair} — open`}
      style={open === undefined ? undefined : CLICKABLE_STYLE}
      onClick={open}
      onKeyDown={(event) => {
        if (open === undefined) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open();
      }}
    >
      <ChartFrame {...frameProps(grid, row, column)}>
        {(frame) =>
          row === column ? (
            <ScatterMatrixDiagonal grid={grid} axis={column} frame={frame} />
          ) : (
            <>
              {scatterMatrixOutlines(grid, row, column, frame)}
              {scatterMatrixDots(grid, row, column, frame)}
            </>
          )
        }
      </ChartFrame>
    </div>
  );
}

const CLICKABLE_STYLE = {
  cursor: 'pointer',
  borderRadius: 'var(--radius)',
} as const satisfies CSSProperties;

function frameProps(
  grid: ScatterMatrixGrid,
  row: number,
  column: number,
): Omit<ChartFrameProps, 'children'> {
  const { shown, side, axes, extents, spread, room } = grid;
  const across = axes[column];
  const up = axes[row];
  const first = column === 0;
  const last = row === shown - 1;
  const margins = {
    top: MARGINS.top,
    right: MARGINS.right,
    left: first ? room.left : MARGINS.left,
    bottom: last ? room.bottom : MARGINS.bottom,
  };
  const ticks = scatterMatrixTickCount(side);
  const wide =
    side + MARGINS.right + MARGINS.left >= SCATTER_MATRIX_SHARE_IN_TITLE;
  const alongTitle = chartAxisTitle(across?.name ?? '', wide ? across : {});
  const upTitle = chartAxisTitle(up?.name ?? '', wide ? up : {});
  return {
    width: side + MARGINS.right + margins.left,
    height: side + MARGINS.top + margins.bottom,
    margins,
    x: {
      domain: [extents[column]?.min ?? 0, extents[column]?.max ?? 1],
      label: last ? alongTitle : undefined,
      showTicks: last,
      tickCount: ticks,
    },
    y:
      row === column
        ? {
            domain: [0, spread[column]?.peak ?? 1],
            showTicks: false,
            showGrid: false,
          }
        : {
            domain: [extents[row]?.min ?? 0, extents[row]?.max ?? 1],
            label: first ? upTitle : undefined,
            showTicks: first,
            tickCount: ticks,
          },
  };
}

// A diagonal cell has no pair of its own, so it offers itself against the
// neighbour it is nearest: whoever clicked `PC 3` wants to see PC 3, and the
// map has to plot it against something.
function opener(
  grid: ScatterMatrixGrid,
  row: number,
  column: number,
): (() => void) | undefined {
  const { onSelectPair, shown } = grid;
  if (onSelectPair === undefined) return undefined;
  if (row !== column) return () => onSelectPair(column, row);
  if (shown < 2) return () => onSelectPair(row, row);
  const ending = row === shown - 1;
  return () => onSelectPair(ending ? row - 1 : row, ending ? row : row + 1);
}
