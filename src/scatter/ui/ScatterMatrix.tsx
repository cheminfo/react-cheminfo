import type { CSSProperties, ReactElement } from 'react';
import { useMemo } from 'react';

import type { ChartBins } from '../../chart/core/chartBins.ts';
import { chartBinCounts } from '../../chart/core/chartBins.ts';
import type { ChartExtent } from '../../chart/core/chartExtent.ts';
import { chartColumnExtent } from '../../chart/core/chartExtent.ts';
import { OverlayLayer } from '../../overlay/ui/OverlayLayer.tsx';
import type { EllipseSize } from '../core/confidenceEllipse.ts';
import { scatterSelectionMask } from '../core/scatterSelection.ts';

import { ScatterMatrixCell } from './ScatterMatrixCell.tsx';
import type { ScatterMatrixGrid } from './ScatterMatrixDiagonal.tsx';
import { scatterGroupSpread } from './scatterGroupSpread.ts';
import {
  SCATTER_MATRIX_GAP as GAP,
  SCATTER_MATRIX_MARGINS as MARGINS,
  SCATTER_MATRIX_MOST_AXES,
  SCATTER_MATRIX_ROOM as ROOM,
  SCATTER_MATRIX_SMALLEST_OUTLINE,
  SCATTER_MATRIX_SMALLEST_PLOT,
  scatterMatrixAxesThatFit,
  scatterMatrixPlotSide,
} from './scatterMatrixLayout.ts';
import type { ScatterMatrixProps } from './scatterMatrixProps.ts';

export type {
  ScatterMatrixAxis,
  ScatterMatrixProps,
} from './scatterMatrixProps.ts';

/**
 * The same map drawn for every pair of axes, sharing one scale per axis.
 *
 * The diagonal draws the axis' own distribution split by group rather than the
 * line `y = x`: that line is identical in every grid ever drawn, says nothing
 * about the data, and reads to an end user as a correlation, which is the
 * opposite of what orthogonal axes are. The distribution answers the question
 * the reader actually has — does this component separate my groups on its own?
 *
 * Every group is measured once over every laid-out axis rather than once per
 * cell, so six components cost one pass over the scores and not thirty-six.
 * @param props - See {@link ScatterMatrixProps}.
 * @returns The grid.
 */
export function ScatterMatrix(props: ScatterMatrixProps): ReactElement {
  const { scores, axes, width, groupOf, groups, selected } = props;
  const { overlay, testId, onSelectPair, onHoverChange } = props;
  const { bins = DEFAULT_BINS, pointRadius = DEFAULT_RADIUS } = props;
  const { ellipse = DEFAULT_ELLIPSE, ellipseMinimumPoints = 3 } = props;
  const { count = Math.min(SCATTER_MATRIX_MOST_AXES, axes.length) } = props;

  const wanted = Math.min(count, axes.length, scores.columns);
  const shown = scatterMatrixAxesThatFit(width, wanted);
  const side = Math.max(
    SCATTER_MATRIX_SMALLEST_PLOT,
    scatterMatrixPlotSide(width, shown),
  );

  const shape = useMemo(() => {
    const series = groups?.length ?? 1;
    const extents: ChartExtent[] = [];
    const spread: ChartBins[] = [];
    for (let axis = 0; axis < shown; axis++) {
      const over = chartColumnExtent(scores, axis, { padding: EXTENT_PADDING });
      extents.push(over);
      spread.push(
        chartBinCounts(scores, axis, over, bins, groupOf ?? null, series),
      );
    }
    return { extents, spread };
  }, [scores, shown, bins, groupOf, groups]);

  const colors = useMemo(() => {
    if (groups === undefined) return undefined;
    const inks: string[] = [];
    for (const group of groups) inks.push(group.color);
    return inks;
  }, [groups]);

  // Nothing is measured for a grid that will not draw the answer: no groups,
  // outlines turned off, or cells too small to hold one legibly.
  const outlined =
    ellipse !== null &&
    groupOf !== undefined &&
    (groups?.length ?? 0) > 0 &&
    side >= SCATTER_MATRIX_SMALLEST_OUTLINE;
  const groupSpread = useMemo(() => {
    if (!outlined || groupOf === undefined || ellipse === null) {
      return undefined;
    }
    return scatterGroupSpread({
      scores,
      groupOf,
      groups: groups?.length ?? 0,
      axes: shown,
      size: ellipse,
      minimumPoints: ellipseMinimumPoints,
    });
  }, [outlined, scores, groupOf, groups, shown, ellipse, ellipseMinimumPoints]);

  // An empty selection is not a selection. Dimming exists to set what the
  // reader picked against what they did not, so with nothing picked there is
  // nothing to set it against, and dimming every dot would leave the grid
  // looking blank rather than looking unselected.
  const mask = useMemo(() => {
    if (selected === undefined) return undefined;
    const built = scatterSelectionMask(selected, scores.rows);
    return built.includes(1) ? built : undefined;
  }, [selected, scores]);

  const grid: ScatterMatrixGrid = {
    ...props,
    ...shape,
    shown,
    side,
    room: ROOM,
    colors,
    groupOf,
    groupSpread,
    mask,
    pointRadius,
    onSelectPair,
    onHoverChange,
  };
  const cells: ReactElement[] = [];
  for (let row = 0; row < shown; row++) {
    for (let column = 0; column < shown; column++) {
      cells.push(
        <ScatterMatrixCell
          key={`${column}-${row}`}
          grid={grid}
          row={row}
          column={column}
        />,
      );
    }
  }

  const rest = Math.max(0, shown - 1);
  const inner = `${side + MARGINS.right + MARGINS.left}px `;
  const above = `${side + MARGINS.top + MARGINS.bottom}px `;
  return (
    <div style={{ position: 'relative', width }} data-testid={testId}>
      <div
        style={{
          ...GRID_STYLE,
          gridTemplateColumns: `${side + MARGINS.right + ROOM.left}px ${inner.repeat(rest)}`,
          gridTemplateRows: `${above.repeat(rest)}${side + MARGINS.top + ROOM.bottom}px`,
        }}
      >
        {cells}
      </div>
      {overlay === undefined ? null : (
        <OverlayLayer width={width}>{overlay}</OverlayLayer>
      )}
    </div>
  );
}

/** Bins cut, dot radius and clear space when none is named. */
const DEFAULT_BINS = 24;
const DEFAULT_RADIUS = 2;
const EXTENT_PADDING = 0.06;

/**
 * What a group is outlined at when the caller says nothing, held as one
 * constant so that a grid redrawn on a hover does not measure its groups again
 * for a size that never changed.
 */
const DEFAULT_ELLIPSE: EllipseSize = { kind: 'coverage', probability: 0.95 };

const GRID_STYLE = {
  display: 'grid',
  gap: GAP,
  justifyContent: 'start',
} as const satisfies CSSProperties;
