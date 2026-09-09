import type { ReactElement } from 'react';
import { memo, useEffect, useRef } from 'react';

import type { ChartScale } from '../../chart/core/chartScale.ts';
import type { EllipsePoint, EllipseSize } from '../core/confidenceEllipse.ts';
import { confidenceEllipse } from '../core/confidenceEllipse.ts';

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
   * shape says more about the sample than about the group.
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
  /**
   * Called with the groups too small to outline, as indices into `colors`,
   * whenever that set changes. An outline that quietly fails to appear reads
   * as a bug in the plot, so the caller is handed what its caption has to
   * account for.
   * @default undefined
   */
  onSkippedGroups?: (groups: readonly number[]) => void;
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
    size = DEFAULT_SIZE,
    minimumPoints = 3,
    opacities,
    fillOpacity,
    onSkippedGroups,
  } = props;

  const clouds = groupClouds(x, y, groupOf, colors.length);
  const outlines: ReactElement[] = [];
  const skipped: number[] = [];
  for (let group = 0; group < clouds.length; group++) {
    const color = colors[group];
    const cloud = clouds[group];
    if (color === undefined || cloud === undefined) continue;
    const measured = confidenceEllipse(cloud, { size, minimumPoints });
    if (measured === null) {
      skipped.push(group);
      continue;
    }
    const ink = { color, opacity: opacities?.[group], fillOpacity };
    outlines.push(scatterOutlineShape(group, measured, scaleX, scaleY, ink));
  }

  useSkippedReport(skipped, onSkippedGroups);
  return <g data-layer="ellipses">{outlines}</g>;
});

/** What a group is outlined at when the caller says nothing. */
const DEFAULT_SIZE: EllipseSize = { kind: 'coverage', probability: 0.95 };

/* Each group's points, gathered once so every group is measured in one pass. */
function groupClouds(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  groupOf: ArrayLike<number>,
  groups: number,
): EllipsePoint[][] {
  const clouds: EllipsePoint[][] = new Array(groups);
  for (let group = 0; group < groups; group++) clouds[group] = [];
  const total = Math.min(x.length, y.length, groupOf.length);
  for (let index = 0; index < total; index++) {
    const group = groupOf[index];
    if (group === undefined || group < 0 || group >= groups) continue;
    const px = x[index];
    const py = y[index];
    if (px === undefined || py === undefined) continue;
    clouds[group]?.push({ x: px, y: py });
  }
  return clouds;
}

/*
 * Report the skipped groups once each time the set changes. A fresh array is
 * built every render, so it is the joined indices that are compared and not
 * the array, which is what keeps a caller storing the answer from re-rendering
 * for ever.
 */
function useSkippedReport(
  skipped: readonly number[],
  report: ((groups: readonly number[]) => void) | undefined,
): void {
  const last = useRef('');
  const key = skipped.join(' ');
  useEffect(() => {
    if (last.current === key) return;
    last.current = key;
    report?.(skipped);
  });
}
