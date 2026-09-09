/**
 * Read-only view of a numeric matrix, satisfied by `ml-matrix`'s `Matrix`
 * without a cast.
 *
 * Only `get` is required, because it is the cheapest read there is — 1.25 ns a
 * cell against 12.2 ns through `to2DArray()`, which reallocates every row on
 * every call. Nothing in this package ever copies a matrix out.
 */
export interface MatrixLike {
  /** Number of rows. */
  readonly rows: number;
  /** Number of columns. */
  readonly columns: number;
  /**
   * The value at a position.
   * @param rowIndex - Which row, from 0.
   * @param columnIndex - Which column, from 0.
   * @returns The value, or `NaN` when either index is outside the matrix.
   */
  get: (rowIndex: number, columnIndex: number) => number;
}

/**
 * A plain array of rows read as a matrix.
 *
 * The door every method that is not `ml-pca` comes through: a UMAP embedding
 * or a k-means table is `number[][]`, and this gives it the one shape the rest
 * of the package reads, with no copy and no dependency.
 * @param rows - One array per row; the width is taken from the first.
 * @returns The matrix view. An empty input gives a zero by zero matrix.
 */
export function rowMatrix(rows: ReadonlyArray<ArrayLike<number>>): MatrixLike {
  const first = rows[0];
  const columns = first === undefined ? 0 : first.length;
  return {
    rows: rows.length,
    columns,
    get(rowIndex: number, columnIndex: number): number {
      if (columnIndex < 0 || columnIndex >= columns) return Number.NaN;
      const row = rows[rowIndex];
      if (row === undefined) return Number.NaN;
      const value = row[columnIndex];
      return value === undefined ? Number.NaN : value;
    },
  };
}

/**
 * A matrix whose values pass through a function on the way out.
 *
 * It exists for the sign convention: a principal component's direction is
 * arbitrary, so the scores of a flipped component have to be negated, and
 * negating them in place would mean allocating a copy of the whole score
 * matrix to change one column's sign.
 * @param source - The matrix to read.
 * @param transform - Applied to every value, given its position.
 * @returns The mapped view, which holds a reference to `source` rather than a copy.
 */
export function mappedMatrix(
  source: MatrixLike,
  transform: (value: number, rowIndex: number, columnIndex: number) => number,
): MatrixLike {
  return {
    rows: source.rows,
    columns: source.columns,
    get(rowIndex: number, columnIndex: number): number {
      return transform(
        source.get(rowIndex, columnIndex),
        rowIndex,
        columnIndex,
      );
    },
  };
}

/**
 * Two matrices of the same width read as one, the second below the first.
 *
 * It is how a set of samples a model was fitted on and a set placed into it
 * afterwards reach a plot as one table, without either being copied: the rows
 * of a projection and the rows of a later projection through the same model
 * are two separate matrices that everything downstream wants to read as one.
 * @param top - The upper matrix, whose width the result takes.
 * @param bottom - The lower matrix; a column it does not reach reads as `NaN`.
 * @returns The stacked view, holding a reference to both rather than a copy.
 */
export function stackedMatrix(top: MatrixLike, bottom: MatrixLike): MatrixLike {
  const rows = top.rows + bottom.rows;
  const { columns } = top;
  return {
    rows,
    columns,
    get(rowIndex: number, columnIndex: number): number {
      if (rowIndex < 0 || rowIndex >= rows) return Number.NaN;
      if (columnIndex < 0 || columnIndex >= columns) return Number.NaN;
      if (rowIndex < top.rows) return top.get(rowIndex, columnIndex);
      return bottom.get(rowIndex - top.rows, columnIndex);
    },
  };
}
