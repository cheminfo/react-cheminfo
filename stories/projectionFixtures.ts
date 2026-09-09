/**
 * The samples every projection story is drawn from: Fisher's 150 iris flowers,
 * a principal component model fitted to them, and two other methods run over
 * the same flowers.
 *
 * The data lives here so that a story file is the states rather than the
 * numbers, and so that four figures show one reader the same flowers — a demo
 * whose map changes between two tabs teaches nothing about either. Nothing is
 * invented: `ml-dataset-iris` and `ml-pca` are development dependencies, so a
 * story may import them where nothing under `src` ever may.
 */

import { getClasses, getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';

import { chartAxisTitle, chartColumnExtent } from '../src/chart/core/index.ts';
import type { ChartAxisSpec } from '../src/chart/ui/index.ts';
import type {
  NamedVariableAxis,
  ProjectionField,
  ProjectionResult,
  ProjectionSamples,
} from '../src/projection/core/index.ts';
import {
  embeddingResult,
  pcaResult,
  resolveProjectionGroups,
} from '../src/projection/core/index.ts';
import type { ScatterGroup } from '../src/scatter/ui/index.ts';

import { IRIS_UMAP_COORDINATES } from './projectionEmbedding.ts';

/** The four measurements of every flower, in centimetres. */
export const IRIS_ROWS: readonly number[][] = getNumbers();

/** Which species each flower is, in the same order. */
export const IRIS_SPECIES: readonly string[] = getClasses();

/**
 * What the four columns are, named.
 *
 * Named rather than numbered because the "what differs" panels write these
 * words on their bars, and a reader who is told that `column 3` carries the
 * component has learnt nothing about their own flowers.
 */
export const IRIS_VARIABLES: NamedVariableAxis = {
  kind: 'named',
  names: ['Sepal length', 'Sepal width', 'Petal length', 'Petal width'],
  label: 'Measurement',
};

/**
 * Who the flowers are: what each is called, which species it is, and what was
 * measured on it.
 *
 * `fields` is what a hover card shows under the two axis readings, so pointing
 * at a dot answers the question a reader actually has — which flower is this,
 * and how big was it — rather than only where it landed.
 */
export const IRIS_SAMPLES: ProjectionSamples = {
  ids: irisNames(),
  groups: IRIS_SPECIES,
  groupLabel: 'Species',
  fields: irisMeasurements,
};

/** The model, fitted to every flower with each measurement divided by its own spread. */
export const IRIS_PCA = new PCA(IRIS_ROWS as number[][], { scale: true });

/** That model as the viewer reads it, with all four components kept. */
export const IRIS_RESULT: ProjectionResult = pcaResult(IRIS_PCA, {
  rows: IRIS_ROWS,
  variables: IRIS_VARIABLES,
  scaled: true,
  valueLabel: 'Size (cm)',
});

/** The species as the figures colour them, so every story shares one key. */
const IRIS_GROUPING = resolveProjectionGroups(
  IRIS_SAMPLES,
  IRIS_RESULT.scores.rows,
);

/** The three species, in the order they are coloured. */
export const IRIS_GROUPS: readonly ScatterGroup[] = IRIS_GROUPING.entries.map(
  (entry) => ({ id: entry.id, label: entry.label, color: entry.color }),
);

/** Which species each flower is, as an index into {@link IRIS_GROUPS}. */
export const IRIS_GROUP_OF: Int32Array = IRIS_GROUPING.groupOf;

/** Where every flower lands along the first component. */
export const IRIS_PC1: Float64Array = irisColumn(0);

/** Where it lands along the second. */
export const IRIS_PC2: Float64Array = irisColumn(1);

/**
 * The flowers the projected-samples story fits its model on: the first 120,
 * which is every setosa, every versicolor and twenty virginica.
 */
export const IRIS_FITTED_ROWS: readonly number[][] = IRIS_ROWS.slice(0, 120);

/** The thirty virginica held back, to be placed into that finished model. */
export const IRIS_LATER_ROWS: readonly number[][] = IRIS_ROWS.slice(120);

/** The model built without those thirty, so they can be drawn hollow. */
export const IRIS_PARTIAL_PCA = new PCA(IRIS_FITTED_ROWS as number[][], {
  scale: true,
});

/**
 * Where every flower lands along one component, as an array a plot can read.
 *
 * The score matrix is read where it stands everywhere in the package; a plot
 * is the one place that wants a plain column, so this is the one place that
 * builds one.
 * @param axis - Which component, from 0.
 * @returns The column.
 */
export function irisColumn(axis: number): Float64Array {
  const { scores } = IRIS_RESULT;
  const column = new Float64Array(scores.rows);
  for (let row = 0; row < scores.rows; row++) {
    column[row] = scores.get(row, axis);
  }
  return column;
}

/**
 * One axis of the map, titled the way every axis in this package is titled.
 * @param index - Which component, from 0.
 * @returns The axis, e.g. `PC1 — 73.0 %`.
 */
export function irisAxis(index: number): ChartAxisSpec {
  const extent = chartColumnExtent(IRIS_RESULT.scores, index, {
    padding: 0.06,
  });
  const axis = IRIS_RESULT.axes[index];
  return {
    domain: [extent.min, extent.max],
    label: chartAxisTitle(axis?.name ?? '', { share: axis?.share }),
  };
}

/**
 * The saved neighbour embedding of the same flowers, still coloured by
 * species.
 *
 * Two axes, no share and no weights: the result cannot fill three of the four
 * tabs, so the viewer offers none of them.
 */
export const UMAP_RESULT: ProjectionResult = embeddingResult(
  IRIS_UMAP_COORDINATES,
  { method: 'UMAP', names: ['UMAP1', 'UMAP2'] },
);

function irisNames(): readonly string[] {
  const names = new Array<string>(IRIS_ROWS.length);
  for (let index = 0; index < names.length; index++) {
    names[index] = `Flower ${index + 1}`;
  }
  return names;
}

function irisMeasurements(index: number): readonly ProjectionField[] {
  const row = IRIS_ROWS[index];
  if (row === undefined) return [];
  const fields: ProjectionField[] = [];
  for (let column = 0; column < row.length; column++) {
    fields.push({
      label: IRIS_VARIABLES.names[column] ?? '',
      value: `${String(row[column] ?? Number.NaN)} cm`,
    });
  }
  return fields;
}
