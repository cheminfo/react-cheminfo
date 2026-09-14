/**
 * Every group's outline over every pair of axes, measured once.
 *
 * A pair grid asks the same question of a group thirty-six times, and calling
 * `confidenceEllipse` per cell would gather that group's points into a fresh
 * array of objects each time — n² allocations to draw n axes, over the same
 * samples. The averages and the pairwise covariances say everything an outline
 * needs, they come out of two passes over the scores read where they stand,
 * and a cell then reads four numbers out of the block.
 */

import type { MatrixLike } from '../../chart/core/matrix.ts';

import type { ConfidenceEllipse, EllipseSize } from './confidenceEllipse.ts';
import {
  DEFAULT_ELLIPSE_SIZE,
  ellipseStandardDeviations,
  momentsEllipse,
} from './confidenceEllipse.ts';
import type { ScatterGroupMoments } from './scatterGroupMoments.ts';
import { scatterGroupMoments } from './scatterGroupMoments.ts';

/** How every group is spread over the axes a grid lays out. */
export interface ScatterGroupSpread extends ScatterGroupMoments {
  /** How far out an outline is drawn, in standard deviations. */
  standardDeviations: number;
  /** How many rows a group needs before it is outlined at all. */
  minimumPoints: number;
}

/** How {@link scatterGroupSpread} measures the groups. */
export interface ScatterGroupSpreadOptions {
  /** The coordinates: one row per sample, one column per axis, read in place. */
  scores: MatrixLike;
  /** Which group each row belongs to; a row outside the range is left out. */
  groupOf: ArrayLike<number>;
  /** How many groups there are. */
  groups: number;
  /** How many leading axes to measure over. */
  axes: number;
  /**
   * How large the outlines are drawn.
   * @default { kind: 'coverage', probability: 0.95 }
   */
  size?: EllipseSize;
  /**
   * How many rows a group needs before it is outlined at all.
   * @default 3
   */
  minimumPoints?: number;
}

/**
 * Measure every group over every laid-out axis, in two passes.
 *
 * A row missing a value in any one of the axes is left out of the group
 * altogether rather than only out of the cells that use that axis: an outline
 * that quietly covered a different set of samples in each cell would make the
 * grid disagree with itself, and a reader comparing two cells has no way to
 * see it. The spread uses the `n - 1` divisor, as `confidenceEllipse` does, so
 * a group outlined here and the same group outlined on the map come out the
 * same size.
 * @param options - See {@link ScatterGroupSpreadOptions}.
 * @returns The block, whose `counts` are what a caller reports as too small to outline.
 */
export function scatterGroupSpread(
  options: ScatterGroupSpreadOptions,
): ScatterGroupSpread {
  const { scores, groupOf, groups, axes } = options;
  const { size = DEFAULT_ELLIPSE_SIZE, minimumPoints = 3 } = options;
  return {
    ...scatterGroupMoments(scores, groupOf, groups, axes),
    standardDeviations: ellipseStandardDeviations(size),
    minimumPoints,
  };
}

/**
 * One group's outline for one pair of axes, in data units.
 *
 * The two-by-two block cut out of the covariances is a covariance in its own
 * right — that is what makes the grid affordable — so it decomposes into
 * radii and a tilt exactly as a pair measured on its own would.
 * @param spread - The block, from {@link scatterGroupSpread}.
 * @param group - Which group.
 * @param xAxis - The axis along the foot of the cell.
 * @param yAxis - The axis up its side.
 * @returns The outline, or `null` when the group is too small to have a shape, when either axis is outside the block, or when the requested size is unbounded.
 */
export function scatterPairEllipse(
  spread: ScatterGroupSpread,
  group: number,
  xAxis: number,
  yAxis: number,
): ConfidenceEllipse | null {
  const { standardDeviations, minimumPoints } = spread;
  return momentsEllipse(spread, {
    group,
    xAxis,
    yAxis,
    standardDeviations,
    minimumPoints,
  });
}

/**
 * The groups that get no outline for one pair of axes.
 *
 * An outline that quietly fails to appear reads as a bug in the plot, so a
 * caption has to account for these. They are exactly the groups for which
 * {@link scatterPairEllipse} answers `null`, which is what an outline layer
 * leaves undrawn — so a caller measuring the same points with the same size
 * and minimum names the same groups the figure leaves out.
 * @param spread - The block, from {@link scatterGroupSpread}.
 * @param xAxis - The axis along the foot of the plot.
 * @param yAxis - The axis up its side.
 * @returns The group indices, in ascending order.
 */
export function scatterSkippedGroups(
  spread: ScatterGroupSpread,
  xAxis: number,
  yAxis: number,
): number[] {
  const skipped: number[] = [];
  for (let group = 0; group < spread.counts.length; group++) {
    if (scatterPairEllipse(spread, group, xAxis, yAxis) === null) {
      skipped.push(group);
    }
  }
  return skipped;
}
