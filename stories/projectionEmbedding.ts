/**
 * A two-dimensional embedding of the same 150 iris flowers, saved as numbers.
 *
 * It is saved rather than computed because a story has to draw the same
 * picture on every reload — a layout that moves between two visits of the same
 * page teaches the reader that the tool is unreliable — and because no
 * neighbour-embedding library is a dependency of this package, nor should one
 * become one to hold up a demonstration.
 *
 * How it was made, once, in a throwaway script over `getNumbers()` from
 * `ml-dataset-iris`: every measurement standardised; the undirected graph of
 * each flower's fifteen nearest neighbours; a starting layout drawn uniformly
 * from [-10, 10] by a linear congruential generator seeded 20260907
 * (`seed = (1664525 seed + 1013904223) mod 2^32`); then two hundred epochs of
 * UMAP's own optimisation — the attractive gradient along every edge and five
 * repulsive negative samples per edge, at `a = 0.5833801364730748` and
 * `b = 1.3341591883535483`, the pair UMAP fits for a spread of 1 and a
 * minimum distance of 0.5 — with the learning rate falling from 1 to 0. The
 * result was moved onto its own mean and rounded to two decimals.
 *
 * It is therefore the shape a UMAP run gives rather than the output of one:
 * setosa on an island of its own, versicolor and virginica touching along one
 * edge, which is what those three species do under every neighbour embedding.
 */

import type { MatrixLike } from '../src/chart/core/index.ts';

/** The coordinates, the two of one flower after the two of the last. */
const COORDINATES: readonly number[] = [
  9.97, -2.44, 5.72, -3.9, 7.01, -3.59, 5.71, -4.53, 9.65, -1.24, 10.89, -0.66,
  8.1, -3.13, 9.33, -3.07, 5.79, -5, 6.17, -3.59, 9.44, -0.67, 8.47, -2.59,
  6.64, -4.91, 6.24, -5.05, 10, -0.37, 9.59, -0.27, 10.5, -0.03, 9.28, -2.05,
  10.79, -0.85, 10.57, -1.02, 8.93, -1.54, 9.77, -1.16, 10.25, -2.61, 8.98,
  -3.58, 8.63, -3, 7.09, -4.08, 9.23, -2.11, 9.89, -1.96, 9.16, -2.76, 6.98,
  -4.41, 6.31, -4.12, 9.54, -2.73, 10.61, -1.18, 10.25, -0.26, 6.54, -4.13,
  6.84, -3.84, 9.9, -1.69, 9.86, -1.71, 6.25, -4.26, 9.21, -2.47, 9.5, -2.1,
  5.17, -4.46, 6.46, -4.47, 8.82, -2.28, 10.19, -0.88, 6.35, -4.4, 9.92, -1.03,
  6.69, -4.11, 10.07, -1.29, 8.67, -2.83, -2.92, 3.18, -2.3, 2.51, -3.33, 3.36,
  -5.07, -2.22, -4.19, 1.28, -3.74, -0.7, -3.06, 2.49, -3.26, -2.48, -2.45,
  1.32, -3.09, -2.14, -4.29, -3.04, -2.71, 0.62, -5.07, -1.98, -3.22, 0.9,
  -2.61, -1.2, -2.83, 2.02, -2.36, 0.22, -3.51, -1.09, -5.43, -0.83, -3.98,
  -2.33, -3.49, 1.78, -2.98, -0.19, -5.84, 0, -3.87, -0.01, -3.17, 1.24, -2.94,
  1.77, -3.66, 2.12, -3.84, 3.21, -3.63, 0.48, -3.41, -1.59, -4.35, -1.99,
  -4.28, -2.28, -3.28, -1.43, -4.74, 0.19, -2.36, -0.37, -2.56, 1.86, -3.32,
  2.49, -4.91, -1.05, -2.4, -0.04, -4.31, -1.63, -3.95, -1.69, -3.02, 1, -3.99,
  -1.5, -4.47, -2.6, -3.57, -1.54, -2.89, -0.42, -3.11, -0.39, -3.1, 0.32,
  -3.62, -2.02, -3.29, -0.76, -6.24, 3.27, -5.39, 1.09, -5.29, 4.86, -4.82,
  1.33, -5.34, 2.99, -4.88, 5.18, -3.69, -2.69, -3.77, 4.6, -5.56, 1.21, -6.3,
  4.6, -4.61, 3.27, -5.27, 0.92, -4.46, 3.91, -5.44, -0.19, -5.29, 1.77, -6.29,
  3.95, -4.3, 2.6, -5.96, 4.98, -4.31, 4.71, -5.1, -1.4, -5.34, 4.46, -4.14,
  0.11, -4, 5, -4.99, 0.58, -5.98, 3.93, -4.64, 4.4, -4.8, 1.1, -4.24, 1.67,
  -4.8, 2.04, -3.82, 3.93, -4.25, 4.31, -5.39, 5.27, -5.09, 2.31, -4.3, 0.93,
  -5.09, -0.15, -4.91, 4.92, -5.89, 3.57, -4.48, 2.8, -3.83, 1.22, -4.89, 4.01,
  -5.65, 3.97, -5.05, 4.12, -4.45, 0.65, -5.45, 4.24, -5.63, 3.65, -5.06, 3.69,
  -5.12, 0.42, -4.96, 3.13, -5.57, 3.27, -3.99, 1.04,
];

const COLUMNS = 2;

/**
 * The embedding as a matrix, read where it stands.
 *
 * A matrix rather than an array of pairs, so the hundred and fifty rows cost
 * one buffer instead of a hundred and fifty arrays, and so the fixture hands
 * `embeddingResult` exactly what it hands a matrix from a library.
 */
export const IRIS_UMAP_COORDINATES: MatrixLike = {
  rows: COORDINATES.length / COLUMNS,
  columns: COLUMNS,
  get(rowIndex: number, columnIndex: number): number {
    if (columnIndex < 0 || columnIndex >= COLUMNS) return Number.NaN;
    return COORDINATES[rowIndex * COLUMNS + columnIndex] ?? Number.NaN;
  },
};
