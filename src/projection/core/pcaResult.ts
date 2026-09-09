import type { MatrixLike } from '../../chart/core/matrix.ts';
import { mappedMatrix, stackedMatrix } from '../../chart/core/matrix.ts';

import type { PcaLike } from './pcaLike.ts';
import type { ProjectionAxis, ProjectionResult } from './projectionResult.ts';
import type { VariableAxis } from './variableAxis.ts';

/** How a {@link ProjectionResult} is built from a fitted model. */
export interface PcaResultOptions {
  /**
   * The measurements the model was fitted on, one array per sample. They are
   * read in place: the average and the spread of each measurement are
   * accumulated in one centred pass and nothing is copied.
   */
  rows: readonly number[][];
  /**
   * Further samples to place into the finished model, one array per sample,
   * each as wide as a row of `rows`.
   *
   * These took no part in fitting: the axes were already chosen when they
   * arrived. They are appended after the fitted samples and drawn hollow, so a
   * reader can see at a glance which points the model has already accounted
   * for and which it is being asked about — a new batch, a suspected outlier,
   * next year's measurements against last year's model.
   *
   * They are placed by one further `predict` call, and the two sets of scores
   * are read as one table without either being copied.
   * @default undefined — every sample built the model
   */
  projected?: readonly number[][];
  /**
   * How the original measurements are laid out.
   * @default the columns numbered `1` to `n`, drawn as bars
   */
  variables?: VariableAxis;
  /**
   * Where the samples landed. Left out, they are placed by projecting `rows`
   * through the model, which is one call.
   * @default the model's own projection of `rows`
   */
  scores?: MatrixLike;
  /**
   * Whether the model divided each measurement by its spread — the `scale`
   * given to `new PCA(...)`. It cannot be read back from the model's public
   * surface, and getting it wrong offers a view that is the same drawing
   * twice.
   * @default false
   */
  scaled?: boolean;
  /**
   * How many components to keep.
   * @default every component the model holds
   */
  count?: number;
  /**
   * What the measured values are, e.g. `Absorbance`.
   * @default ''
   */
  valueLabel?: string;
  /**
   * Whether each component is flipped so that its strongest measurement comes
   * out positive. The direction of a component is arbitrary and flips when the
   * model is refitted — on iris, refitting on fifty of the hundred and fifty
   * flowers turned the first component's weights right around — so without
   * this a map mirrors itself when one sample is added, which reads as a fault
   * to everyone who is not a statistician. The scores are flipped with the
   * weights, through a mapped view rather than a copy.
   * @default 'largest-positive'
   */
  signConvention?: 'largest-positive' | 'none';
  /**
   * What the method is called in the headings.
   * @default 'Principal components'
   */
  method?: string;
}

/**
 * A fitted principal component model as the viewer reads it.
 * @param pca - The fitted model.
 * @param options - See {@link PcaResultOptions}.
 * @returns The result, with every tab's data filled in.
 * @throws {Error} When `rows` is empty, when a row's length differs from the
 * first row's, when a measurement is not a finite number, or when the model's
 * loadings are not as wide as a row — which is what happens when the model was
 * fitted with `ignoreZeroVariance` and silently dropped a column, and which
 * would otherwise label every loadings panel one measurement out.
 */
