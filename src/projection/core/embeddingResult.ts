import type { MatrixLike } from '../../chart/core/matrix.ts';
import { rowMatrix } from '../../chart/core/matrix.ts';

import type {
  ProjectionAxis,
  ProjectionMarker,
  ProjectionResult,
} from './projectionResult.ts';

/** How a {@link ProjectionResult} is built from coordinates alone. */
export interface EmbeddingResultOptions {
  /**
   * What each axis is called.
   * @default the axes numbered `Dimension 1` upward
   */
  names?: readonly string[];
  /**
   * What the method is called in the headings.
   * @default 'Embedding'
   */
  method?: string;
  /**
   * Reference points drawn over the map.
   * @default undefined
   */
  markers?: readonly ProjectionMarker[];
  /**
   * How many leading rows the model was built from, the rest having been
   * placed into it afterwards — a `getEmbedding()` followed by a `transform()`
   * gives exactly that order.
   * @default undefined — every row built the model
   */
  fittedCount?: number;
  /**
   * Whether the coordinates are copied on the way in.
   *
   * They are, because the library that produces most of them hands out the
   * array it is still working on. Every published `umap-js`, 1.0.0 through
   * 1.4.0, returns its live embedding from `getEmbedding()` without a copy,
   * and its `transform()` writes back into that same array whenever the batch
   * being placed is the same size as the training set — so a viewer holding
   * the reference would quietly redraw coordinates that had moved under it,
   * with nothing anywhere reporting a fault. The copy costs one pass over
   * `rows × columns`, and an embedding has two or three columns by
   * definition, which is what makes the safe default affordable here and not
   * on the principal-component path.
   *
   * Pass `false` for a progressive layout that is being animated: during
   * fitting the live array is the point, and a copy would freeze the picture
   * on its first frame.
   * @default true
   */
  snapshot?: boolean;
}

/**
 * Coordinates from any method as the viewer reads them.
 *
 * This is the door every method that is not a principal component analysis
 * comes through. No axis carries a share and there are no loadings, so the
 * viewer offers exactly the tabs the coordinates can fill — which for a
 * two-dimensional UMAP is the map alone.
 * @param coordinates - One row per sample, one column per axis.
 * @param options - See {@link EmbeddingResultOptions}.
 * @returns The result.
 */
export function embeddingResult(
  coordinates: ReadonlyArray<ArrayLike<number>> | MatrixLike,
  options: EmbeddingResultOptions = {},
): ProjectionResult {
  const {
    names,
    method = 'Embedding',
    markers,
    fittedCount,
    snapshot = true,
  } = options;
  // A matrix is told from a list of rows by the one method a matrix has.
  const read = isMatrix(coordinates) ? coordinates : rowMatrix(coordinates);
  const scores = snapshot ? copyMatrix(read) : read;

  const axes: ProjectionAxis[] = [];
  for (let index = 0; index < scores.columns; index++) {
    axes.push({ name: names?.[index] ?? `Dimension ${index + 1}` });
  }
  return { method, axes, scores, markers, fittedCount };
}

/**
 * The same values, in a buffer nothing else holds.
 * @param source - The matrix to read.
 * @returns A matrix over a private copy of every value.
 */
function copyMatrix(source: MatrixLike): MatrixLike {
  const { rows, columns } = source;
  const values = new Float64Array(rows * columns);
  for (let row = 0; row < rows; row++) {
    const offset = row * columns;
    for (let column = 0; column < columns; column++) {
      values[offset + column] = source.get(row, column);
    }
  }
  return {
    rows,
    columns,
    get(row: number, column: number): number {
      if (row < 0 || row >= rows || column < 0 || column >= columns) {
        return Number.NaN;
      }
      return values[row * columns + column] as number;
    },
  };
}

function isMatrix(
  coordinates: ReadonlyArray<ArrayLike<number>> | MatrixLike,
): coordinates is MatrixLike {
  return typeof (coordinates as MatrixLike).get === 'function';
}
