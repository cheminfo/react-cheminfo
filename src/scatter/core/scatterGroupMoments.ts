/**
 * The one scan every group outline starts from: how many rows a group holds,
 * where its middle is, and how it varies between every pair of axes.
 *
 * A map outline, a cell of a pair grid and a shell in a cloud all ask this of
 * the same samples, and three copies of the loop are three places for the
 * divisor or the treatment of a missing value to drift apart.
 */

import { chartGroupIndex } from '../../chart/core/chartGroups.ts';
import type { MatrixLike } from '../../chart/core/matrix.ts';

/** How every group is spread over a run of axes. */
export interface ScatterGroupMoments {
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
   * and again at the transposed position, so a reader reads either way round.
   */
  covariances: Float64Array;
}

/**
 * Measure every group over the leading axes, in two passes over the scores
 * read where they stand.
 *
 * A row missing a value in any one of the axes is left out of its group
 * altogether, so every pair of axes describes the same samples. The spread
 * uses the `n - 1` divisor, which is what makes it an estimate of the group
 * rather than a statement about the handful of samples that happen to have
 * been measured.
 * @param scores - The coordinates: one row per sample, one column per axis.
 * @param groupOf - Which group each row belongs to, or `null` when every row is one group.
 * @param groups - How many groups there are.
 * @param axes - How many leading axes to measure over.
 * @returns The moments. A group of fewer than two rows keeps a zero spread.
 */
export function scatterGroupMoments(
  scores: MatrixLike,
  groupOf: ArrayLike<number> | null,
  groups: number,
  axes: number,
): ScatterGroupMoments {
  const groupCount = Math.max(0, Math.trunc(groups));
  const axisCount = Math.max(0, Math.min(Math.trunc(axes), scores.columns));
  const counts = new Int32Array(groupCount);
  const means = new Float64Array(groupCount * axisCount);
  const covariances = new Float64Array(groupCount * axisCount * axisCount);
  const moments = {
    axes: axisCount,
    groups: groupCount,
    counts,
    means,
    covariances,
  };
  if (groupCount === 0 || axisCount === 0) return moments;

  for (let row = 0; row < scores.rows; row++) {
    const group = groupAt(groupOf, row, groupCount);
    if (group < 0 || !finiteRow(scores, row, axisCount)) continue;
    counts[group] = (counts[group] ?? 0) + 1;
    const base = group * axisCount;
    for (let axis = 0; axis < axisCount; axis++) {
      means[base + axis] = (means[base + axis] ?? 0) + scores.get(row, axis);
    }
  }
  for (let group = 0; group < groupCount; group++) {
    const count = counts[group] ?? 0;
    if (count === 0) continue;
    const base = group * axisCount;
    for (let axis = 0; axis < axisCount; axis++) {
      means[base + axis] = (means[base + axis] ?? 0) / count;
    }
  }

  // One scratch row of deviations, reused for every sample: the alternative is
  // reading each value twice per pair, which is axes² reads instead of axes.
  const away = new Float64Array(axisCount);
  for (let row = 0; row < scores.rows; row++) {
    const group = groupAt(groupOf, row, groupCount);
    if (group < 0 || !finiteRow(scores, row, axisCount)) continue;
    const base = group * axisCount;
    for (let axis = 0; axis < axisCount; axis++) {
      away[axis] = scores.get(row, axis) - (means[base + axis] ?? 0);
    }
    const block = group * axisCount * axisCount;
    for (let a = 0; a < axisCount; a++) {
      const first = away[a] ?? 0;
      for (let b = 0; b < axisCount; b++) {
        const cell = block + a * axisCount + b;
        covariances[cell] = (covariances[cell] ?? 0) + first * (away[b] ?? 0);
      }
    }
  }
  const cells = axisCount * axisCount;
  for (let group = 0; group < groupCount; group++) {
    const divisor = (counts[group] ?? 0) - 1;
    if (divisor < 1) continue;
    const block = group * cells;
    for (let cell = 0; cell < cells; cell++) {
      covariances[block + cell] = (covariances[block + cell] ?? 0) / divisor;
    }
  }
  return moments;
}

function groupAt(
  groupOf: ArrayLike<number> | null,
  row: number,
  groups: number,
): number {
  return groupOf === null ? 0 : chartGroupIndex(groupOf, row, groups);
}

function finiteRow(scores: MatrixLike, row: number, axes: number): boolean {
  for (let axis = 0; axis < axes; axis++) {
    if (!Number.isFinite(scores.get(row, axis))) return false;
  }
  return true;
}
