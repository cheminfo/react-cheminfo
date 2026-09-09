import type { CSSProperties, ReactElement } from 'react';

import type { ChartBins } from '../../chart/core/chartBins.ts';
import type { ChartExtent } from '../../chart/core/chartExtent.ts';
import type { MatrixLike } from '../../chart/core/matrix.ts';
import type { ChartFrameRender } from '../../chart/ui/ChartFrame.tsx';

import type { ScatterGroupSpread } from './scatterGroupSpread.ts';
import type { ScatterMatrixAxis } from './scatterMatrixProps.ts';

/**
 * What the grid works out once and every one of its cells reads.
 *
 * It lives here rather than beside the grid's own props only because that file
 * has no room left for it, and this is the leaf of the three.
 */
export interface ScatterMatrixGrid {
  /** The coordinates, read where they stand. */
  scores: MatrixLike;
  /** The axes, indexed by row and by column alike. */
  axes: readonly ScatterMatrixAxis[];
  /** How many axes are laid out, after any reduction for width. */
  shown: number;
  /** Side of every plot rectangle, in pixels — the same in every cell. */
  side: number;
  /** Room the left column and the bottom row keep for their ticks and titles. */
  room: { left: number; bottom: number };
  /** One range per axis, so a column reads across and a row reads down. */
  extents: readonly ChartExtent[];
  /** One counted distribution per axis, for the diagonal. */
  spread: readonly ChartBins[];
  /**
   * Every group measured over every laid-out axis, for the outlines, or
   * nothing when none are drawn: no groups were named, or the cells came out
   * too small to hold a readable outline.
   */
  groupSpread: ScatterGroupSpread | undefined;
  /** One colour per group, or nothing when no group was named. */
  colors: readonly string[] | undefined;
  /** Which group each row belongs to, or nothing when they are one crowd. */
  groupOf: ArrayLike<number> | undefined;
  /** One entry per row; a zero draws that row faint. */
  mask: Uint8Array | undefined;
  /** Radius of a dot, in pixels. */
  pointRadius: number;
  /** What a cell hands its pair of axes to when it is clicked. */
  onSelectPair: ((xAxis: number, yAxis: number) => void) | undefined;
  /** What a cell hands the row under the pointer to. */
  onHoverChange: ((index: number) => void) | undefined;
}

/** What one diagonal cell of a `ScatterMatrix` draws. */
export interface ScatterMatrixDiagonalProps {
  /** Everything the grid worked out once, including the counted spread. */
  grid: ScatterMatrixGrid;
  /** Which axis the cell stands on, both across and up. */
  axis: number;
  /** The rectangle and the two scales the cell was given. */
  frame: ChartFrameRender;
}

/**
 * The axis' own distribution, split by group and stacked.
 *
 * This is the cell a pair grid normally spends on the line `y = x`. That line
 * is the same in every grid ever drawn, so it says nothing about the data at
 * all, and a reader who has not been told otherwise takes a rising diagonal
 * for a correlation — the opposite of what orthogonal axes mean. A
 * distribution answers the question the reader actually brought: does this
 * component pull my groups apart on its own, or only in company? Two humps
 * that barely touch say yes; one hump says no, whatever the scatters around it
 * look like.
 *
 * The bars are counted over the same edges as the column's shared domain, so a
 * peak here sits directly above the dots it is made of.
 * @param props - See {@link ScatterMatrixDiagonalProps}.
 * @returns The distribution.
 */
export function ScatterMatrixDiagonal(
  props: ScatterMatrixDiagonalProps,
): ReactElement {
  const { grid, axis, frame } = props;
  const named = grid.axes[axis];
  const share = named?.share;

  return (
    <g>
      {bars(props)}
      <text
        x={frame.plot.left + CORNER_INSET}
        y={frame.plot.top + CORNER_BASELINE}
        style={NAME_STYLE}
      >
        {named?.name ?? ''}
      </text>
      {share === undefined ||
      !Number.isFinite(share) ||
      frame.plot.width < BOTH_CAPTIONS ? null : (
        <text
          x={frame.plot.right - CORNER_INSET}
          y={frame.plot.top + CORNER_BASELINE}
          textAnchor="end"
          style={SHARE_STYLE}
        >
          {`${(share * 100).toFixed(1)} %`}
        </text>
      )}
    </g>
  );
}

/** The ink the counts take when no group was named. */
const NO_GROUP_INK = 'var(--text-muted)';

/** How solid a band is: readable, and still honest where two overlap. */
const BAND_OPACITY = 0.55;

/** How far the corner captions sit inside the plot, and how far down. */
const CORNER_INSET = 6;
const CORNER_BASELINE = 13;

/**
 * The narrowest cell that holds the name and the share at once. Below it the
 * share is dropped rather than run into the name, because which component the
 * cell is comes first: a reader can find the share along the foot of the grid.
 */
const BOTH_CAPTIONS = 82;

/** The axis' name, in the corner a reader looks at first. */
const NAME_STYLE = {
  fill: 'var(--text)',
  fontSize: 10,
  fontWeight: 600,
  userSelect: 'none',
} as const satisfies CSSProperties;

/** Its share, kept quieter than the name it qualifies. */
const SHARE_STYLE = {
  fill: 'var(--text-muted)',
  fontSize: 10,
  fontVariantNumeric: 'tabular-nums',
  userSelect: 'none',
} as const satisfies CSSProperties;

function bars(props: ScatterMatrixDiagonalProps): ReactElement[] {
  const { grid, axis, frame } = props;
  const { x, y } = frame;
  const counted = grid.spread[axis];
  const marks: ReactElement[] = [];
  if (counted === undefined) return marks;

  for (let bin = 0; bin < counted.bins; bin++) {
    const from = counted.edges[bin];
    const to = counted.edges[bin + 1];
    if (from === undefined || to === undefined) continue;
    const left = x.offset + from * x.factor;
    const width = Math.max(1, x.offset + to * x.factor - left);

    let base = 0;
    for (let series = 0; series < counted.series; series++) {
      const count = counted.counts[series * counted.bins + bin] ?? 0;
      if (count === 0) continue;
      const top = y.offset + (base + count) * y.factor;
      marks.push(
        <rect
          key={`${series}-${bin}`}
          x={left}
          y={top}
          width={width}
          height={Math.max(0, y.offset + base * y.factor - top)}
          style={bandStyle(grid.colors?.[series] ?? NO_GROUP_INK)}
        />,
      );
      base += count;
    }
  }
  return marks;
}

function bandStyle(color: string): CSSProperties {
  return { fill: color, fillOpacity: BAND_OPACITY };
}
