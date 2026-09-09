/**
 * What a caller hands a {@link ScatterMatrix}.
 *
 * The types live beside the component rather than inside it because the grid's
 * own file would otherwise be mostly prose: a reader looking for what the
 * component draws should not have to scroll past twenty documented options to
 * find it.
 */

import type { ReactNode } from 'react';

import type { MatrixLike } from '../../chart/core/matrix.ts';
import type { EllipseSize } from '../core/confidenceEllipse.ts';

import type { ScatterGroup } from './scatterPlotProps.ts';

/** One axis of a {@link ScatterMatrix}. */
export interface ScatterMatrixAxis {
  /** What it is called, e.g. `PC 1`. */
  name: string;
  /**
   * The share of the differences it accounts for, between 0 and 1.
   * @default undefined — nothing is written after the name
   */
  share?: number;
}

/** What {@link ScatterMatrix} needs. */
export interface ScatterMatrixProps {
  /** The coordinates: one row per sample, one column per axis. */
  scores: MatrixLike;
  /** The axes, in order; only the first `count` are laid out. */
  axes: readonly ScatterMatrixAxis[];
  /**
   * How many axes to lay out, up to six. Reduced on its own when the container
   * is too narrow for readable cells, and the reduction is shown in the
   * options rather than applied silently.
   * @default the smaller of six and the number of axes
   */
  count?: number;
  /** Available width, in pixels, from `useContainerSize`. */
  width: number;
  /**
   * Which group each row belongs to, for the colours, for the outlines and for
   * the strip along the diagonal.
   * @default undefined — every row is drawn in one colour
   */
  groupOf?: ArrayLike<number>;
  /**
   * The groups, in the order they are coloured.
   * @default undefined
   */
  groups?: readonly ScatterGroup[];
  /**
   * How large the outline drawn around each group in each cell is, or `null`
   * for none. Nothing is outlined unless the groups are named.
   * @default { kind: 'coverage', probability: 0.95 }
   */
  ellipse?: EllipseSize | null;
  /**
   * How many rows a group needs before it is outlined at all. Below it the
   * shape says more about the sample than about the group.
   * @default 3
   */
  ellipseMinimumPoints?: number;
  /**
   * The rows selected elsewhere; the rest are drawn faint.
   * @default undefined — every row is drawn at full strength
   */
  selected?: readonly number[];
  /**
   * Called with the axis pair a cell stands for, so the map tab can take it
   * over. A diagonal cell offers itself against its neighbour, which is what
   * the reader meant by clicking it.
   * @default undefined — the cells are not clickable
   */
  onSelectPair?: (xAxis: number, yAxis: number) => void;
  /**
   * Called with the row under the pointer, or `-1`.
   * @default undefined
   */
  onHoverChange?: (index: number) => void;
  /**
   * How many bins the diagonal's distribution is cut into.
   * @default 24
   */
  bins?: number;
  /**
   * Radius of a dot, in pixels.
   * @default 2
   */
  pointRadius?: number;
  /**
   * What floats over the grid.
   * @default undefined
   */
  overlay?: ReactNode;
  /**
   * Value of the `data-testid` attribute of the wrapper.
   * @default undefined
   */
  testId?: string;
}
