import { expect, test } from 'vitest';

import type { MatrixLike } from '../../../chart/core/matrix.ts';
import { DEFAULT_PROJECTION_OPTIONS } from '../projectionOptions.ts';
import type { ProjectionResult } from '../projectionResult.ts';
import type { ProjectionGrouping } from '../projectionSamples.ts';
import { resolveProjectionOptions } from '../resolveProjectionOptions.ts';

const EMPTY_MATRIX: MatrixLike = { rows: 0, columns: 0, get: () => 0 };

const IRIS_AXIS = {
  kind: 'named',
  names: ['Sepal length', 'Sepal width', 'Petal length', 'Petal width'],
} as const;

const SCALED: ProjectionResult = {
  method: 'Principal components',
  axes: [
    { name: 'PC 1', share: 0.7296 },
    { name: 'PC 2', share: 0.2285 },
    { name: 'PC 3', share: 0.0367 },
    { name: 'PC 4', share: 0.0052 },
  ],
  scores: EMPTY_MATRIX,
  loadings: {
    weights: EMPTY_MATRIX,
    variables: IRIS_AXIS,
    mean: [5.84, 3.06, 3.76, 1.2],
    spread: [1.71, 0.96, 0.38, 0.14],
    scales: [0.83, 0.44, 1.77, 0.76],
  },
};

const UNSCALED: ProjectionResult = {
  ...SCALED,
  loadings: {
    weights: EMPTY_MATRIX,
    variables: IRIS_AXIS,
    mean: [5.84, 3.06, 3.76, 1.2],
    spread: [1.71, 0.96, 0.38, 0.14],
  },
};

test('the figure opens on the first two axes, outlined and coloured by group', () => {
  expect(DEFAULT_PROJECTION_OPTIONS).toStrictEqual({
    xAxis: 0,
    yAxis: 1,
    zAxis: 2,
    cloudGesture: 'turn',
    colorBy: '',
    shapeBy: '',
    ellipse: { kind: 'coverage', probability: 0.95 },
    pointRadius: 3.5,
    showGroupMeans: false,
    showGroupLabels: false,
    showIds: false,
    pairCount: 4,
    variablesView: 'effect',
    variablesCount: 3,
    sharedScale: true,
    showAverage: true,
    spread: 2,
    variableOrder: 'original',
    shareTarget: 0.95,
    selectMode: 'replace',
  });
});

test('overriding nothing gives the defaults back untouched', () => {
  expect(resolveProjectionOptions(undefined, SCALED)).toStrictEqual(
    DEFAULT_PROJECTION_OPTIONS,
  );
  expect(resolveProjectionOptions({}, SCALED)).toStrictEqual(
    DEFAULT_PROJECTION_OPTIONS,
  );
});

test('two axes past the end are pulled back inside and kept apart', () => {
  const resolved = resolveProjectionOptions({ xAxis: 9, yAxis: 9 }, SCALED);

  expect(resolved.xAxis).toBe(3);
  expect(resolved.yAxis).toBe(2);
});

test('a collision on the first axis moves the vertical one up instead', () => {
  const resolved = resolveProjectionOptions({ xAxis: 0, yAxis: 0 }, SCALED);

  expect(resolved.xAxis).toBe(0);
  expect(resolved.yAxis).toBe(1);
});

test('the panel count is held inside the axes that exist', () => {
  expect(
    resolveProjectionOptions({ variablesCount: 99 }, SCALED).variablesCount,
  ).toBe(4);
  expect(
    resolveProjectionOptions({ variablesCount: 0 }, SCALED).variablesCount,
  ).toBe(1);
});

test('a pair grid never falls below two axes', () => {
  expect(resolveProjectionOptions({ pairCount: 1 }, SCALED).pairCount).toBe(2);
  expect(resolveProjectionOptions({ pairCount: 99 }, SCALED).pairCount).toBe(4);
});

