import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/matrix.ts';
import { embeddingResult } from '../embeddingResult.ts';
import type { ProjectionMarker } from '../projectionResult.ts';

const COORDINATES = [
  [1, 2],
  [3, 4],
  [5, 6],
];

test('coordinates alone give a map and nothing it cannot fill', () => {
  const result = embeddingResult(COORDINATES);

  expect(result.method).toBe('Embedding');
  expect(result.axes).toStrictEqual([
    { name: 'Dimension 1' },
    { name: 'Dimension 2' },
  ]);
  expect(result.scores.rows).toBe(3);
  expect(result.scores.columns).toBe(2);
  expect(result.scores.get(2, 1)).toBe(6);
  expect(result.loadings).toBeUndefined();
  expect(result.markers).toBeUndefined();
});

test('the caller names the axes and the method', () => {
  const result = embeddingResult(COORDINATES, {
    names: ['UMAP 1'],
    method: 'UMAP',
  });

  expect(result.method).toBe('UMAP');
  expect(result.axes).toStrictEqual([
    { name: 'UMAP 1' },
    { name: 'Dimension 2' },
  ]);
});

test('reference points are carried through untouched', () => {
  const markers: ProjectionMarker[] = [
    { label: 'Centre of cluster 2', position: [2, 3], group: 1 },
  ];
  const result = embeddingResult(COORDINATES, { markers });

  expect(result.markers).toStrictEqual(markers);
});

test('the coordinates are copied, so a moving embedding cannot move them', () => {
  const live = [
    [1, 2],
    [3, 4],
  ];
  const result = embeddingResult(live);
  live[0] = [99, 99];

  expect(result.scores.get(0, 0)).toBe(1);
  expect(result.scores.get(0, 1)).toBe(2);
  expect(result.axes).toHaveLength(2);
});

test('a caller animating a layout keeps the live matrix', () => {
  const matrix = rowMatrix(COORDINATES);
  const result = embeddingResult(matrix, { snapshot: false });

  expect(result.scores).toBe(matrix);
});

test('a copied matrix reads NaN outside its bounds, as any other does', () => {
  const result = embeddingResult(COORDINATES);

  expect(result.scores.get(-1, 0)).toBeNaN();
  expect(result.scores.get(0, 2)).toBeNaN();
  expect(result.scores.get(3, 0)).toBeNaN();
});

test('no coordinates give no axes', () => {
  const result = embeddingResult([]);

  expect(result.axes).toStrictEqual([]);
  expect(result.scores.rows).toBe(0);
  expect(result.scores.columns).toBe(0);
});
