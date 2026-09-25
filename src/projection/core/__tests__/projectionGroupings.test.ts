import { expect, test } from 'vitest';

import {
  projectionGrouping,
  resolveProjectionShapes,
} from '../projectionGroupings.ts';
import type {
  ProjectionGrouping,
  ProjectionSamples,
} from '../projectionSamples.ts';

const CLASSES: ProjectionGrouping = {
  id: 'class',
  label: 'Class',
  groups: ['control', 'treated', 'control', undefined, 'treated'],
};

test('each group of the shaping grouping takes the next shape, in order', () => {
  const shapes = resolveProjectionShapes(CLASSES, 5);

  expect(shapes?.label).toBe('Class');
  expect(shapes?.entries).toStrictEqual([
    { id: 'control', label: 'control', shape: 'dot', count: 2 },
    { id: 'treated', label: 'treated', shape: 'square', count: 2 },
  ]);
  expect([...(shapes?.shapeOf ?? [])]).toStrictEqual([0, 1, 0, -1, 1]);
});

test('a group the order names keeps its shape even while no row holds it', () => {
  const shapes = resolveProjectionShapes(
    { ...CLASSES, order: ['blank', 'control', 'treated'] },
    5,
  );

  expect(shapes?.entries.map((entry) => entry.shape)).toStrictEqual([
    'dot',
    'square',
    'triangle',
  ]);
});

test('five groups fit the five shapes, six are refused rather than doubled up', () => {
  const five = ['a', 'b', 'c', 'd', 'e'];

  expect(
    resolveProjectionShapes(letters(five), 5)?.entries.map(
      (entry) => entry.shape,
    ),
  ).toStrictEqual(['dot', 'square', 'triangle', 'diamond', 'triangle-down']);
  expect(resolveProjectionShapes(letters([...five, 'f']), 6)).toBeNull();
});

test('no grouping shapes nothing', () => {
  expect(resolveProjectionShapes(undefined, 5)).toBeNull();
});

test('a grouping is found by its id, and an id nothing carries finds none', () => {
  const samples: ProjectionSamples = {
    ids: ['a', 'b'],
    groupings: [
      { id: 'cluster', label: 'Cluster', groups: ['1', '2'] },
      CLASSES,
    ],
  };

  expect(projectionGrouping(samples, 'class')).toBe(CLASSES);
  expect(projectionGrouping(samples, 'batch')).toBeUndefined();
  expect(projectionGrouping({ ids: [] }, 'class')).toBeUndefined();
});

function letters(groups: string[]): ProjectionGrouping {
  return { id: 'letter', label: 'Letter', groups };
}