test('a view whose data the model never computed falls back to the weights', () => {
  expect(
    resolveProjectionOptions({ variablesView: 'rescaled' }, UNSCALED)
      .variablesView,
  ).toBe('weights');
  expect(
    resolveProjectionOptions({ variablesView: 'rescaled' }, SCALED)
      .variablesView,
  ).toBe('rescaled');
  expect(
    resolveProjectionOptions(
      { variablesView: 'effect' },
      {
        ...SCALED,
        loadings: undefined,
      },
    ).variablesView,
  ).toBe('weights');
});

test('outlines switched off stay off rather than falling back to the default', () => {
  expect(
    resolveProjectionOptions({ ellipse: null }, SCALED).ellipse,
  ).toBeNull();
  expect(
    resolveProjectionOptions(
      { ellipse: { kind: 'standardDeviations', standardDeviations: 2 } },
      SCALED,
    ).ellipse,
  ).toStrictEqual({ kind: 'standardDeviations', standardDeviations: 2 });
});

test('a broken saved number never reaches the plot', () => {
  const resolved = resolveProjectionOptions(
    {
      pointRadius: Number.NaN,
      spread: -4,
      shareTarget: 12,
      variablesCount: Number.NaN,
    },
    SCALED,
  );

  expect(resolved.pointRadius).toBe(3.5);
  expect(resolved.spread).toBe(0);
  expect(resolved.shareTarget).toBe(1);
  expect(resolved.variablesCount).toBe(3);
});

test('a result with a single axis cannot separate the two of them', () => {
  const single: ProjectionResult = {
    ...SCALED,
    axes: [{ name: 'PC 1', share: 1 }],
  };
  const resolved = resolveProjectionOptions({ xAxis: 5, yAxis: 5 }, single);

  expect(resolved.xAxis).toBe(0);
  expect(resolved.yAxis).toBe(0);
});

const CLUSTERS_AND_CLASSES: readonly ProjectionGrouping[] = [
  { id: 'cluster', label: 'Cluster', groups: [] },
  { id: 'class', label: 'Class', groups: [] },
];

test('the colour takes the first grouping and the shape the second', () => {
  const resolved = resolveProjectionOptions({}, SCALED, CLUSTERS_AND_CLASSES);

  expect(resolved.colorBy).toBe('cluster');
  expect(resolved.shapeBy).toBe('class');
});

test('a grouping saved on other data falls back to the usual one, and none stays none', () => {
  const saved = resolveProjectionOptions(
    { colorBy: 'batch', shapeBy: 'none' },
    SCALED,
    CLUSTERS_AND_CLASSES,
  );

  expect(saved.colorBy).toBe('cluster');
  expect(saved.shapeBy).toBe('none');
  expect(
    resolveProjectionOptions({ colorBy: 'none' }, SCALED, CLUSTERS_AND_CLASSES)
      .colorBy,
  ).toBe('none');
});

test('the colour taking the second grouping leaves the first to the shape', () => {
  const resolved = resolveProjectionOptions(
    { colorBy: 'class' },
    SCALED,
    CLUSTERS_AND_CLASSES,
  );

  expect(resolved.shapeBy).toBe('cluster');
});

test('the shape never draws the grouping the colour already stands for', () => {
  const resolved = resolveProjectionOptions(
    { colorBy: 'cluster', shapeBy: 'cluster' },
    SCALED,
    CLUSTERS_AND_CLASSES,
  );

  expect(resolved.shapeBy).toBe('class');
});

test('with one grouping, turning the colour off gives the dots no shapes', () => {
  const one = CLUSTERS_AND_CLASSES.slice(0, 1);

  expect(resolveProjectionOptions({}, SCALED, one).shapeBy).toBe('none');
  expect(
    resolveProjectionOptions({ colorBy: 'none' }, SCALED, one).shapeBy,
  ).toBe('none');
  expect(
    resolveProjectionOptions(
      { colorBy: 'none', shapeBy: 'cluster' },
      SCALED,
      one,
    ).shapeBy,
  ).toBe('cluster');
});

test('samples carrying no grouping leave nothing to colour or shape by', () => {
  const resolved = resolveProjectionOptions({}, SCALED, []);

  expect(resolved.colorBy).toBe('none');
  expect(resolved.shapeBy).toBe('none');
});