export function pcaResult(
  pca: PcaLike,
  options: PcaResultOptions,
): ProjectionResult {
  const {
    rows,
    projected,
    variables,
    scores,
    scaled = false,
    count,
    valueLabel = '',
    signConvention = 'largest-positive',
    method = 'Principal components',
  } = options;

  const first = rows[0];
  if (first === undefined) {
    throw new Error('pcaResult was given no rows, so nothing can be read.');
  }
  const width = first.length;
  const { mean, deviation } = columnStats(rows, width);

  const weights = pca.getLoadings();
  if (weights.columns < width) {
    throw new Error(
      `pcaResult was given rows ${width} measurements wide but a model holding ${weights.columns} weights, which is what \`ignoreZeroVariance\` leaves behind when it drops a column that never moves. Every panel after the dropped one would carry its neighbour's name.`,
    );
  }

  const wanted = Number.isFinite(count) ? Math.floor(count ?? 0) : weights.rows;
  const kept = Math.min(weights.rows, Math.max(1, wanted));
  const signs = signsOf(weights, signConvention === 'largest-positive');
  const explained = pca.getExplainedVariance();
  const eigenvalues = pca.getEigenvalues();

  const axes: ProjectionAxis[] = [];
  const spread: number[] = [];
  for (let index = 0; index < kept; index++) {
    const eigenvalue = eigenvalues[index];
    axes.push({ name: `PC${index + 1}`, share: explained[index], eigenvalue });
    spread.push(Math.sqrt(Math.max(0, eigenvalue ?? 0)));
  }

  const fitted =
    scores ?? pca.predict(rows as number[][], { nComponents: kept });
  const extra =
    projected === undefined || projected.length === 0
      ? undefined
      : pca.predict(projected as number[][], { nComponents: kept });
  const placed = extra === undefined ? fitted : stackedMatrix(fitted, extra);
  return {
    method,
    axes,
    scores: signedView(placed, placed.rows, kept, signs, false),
    fittedCount: extra === undefined ? undefined : fitted.rows,
    loadings: {
      weights: signedView(weights, kept, width, signs, true),
      variables: variables ?? numberedVariables(width),
      mean,
      spread,
      scales: scaled ? deviation : undefined,
      valueLabel,
    },
  };
}

function columnStats(
  rows: readonly number[][],
  width: number,
): { mean: number[]; deviation: number[] } {
  // Centred on the average so far, in one pass: a running total of the raw
  // values squared loses the low bits of a spectrum sitting on a baseline.
  // `deviation` carries the squared spread until the last loop roots it.
  const mean = new Array<number>(width).fill(0);
  const deviation = new Array<number>(width).fill(0);
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    if (row?.length !== width) {
      throw new Error(
        `pcaResult was given a row ${row?.length ?? 0} measurements wide at index ${index}, where the first row is ${width} wide.`,
      );
    }
    const seen = index + 1;
    for (let column = 0; column < width; column++) {
      const value = row[column];
      if (value === undefined || !Number.isFinite(value)) {
        throw new Error(
          `pcaResult was given ${String(value)} at row ${index}, measurement ${column}. A model carries it on into a map of nothing at all.`,
        );
      }
      const before = mean[column] ?? 0;
      const step = value - before;
      const after = before + step / seen;
      mean[column] = after;
      deviation[column] = (deviation[column] ?? 0) + step * (value - after);
    }
  }

  const divisor = Math.max(1, rows.length - 1);
  for (let column = 0; column < width; column++) {
    deviation[column] = Math.sqrt((deviation[column] ?? 0) / divisor);
  }
  return { mean, deviation };
}

function signsOf(weights: MatrixLike, flip: boolean): Float64Array {
  const signs = new Float64Array(weights.rows).fill(1);
  if (!flip) return signs;
  for (let row = 0; row < weights.rows; row++) {
    let strongest = 0;
    let reach = 0;
    for (let column = 0; column < weights.columns; column++) {
      const value = weights.get(row, column);
      const size = Math.abs(value);
      if (size > reach) {
        reach = size;
        strongest = value;
      }
    }
    if (strongest < 0) signs[row] = -1;
  }
  return signs;
}

function signedView(
  source: MatrixLike,
  rowCount: number,
  columnCount: number,
  signs: Float64Array,
  byRow: boolean,
): MatrixLike {
  return mappedMatrix(
    {
      rows: rowCount,
      columns: columnCount,
      get: (row: number, column: number) =>
        row >= 0 && row < rowCount && column >= 0 && column < columnCount
          ? source.get(row, column)
          : Number.NaN,
    },
    (value, row, column) => value * (signs[byRow ? row : column] ?? 1),
  );
}

function numberedVariables(width: number): VariableAxis {
  const names = new Array<string>(width);
  for (let index = 0; index < width; index++) names[index] = String(index + 1);
  return { kind: 'named', names };
}
