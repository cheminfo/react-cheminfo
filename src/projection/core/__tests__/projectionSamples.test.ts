import { expect, test } from 'vitest';

import type { ProjectionSamples } from '../projectionSamples.ts';
import { resolveProjectionGroups } from '../projectionSamples.ts';

const SPECIES = ['setosa', 'versicolor', 'virginica'] as const;
const PER_SPECIES = 50;
const IRIS_ROWS = SPECIES.length * PER_SPECIES;

function irisSamples(
  extra: Partial<ProjectionSamples> = {},
): ProjectionSamples {
  const ids: string[] = [];
  const groups: string[] = [];
  for (let row = 0; row < IRIS_ROWS; row++) {
    ids.push(`Flower ${String(row + 1)}`);
    groups.push(SPECIES[Math.floor(row / PER_SPECIES)] ?? 'setosa');
  }
  return { ids, groups, ...extra };
}

test('the three species are listed in the order they first appear', () => {
  const resolved = resolveProjectionGroups(irisSamples(), IRIS_ROWS);

  expect(resolved.label).toBe('Group');
  expect(resolved.entries).toStrictEqual([
    { id: 'setosa', label: 'setosa', color: '#0072b2', count: 50 },
    { id: 'versicolor', label: 'versicolor', color: '#d55e00', count: 50 },
    { id: 'virginica', label: 'virginica', color: '#009e73', count: 50 },
  ]);
  expect(resolved.groupOf).toHaveLength(IRIS_ROWS);
  expect(resolved.groupOf[0]).toBe(0);
  expect(resolved.groupOf[49]).toBe(0);
  expect(resolved.groupOf[50]).toBe(1);
  expect(resolved.groupOf[149]).toBe(2);
});

test('the caller names what the set of groups is', () => {
  const resolved = resolveProjectionGroups(
    irisSamples({ groupLabel: 'Species' }),
    IRIS_ROWS,
  );

  expect(resolved.label).toBe('Species');
});

test('a stated order reorders the legend and the colours follow it', () => {
  const resolved = resolveProjectionGroups(
    irisSamples({ groupOrder: ['virginica', 'setosa', 'versicolor'] }),
    IRIS_ROWS,
  );

  expect(resolved.entries).toStrictEqual([
    { id: 'virginica', label: 'virginica', color: '#0072b2', count: 50 },
    { id: 'setosa', label: 'setosa', color: '#d55e00', count: 50 },
    { id: 'versicolor', label: 'versicolor', color: '#009e73', count: 50 },
  ]);
  expect(resolved.groupOf[0]).toBe(1);
  expect(resolved.groupOf[50]).toBe(2);
  expect(resolved.groupOf[149]).toBe(0);
});

test('a group the order never named is appended where it appears', () => {
  const resolved = resolveProjectionGroups(
    irisSamples({ groupOrder: ['virginica'] }),
    IRIS_ROWS,
  );

  expect(resolved.entries.map((entry) => entry.id)).toStrictEqual([
    'virginica',
    'setosa',
    'versicolor',
  ]);
});

test('a group named in the order but held by no row keeps its place', () => {
  const resolved = resolveProjectionGroups(
    irisSamples({ groupOrder: ['setosa', 'hybrid', 'versicolor'] }),
    IRIS_ROWS,
  );

  expect(resolved.entries).toStrictEqual([
    { id: 'setosa', label: 'setosa', color: '#0072b2', count: 50 },
    { id: 'hybrid', label: 'hybrid', color: '#d55e00', count: 0 },
    { id: 'versicolor', label: 'versicolor', color: '#009e73', count: 50 },
    { id: 'virginica', label: 'virginica', color: '#cc79a7', count: 50 },
  ]);
});

test('a row belonging to nothing lands outside every group', () => {
  const samples: ProjectionSamples = {
    ids: ['a', 'b', 'c'],
    groups: ['setosa', undefined, 'setosa'],
  };
  const resolved = resolveProjectionGroups(samples, 3);

  expect(resolved.entries).toStrictEqual([
    { id: 'setosa', label: 'setosa', color: '#0072b2', count: 2 },
  ]);
  expect(resolved.groupOf[1]).toBe(-1);
});

test('a pinned colour is taken out of the palette before anyone draws from it', () => {
  const resolved = resolveProjectionGroups(
    irisSamples({ groupColors: { setosa: '#123456' } }),
    IRIS_ROWS,
  );

  expect(resolved.entries.map((entry) => entry.color)).toStrictEqual([
    '#123456',
    '#0072b2',
    '#d55e00',
  ]);
});

test('pinning one group onto another group palette colour still leaves them apart', () => {
  const resolved = resolveProjectionGroups(
    irisSamples({ groupColors: { virginica: '#0072b2' } }),
    IRIS_ROWS,
  );

  expect(resolved.entries.map((entry) => entry.color)).toStrictEqual([
    '#d55e00',
    '#009e73',
    '#0072b2',
  ]);
});

test('samples with no groups at all are one undifferentiated crowd', () => {
  const resolved = resolveProjectionGroups({ ids: ['a', 'b'] }, 2);

  expect(resolved.entries).toStrictEqual([]);
  expect([...resolved.groupOf]).toStrictEqual([-1, -1]);
});

test('the row count decides the length, not the group column', () => {
  const samples: ProjectionSamples = {
    ids: ['a', 'b', 'c'],
    groups: ['setosa'],
  };
  const resolved = resolveProjectionGroups(samples, 3);

  expect([...resolved.groupOf]).toStrictEqual([0, -1, -1]);
  expect(resolved.entries).toStrictEqual([
    { id: 'setosa', label: 'setosa', color: '#0072b2', count: 1 },
  ]);
});
