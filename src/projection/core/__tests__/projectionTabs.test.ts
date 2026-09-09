import { expect, test } from 'vitest';

import type { MatrixLike } from '../../../chart/core/matrix.ts';
import type { ProjectionAxis, ProjectionResult } from '../projectionResult.ts';
import { projectionTabs } from '../projectionTabs.ts';

const EMPTY_MATRIX: MatrixLike = { rows: 0, columns: 0, get: () => 0 };

const IRIS_AXIS = {
  kind: 'named',
  names: ['Sepal length', 'Sepal width', 'Petal length', 'Petal width'],
} as const;

function axes(shares: ReadonlyArray<number | undefined>): ProjectionAxis[] {
  const built: ProjectionAxis[] = [];
  for (let index = 0; index < shares.length; index++) {
    built.push({ name: `PC ${String(index + 1)}`, share: shares[index] });
  }
  return built;
}

const PCA: ProjectionResult = {
  method: 'Principal components',
  axes: axes([0.7296, 0.2285, 0.0367, 0.0052]),
  scores: EMPTY_MATRIX,
  loadings: { weights: EMPTY_MATRIX, variables: IRIS_AXIS },
};

test('a principal-component run fills all four tabs', () => {
  expect(projectionTabs(PCA)).toStrictEqual([
    'map',
    'pairs',
    'variables',
    'shares',
  ]);
});

test('a two-axis k-means result is a map and nothing else', () => {
  const kmeans: ProjectionResult = {
    method: 'Clusters',
    axes: [{ name: 'Dimension 1' }, { name: 'Dimension 2' }],
    scores: EMPTY_MATRIX,
    markers: [{ label: 'Centre of cluster 1', position: [0, 0], group: 0 }],
  };

  expect(projectionTabs(kmeans)).toStrictEqual(['map']);
});

test('a UMAP embedding is a map and nothing else', () => {
  const umap: ProjectionResult = {
    method: 'UMAP',
    axes: [{ name: 'UMAP 1' }, { name: 'UMAP 2' }],
    scores: EMPTY_MATRIX,
  };

  expect(projectionTabs(umap)).toStrictEqual(['map']);
});

test('three axes without shares earn the pair grid but not the bars', () => {
  const embedding: ProjectionResult = {
    method: 'UMAP',
    axes: [{ name: 'UMAP 1' }, { name: 'UMAP 2' }, { name: 'UMAP 3' }],
    scores: EMPTY_MATRIX,
  };

  expect(projectionTabs(embedding)).toStrictEqual(['map', 'pairs']);
});

test('one axis without a share removes the shares tab from all of them', () => {
  const holed: ProjectionResult = {
    ...PCA,
    axes: axes([0.7296, 0.2285, undefined, 0.0052]),
  };

  expect(projectionTabs(holed)).toStrictEqual(['map', 'pairs', 'variables']);
});

test('a two-axis model with loadings still explains what differs', () => {
  const twoAxes: ProjectionResult = {
    ...PCA,
    axes: axes([0.7296, 0.2285]),
  };

  expect(projectionTabs(twoAxes)).toStrictEqual(['map', 'variables']);
});

test('a site may narrow the panels, and can never widen them past the data', () => {
  expect(projectionTabs(PCA, ['map'])).toStrictEqual(['map']);
  expect(projectionTabs(PCA, ['shares', 'map'])).toStrictEqual([
    'map',
    'shares',
  ]);

  // A panel the result cannot fill is not conjured by asking for it.
  const umap: ProjectionResult = {
    method: 'UMAP',
    axes: [{ name: 'UMAP1' }, { name: 'UMAP2' }],
    scores: EMPTY_MATRIX,
  };

  expect(projectionTabs(umap, ['map', 'shares', 'variables'])).toStrictEqual([
    'map',
  ]);
});

test('the map survives a filter that would leave nothing at all', () => {
  expect(projectionTabs(PCA, [])).toStrictEqual(['map']);
  expect(projectionTabs(PCA, ['shares'])).toStrictEqual(['shares']);
});
