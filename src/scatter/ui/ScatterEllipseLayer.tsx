import type { ReactElement } from 'react';
import { memo } from 'react';

import type { ChartScale } from '../../chart/core/chartScale.ts';
import { columnMatrix } from '../../chart/core/matrix.ts';
import type { EllipseSize } from '../core/confidenceEllipse.ts';
import { DEFAULT_ELLIPSE_SIZE } from '../core/confidenceEllipse.ts';
import {
  scatterGroupSpread,
  scatterPairEllipse,
} from '../core/scatterGroupSpread.ts';

import { scatterOutlineShape } from './scatterOutlineShape.tsx';

/** What {@link ScatterEllipseLayer} needs. */
export interface ScatterEllipseLayerProps {
  /** Horizontal coordinate of every point, in data units. */
  x: ArrayLike<number>;
  /** Vertical coordinate of every point, in the same order. */
  y: ArrayLike<number>;
  /**
   * Which group each point belongs to, as an index into `colors`. A point with
   * `-1`, or an index outside the range, is left out of every outline.
   */
  groupOf: ArrayLike<number>;
  /** The colour of each group, in group order. */
  colors: readonly string[];
  /** Data to pixels, horizontally. */
  scaleX: ChartScale;
  /** Data to pixels, vertically; its `factor` is negative. */
  scaleY: ChartScale;
  /**
   * How much of each group its outline holds.
   * @default { kind: 'coverage', probability: 0.95 }
   */
  size?: EllipseSize;
  /**
   * How many points a group needs before it is outlined at all. Below it the
   * shape says more about the sample than about the group. A caption that has
   * to account for the groups left out reads them from `scatterSkippedGroups`,
   * over a `scatterGroupSpread` of the same points, size and minimum.
   * @default 3
   */
  minimumPoints?: number;
  /**
   * How strongly each outline is drawn, in group order.
   * @default undefined — every outline is drawn at full strength
   */
  opacities?: readonly number[];
  /**
   * How solid each region is; `0` draws nothing at all, since the fill is the
   * whole outline. Turn it down when many groups overlap, since the fills
   * compound.
   * @default SCATTER_OUTLINE_FILL_OPACITY
   */
  fillOpacity?: number;
}

/**
 * One outline per group, drawn through both scales.
 *
 * The outline is measured in the data's own units and drawn in pixels, and the
 * two axes almost never carry the same number of units per pixel — so scaling
 * the two radii and keeping the data-space angle would draw an ellipse of the
 * wrong shape at the wrong tilt. `scatterOutlineShape` transforms the spread
 * first and decomposes it after, which is exact on a linear axis.
 *
 * The outlines are drawn under the dots, which is what lets the region be
 * filled at all: the fill says where a group sits without taking the dots the
 * reader is there to count.
 * @param props - See {@link ScatterEllipseLayerProps}.
 * @returns The outlines.
 */
export const ScatterEllipseLayer = memo(function ScatterEllipseLayer(
  props: ScatterEllipseLayerProps,
): ReactElement {
  const {
    x,
    y,
    groupOf,
    colors,
    scaleX,
    scaleY,
    size = DEFAULT_ELLIPSE_SIZE,
    minimumPoints = 3,
    opacities,
    fillOpacity,
  } = props;

  const spread = scatterGroupSpread({
    scores: columnMatrix([x, y]),
    groupOf,
    groups: colors.length,
    axes: 2,
    size,
    minimumPoints,
  });
  const outlines: ReactElement[] = [];
  for (let group = 0; group < colors.length; group++) {
    const color = colors[group];
    if (color === undefined) continue;
    const measured = scatterPairEllipse(spread, group, 0, 1);
    if (measured === null) continue;
    const ink = { color, opacity: opacities?.[group], fillOpacity };
    outlines.push(scatterOutlineShape(group, measured, scaleX, scaleY, ink));
  }

  return <g data-layer="ellipses">{outlines}</g>;
});
