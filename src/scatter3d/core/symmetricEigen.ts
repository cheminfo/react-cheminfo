/**
 * The axes a symmetric three by three matrix describes.
 *
 * The two-dimensional outline solves the same problem in four lines, because a
 * symmetric two by two matrix has a closed form anybody can read. Three by
 * three also has one — the eigenvalues are the roots of a cubic whose
 * discriminant is never negative for a symmetric matrix, so they come out of a
 * cosine rather than out of an iteration — and having it here is what lets the
 * cloud fit an ellipsoid without the package depending on a matrix library.
 */

import type { Vector3 } from './orbitCamera.ts';

/** A symmetric three by three matrix, as its six distinct entries. */
export interface SymmetricMatrix3 {
  /** Row 1, column 1. */
  xx: number;
  /** Row 1, column 2, which is also row 2, column 1. */
  xy: number;
  /** Row 1, column 3, which is also row 3, column 1. */
  xz: number;
  /** Row 2, column 2. */
  yy: number;
  /** Row 2, column 3, which is also row 3, column 2. */
  yz: number;
  /** Row 3, column 3. */
  zz: number;
}

/** The axes of a symmetric three by three matrix, longest first. */
export interface SymmetricEigen3 {
  /** The three eigenvalues, largest first. Never below zero for a covariance. */
  values: readonly [number, number, number];
  /** A unit eigenvector per eigenvalue, in the same order, always orthonormal. */
  vectors: readonly [Vector3, Vector3, Vector3];
}

/**
 * A residue this far below the largest eigenvalue is read as zero.
 *
 * Squaring and summing coordinates leaves a few parts in 1e16 where the exact
 * answer is nothing at all, so a flat group — every sample on one plane, which
 * is what four samples in three dimensions always are — would otherwise be
 * given a sliver of thickness that differs from machine to machine.
 */
const FLAT_FLOOR = 1e-12;

/**
 * The axes a symmetric three by three matrix describes.
 *
 * The eigenvectors are orthonormalised rather than taken as they come out of
 * the cross products, because a repeated eigenvalue — a group that is round in
 * two of its three directions, which is the common case for a small one —
 * leaves that plane's two directions undetermined, and any orthogonal pair in
 * it is as good an answer as any other. What must never happen is two nearly
 * parallel vectors, which would draw an ellipsoid collapsed to a fan.
 * @param matrix - The matrix, as its six distinct entries.
 * @returns See {@link SymmetricEigen3}. A matrix with an entry that is not finite gives three zero eigenvalues on the standard axes.
 */
export function symmetricEigen3(matrix: SymmetricMatrix3): SymmetricEigen3 {
  const { xx, xy, xz, yy, yz, zz } = matrix;
  if (
    !Number.isFinite(xx) ||
    !Number.isFinite(xy) ||
    !Number.isFinite(xz) ||
    !Number.isFinite(yy) ||
    !Number.isFinite(yz) ||
    !Number.isFinite(zz)
  ) {
    return NOTHING;
  }

  const values = eigenvalues(matrix);
  const largest = Math.max(Math.abs(values[0]), Math.abs(values[2]));
  const raw: Vector3[] = [];
  for (let i = 0; i < 3; i++) {
    raw.push(eigenvector(matrix, values[i] as number, largest));
  }
  return { values, vectors: orthonormalise(raw) };
}

/**
 * The three eigenvalues, largest first.
 * @param matrix - The matrix, as its six distinct entries.
 * @returns The eigenvalues, in descending order.
 */
function eigenvalues(
  matrix: SymmetricMatrix3,
): readonly [number, number, number] {
  const { xx, xy, xz, yy, yz, zz } = matrix;
  const offDiagonal = xy * xy + xz * xz + yz * yz;
  if (offDiagonal === 0) {
    const diagonal = [xx, yy, zz].toSorted(descending);
    return [
      diagonal[0] as number,
      diagonal[1] as number,
      diagonal[2] as number,
    ];
  }

  const mean = (xx + yy + zz) / 3;
  const spread =
    ((xx - mean) * (xx - mean) +
      (yy - mean) * (yy - mean) +
      (zz - mean) * (zz - mean) +
      2 * offDiagonal) /
    6;
  const radius = Math.sqrt(spread);
  if (!(radius > 0)) return [mean, mean, mean];

  // The matrix shifted to a zero trace and scaled to a unit radius; half its
  // determinant is the cosine of three times the angle the three roots sit at.
  const half =
    determinant3({
      xx: (xx - mean) / radius,
      xy: xy / radius,
      xz: xz / radius,
      yy: (yy - mean) / radius,
      yz: yz / radius,
      zz: (zz - mean) / radius,
    }) / 2;
  const angle = Math.acos(Math.min(1, Math.max(-1, half))) / 3;

  const first = mean + 2 * radius * Math.cos(angle);
  const third = mean + 2 * radius * Math.cos(angle + (2 * Math.PI) / 3);
  return [first, 3 * mean - first - third, third];
}

