import { getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';

import type { VariableAxis } from '../variableAxis.ts';

/** Fisher's 150 flowers, four measurements each, in the dataset's order. */
export const IRIS_ROWS: number[][] = getNumbers();

/** The four measurements, by name. */
export const IRIS_AXIS: VariableAxis = {
  kind: 'named',
  names: ['Sepal length', 'Sepal width', 'Petal length', 'Petal width'],
};

/** A scaled PCA of the flowers: the model the projection tests read. */
export const IRIS_PCA = new PCA(IRIS_ROWS, { scale: true });
