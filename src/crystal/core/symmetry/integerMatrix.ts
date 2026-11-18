import type { IntegerMatrix } from './types.ts';

/**
 * The product `a · b` of two square integer matrices of the same size.
 * @param a - Left factor, row-major.
 * @param b - Right factor, row-major.
 * @returns The product, row-major.
 */
export function multiplyMatrices(
  a: IntegerMatrix,
  b: IntegerMatrix,
): number[][] {
  const size = a.length;
  const product: number[][] = [];
  for (let i = 0; i < size; i++) {
    const values = new Array<number>(size).fill(0);
    for (let k = 0; k < size; k++) {
      const factor = entry(a, i, k);
      if (factor === 0) continue;
      for (let j = 0; j < size; j++) {
        values[j] = (values[j] ?? 0) + factor * entry(b, k, j);
      }
    }
    product.push(values);
  }
  return product;
}

/**
 * The product `matrix · vector`.
 * @param matrix - The matrix, row-major.
 * @param vector - The vector.
 * @returns The image of the vector.
 */
export function multiplyMatrixVector(
  matrix: IntegerMatrix,
  vector: readonly number[],
): number[] {
  const size = matrix.length;
  const image = new Array<number>(size).fill(0);
  for (let i = 0; i < size; i++) {
    let sum = 0;
    for (let j = 0; j < vector.length; j++) {
      sum += entry(matrix, i, j) * (vector[j] ?? 0);
    }
    image[i] = sum;
  }
  return image;
}

/**
 * The `size × size` identity matrix.
 * @param size - 2 or 3.
 * @returns The identity matrix.
 */
export function identityMatrix(size: number): number[][] {
  const identity: number[][] = [];
  for (let i = 0; i < size; i++) {
    const values = new Array<number>(size).fill(0);
    values[i] = 1;
    identity.push(values);
  }
  return identity;
}

/**
 * The determinant of a 2×2 or 3×3 integer matrix.
 * @param matrix - A 2×2 or 3×3 matrix.
 * @throws {RangeError} When the matrix is not 2×2 or 3×3; no crystallographic operation is.
 * @returns The determinant.
 */
export function matrixDeterminant(matrix: IntegerMatrix): number {
  if (matrix.length === 2) {
    return (
      entry(matrix, 0, 0) * entry(matrix, 1, 1) -
      entry(matrix, 0, 1) * entry(matrix, 1, 0)
    );
  }
  if (matrix.length !== 3) {
    throw new RangeError(
      `expected a 2×2 or 3×3 matrix, received ${matrix.length}×${matrix.length}`,
    );
  }
  // The cyclic cofactor expansion: the index rotation already carries the sign,
  // so there is no alternating factor to apply on top of it.
  let determinant = 0;
  for (let j = 0; j < 3; j++) {
    determinant +=
      entry(matrix, 0, j) *
      (entry(matrix, 1, (j + 1) % 3) * entry(matrix, 2, (j + 2) % 3) -
        entry(matrix, 1, (j + 2) % 3) * entry(matrix, 2, (j + 1) % 3));
  }
  return determinant;
}

/**
 * The adjugate: `adjugate(m) · m = det(m) · I`, exactly, in integers.
 *
 * It is how this core inverts an integer matrix without ever dividing, so an
 * element's position stays an exact fraction.
 * @param matrix - A 2×2 or 3×3 matrix.
 * @returns The adjugate.
 */
export function matrixAdjugate(matrix: IntegerMatrix): number[][] {
  if (matrix.length === 2) {
    return [
      [entry(matrix, 1, 1), -entry(matrix, 0, 1)],
      [-entry(matrix, 1, 0), entry(matrix, 0, 0)],
    ];
  }
  const adjugate: number[][] = [];
  for (let i = 0; i < 3; i++) {
    const values = new Array<number>(3).fill(0);
    for (let j = 0; j < 3; j++) {
      const rows = [(j + 1) % 3, (j + 2) % 3];
      const columns = [(i + 1) % 3, (i + 2) % 3];
      values[j] =
        entry(matrix, rows[0] ?? 0, columns[0] ?? 0) *
          entry(matrix, rows[1] ?? 0, columns[1] ?? 0) -
        entry(matrix, rows[0] ?? 0, columns[1] ?? 0) *
          entry(matrix, rows[1] ?? 0, columns[0] ?? 0);
    }
    adjugate.push(values);
  }
  return adjugate;
}

/**
 * Whether two matrices hold the same integers.
 * @param a - One matrix.
 * @param b - The other.
 * @returns Whether every entry is the same.
 */
export function matricesEqual(a: IntegerMatrix, b: IntegerMatrix): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length; j++) {
      if (entry(a, i, j) !== entry(b, i, j)) return false;
    }
  }
  return true;
}

/**
 * One entry, or 0 outside the matrix, so `noUncheckedIndexedAccess` costs nothing here.
 * @param matrix - The matrix.
 * @param row - Row index.
 * @param column - Column index.
 * @returns The entry.
 */
function entry(matrix: IntegerMatrix, row: number, column: number): number {
  return matrix[row]?.[column] ?? 0;
}
