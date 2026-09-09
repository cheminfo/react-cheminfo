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
import type {
  ConfidenceEllipse,
  EllipseCovariance,
  EllipseSize,
} from '../core/confidenceEllipse.ts';
import {
  ellipseAxes,
  ellipseStandardDeviations,
} from '../core/confidenceEllipse.ts';

/** How every group is spread over the axes a grid lays out. */
export interface ScatterGroupSpread {
  /** How many leading axes each block covers. */
  axes: number;
  /** How many groups it holds. */
  groups: number;
  /** How many rows went into each group, in group order. */
  counts: Int32Array;
  /** Each group's average along each axis, at `group * axes + axis`. */
  means: Float64Array;
  /**
   * How each group varies between two axes, at `(group * axes + a) * axes + b`
   * and again at the transposed position, so a cell reads either way round.
   */
  covariances: Float64Array;
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
  const { scores, groupOf, size = DEFAULT_SIZE, minimumPoints = 3 } = options;
  const groups = Math.max(0, Math.trunc(options.groups));
  const axes = Math.max(0, Math.min(Math.trunc(options.axes), scores.columns));
  const counts = new Int32Array(groups);
  const means = new Float64Array(groups * axes);
  const covariances = new Float64Array(groups * axes * axes);
  const spread: ScatterGroupSpread = {
    axes,
    groups,
    counts,
    means,
    covariances,
    standardDeviations: ellipseStandardDeviations(size),
    minimumPoints,
  };
  if (groups === 0 || axes === 0) return spread;

  for (let row = 0; row < scores.rows; row++) {
    const group = groupAt(groupOf, row, groups);
    if (group < 0 || !finiteRow(scores, row, axes)) continue;
    counts[group] = (counts[group] ?? 0) + 1;
    const base = group * axes;
    for (let axis = 0; axis < axes; axis++) {
      means[base + axis] = (means[base + axis] ?? 0) + scores.get(row, axis);
    }
  }
  for (let group = 0; group < groups; group++) {
    const count = counts[group] ?? 0;
    if (count === 0) continue;
    const base = group * axes;
    for (let axis = 0; axis < axes; axis++) {
      means[base + axis] = (means[base + axis] ?? 0) / count;
    }
  }

  // One scratch row of deviations, reused for every sample: the alternative is
  // reading each value twice per pair, which is axes² reads instead of axes.
  const away = new Float64Array(axes);
  for (let row = 0; row < scores.rows; row++) {
    const group = groupAt(groupOf, row, groups);
    if (group < 0 || !finiteRow(scores, row, axes)) continue;
    const base = group * axes;
    for (let axis = 0; axis < axes; axis++) {
      away[axis] = scores.get(row, axis) - (means[base + axis] ?? 0);
    }
    const block = group * axes * axes;
    for (let a = 0; a < axes; a++) {
      const first = away[a] ?? 0;
      for (let b = 0; b < axes; b++) {
        const cell = block + a * axes + b;
        covariances[cell] = (covariances[cell] ?? 0) + first * (away[b] ?? 0);
      }
    }
  }
  for (let group = 0; group < groups; group++) {
    const divisor = (counts[group] ?? 0) - 1;
    if (divisor < 1) continue;
    const block = group * axes * axes;
    for (let cell = 0; cell < axes * axes; cell++) {
      covariances[block + cell] = (covariances[block + cell] ?? 0) / divisor;
    }
  }
  return spread;
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
  const { axes, groups, counts, means, covariances } = spread;
  const { minimumPoints, standardDeviations } = spread;
  if (group < 0 || group >= groups) return null;
  if (xAxis < 0 || yAxis < 0 || xAxis >= axes || yAxis >= axes) return null;
  const count = counts[group] ?? 0;
  if (count < Math.max(2, minimumPoints)) return null;

  const base = group * axes;
  const block = group * axes * axes;
  const covariance: EllipseCovariance = {
    xx: covariances[block + xAxis * axes + xAxis] ?? 0,
    xy: covariances[block + xAxis * axes + yAxis] ?? 0,
    yy: covariances[block + yAxis * axes + yAxis] ?? 0,
  };
  const { rx, ry, angle } = ellipseAxes(covariance, standardDeviations);
  const cx = means[base + xAxis] ?? 0;
  const cy = means[base + yAxis] ?? 0;
  if (!Number.isFinite(rx) || !Number.isFinite(ry)) return null;
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  return { cx, cy, rx, ry, angle, count, covariance };
}

/** What a group is outlined at when the caller says nothing. */
const DEFAULT_SIZE: EllipseSize = { kind: 'coverage', probability: 0.95 };

function groupAt(
  groupOf: ArrayLike<number>,
  row: number,
  groups: number,
): number {
  const raw = groupOf[row];
  if (raw === undefined || !Number.isFinite(raw)) return -1;
  const group = Math.trunc(raw);
  return group < 0 || group >= groups ? -1 : group;
}

function finiteRow(scores: MatrixLike, row: number, axes: number): boolean {
  for (let axis = 0; axis < axes; axis++) {
    if (!Number.isFinite(scores.get(row, axis))) return false;
  }
  return true;
}