function descending(a: number, b: number): number {
  return b - a;
}

function determinant3(matrix: SymmetricMatrix3): number {
  const { xx, xy, xz, yy, yz, zz } = matrix;
  return (
    xx * (yy * zz - yz * yz) -
    xy * (xy * zz - yz * xz) +
    xz * (xy * yz - yy * xz)
  );
}

/**
 * A direction the matrix only stretches.
 *
 * Two rows of `matrix - λI` span the plane the eigenvector is normal to, so
 * their cross product is that eigenvector. Which two rows is not a free choice:
 * a row can be zero, or two rows can be nearly parallel, and the cross product
 * of those is numerical dust — so all three pairs are tried and the longest
 * answer is kept.
 * @param matrix - The matrix.
 * @param value - The eigenvalue.
 * @param scale - The size of the matrix, to judge "too short" against.
 * @returns A unit vector, or the zero vector when the shifted matrix vanishes, which is a repeated eigenvalue and leaves the direction to the orthonormalising step.
 */
function eigenvector(
  matrix: SymmetricMatrix3,
  value: number,
  scale: number,
): Vector3 {
  const { xx, xy, xz, yy, yz, zz } = matrix;
  const rows: Vector3[] = [
    [xx - value, xy, xz],
    [xy, yy - value, yz],
    [xz, yz, zz - value],
  ];

  let best: Vector3 = ZERO;
  let bestLength = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const candidate = cross(rows[i] as Vector3, rows[j] as Vector3);
      const length = norm(candidate);
      if (length > bestLength) {
        best = candidate;
        bestLength = length;
      }
    }
  }
  // A cross product of two rows is quadratic in the matrix, so the length it
  // has to beat is too.
  if (bestLength <= FLAT_FLOOR * Math.max(scale * scale, Number.MIN_VALUE)) {
    return ZERO;
  }
  return scaleVector(best, 1 / bestLength);
}

/**
 * Three orthonormal directions, keeping the ones that are worth keeping.
 *
 * A vector that survives is normalised against the ones already accepted; one
 * that does not is replaced by whatever direction is still free, which is what
 * gives a round group and a flat one a complete frame instead of a degenerate
 * one.
 * @param raw - The directions as the cross products left them.
 * @returns Three unit vectors, mutually orthogonal.
 */
function orthonormalise(
  raw: readonly Vector3[],
): readonly [Vector3, Vector3, Vector3] {
  const kept: Vector3[] = [];
  for (const vector of raw) kept.push(against(vector, kept));
  for (let i = 0; i < 3; i++) {
    if (kept[i] !== ZERO) continue;
    kept[i] = against(freeDirection(kept), kept);
  }
  return [kept[0] as Vector3, kept[1] as Vector3, kept[2] as Vector3];
}

/**
 * One vector with every accepted direction taken out of it, then normalised.
 * @param vector - The direction to keep only what is new about.
 * @param accepted - The directions already settled on.
 * @returns The unit remainder, or the zero vector when nothing was left of it.
 */
function against(vector: Vector3, accepted: readonly Vector3[]): Vector3 {
  let [x, y, z] = vector;
  for (const other of accepted) {
    const along = x * other[0] + y * other[1] + z * other[2];
    x -= along * other[0];
    y -= along * other[1];
    z -= along * other[2];
  }
  const length = norm([x, y, z]);
  if (!(length > 1e-6)) return ZERO;
  return [x / length, y / length, z / length];
}

/**
 * A standard axis that the accepted directions do not already cover.
 * @param accepted - The directions already settled on.
 * @returns The axis least accounted for by them.
 */
function freeDirection(accepted: readonly Vector3[]): Vector3 {
  let best: Vector3 = AXES[0];
  let leastCovered = Number.POSITIVE_INFINITY;
  for (const axis of AXES) {
    let covered = 0;
    for (const other of accepted) {
      const along =
        axis[0] * other[0] + axis[1] * other[1] + axis[2] * other[2];
      covered += along * along;
    }
    if (covered < leastCovered) {
      leastCovered = covered;
      best = axis;
    }
  }
  return best;
}

function cross(a: Vector3, b: Vector3): Vector3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function norm(vector: Vector3): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function scaleVector(vector: Vector3, by: number): Vector3 {
  return [vector[0] * by, vector[1] * by, vector[2] * by];
}

const ZERO: Vector3 = [0, 0, 0];
const AXES: readonly [Vector3, Vector3, Vector3] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
const NOTHING: SymmetricEigen3 = { values: [0, 0, 0], vectors: AXES };
