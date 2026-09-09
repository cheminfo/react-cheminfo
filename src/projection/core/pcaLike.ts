import type { MatrixLike } from '../../chart/core/matrix.ts';

/**
 * A fitted principal component analysis, described structurally so that
 * nothing in this package imports `ml-pca`.
 *
 * `ml-pca`'s `PCA` satisfies it as it stands, with no adapter and no cast.
 * `getEigenvectors`, `getStandardDeviations`, `invert` and `toJSON` are
 * deliberately absent: nothing here needs them, and `getEigenvectors` hands
 * out the model's live internal matrix, which a component library must never
 * be given.
 */
export interface PcaLike {
  /**
   * Place samples in the model's space.
   * @param samples - One array per sample, one value per original measurement.
   * @param options - `nComponents` keeps only the first few columns.
   * @param options.nComponents - How many of them to keep.
   * @returns One row per sample, one column per kept component.
   */
  predict: (
    samples: number[][],
    options?: { nComponents?: number },
  ) => MatrixLike;
  /** The share of the variance each component carries, as fractions summing to 1 — never percentages. */
  getExplainedVariance: () => number[];
  /** The running total of the above; the last value is 1 to within float error, so never compare it to 1. */
  getCumulativeVariance: () => number[];
  /** The variance of each component's own scores. */
  getEigenvalues: () => number[];
  /** Row `i` is component `i`, column `j` is original measurement `j`. */
  getLoadings: () => MatrixLike;
}
