import { getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { expect, test } from 'vitest';

import type { LoadingProfilesOptions } from '../loadingProfiles.ts';
import { loadingProfiles } from '../loadingProfiles.ts';
import { pcaResult } from '../pcaResult.ts';
import type { ProjectionLoadings } from '../projectionResult.ts';
import type { VariableAxis } from '../variableAxis.ts';

const IRIS_AXIS: VariableAxis = {
  kind: 'named',
  names: ['Sepal length', 'Sepal width', 'Petal length', 'Petal width'],
};

const rows = getNumbers();
const pca = new PCA(rows, { scale: true });
const result = pcaResult(pca, { rows, scaled: true, variables: IRIS_AXIS });
const loadings = result.loadings as ProjectionLoadings;

const COMMON: Omit<LoadingProfilesOptions, 'view'> = {
  loadings,
  axes: result.axes,
  count: 3,
  spread: 2,
  sharedScale: true,
  order: 'original',
};

test('the weights view draws the component as the model holds it', () => {
  const drawn = loadingProfiles({ ...COMMON, view: 'weights' });

  expect(drawn.view).toBe('weights');
  expect(drawn.axis).toStrictEqual(IRIS_AXIS);
  expect(Array.from(drawn.order)).toStrictEqual([0, 1, 2, 3]);
  expect(drawn.mean).toBeUndefined();
  expect(drawn.valueLabel).toBe('Weight');
  expect(drawn.profiles).toHaveLength(3);
  expect(drawn.profiles[0]?.values).toStrictEqual([
    0.5210659146701195, -0.2693474425059427, 0.580413095796294,
    0.5648565357793605,
  ]);
  expect(drawn.profiles[0]?.secondValues).toBeUndefined();
});

test('a panel carries its component colour, its title and its share', () => {
  const drawn = loadingProfiles({ ...COMMON, view: 'weights' });

  expect(drawn.profiles[0]?.index).toBe(0);
  expect(drawn.profiles[0]?.label).toBe('PC1');
  expect(drawn.profiles[0]?.color).toBe('#e69f00');
  expect(drawn.profiles[0]?.share).toBe(0.7296244541329989);
  expect(drawn.profiles[1]?.color).toBe('#56b4e9');
  expect(drawn.profiles[2]?.color).toBe('#4d4d4d');
  expect(drawn.profiles[2]?.label).toBe('PC3');
});

test('the rescaled view multiplies each weight by its own measurement’s spread', () => {
  const drawn = loadingProfiles({ ...COMMON, view: 'rescaled' });

  expect(drawn.view).toBe('rescaled');
  expect(drawn.mean).toBeUndefined();

  const values = drawn.profiles[0]?.values ?? [];

  expect(values[0]).toBeCloseTo(0.4314770343821298, 12);
  expect(values[1]).toBeCloseTo(-0.11739946912226608, 12);
  expect(values[2]).toBeCloseTo(1.0246022125698553, 12);
  expect(values[3]).toBeCloseTo(0.4305549291294764, 12);

  const scales = loadings.scales ?? [];
  for (let column = 0; column < 4; column++) {
    const expected = loadings.weights.get(0, column) * (scales[column] ?? 0);

    expect(values[column]).toBeCloseTo(expected, 12);
  }
});

test('the effect view walks the average sample to each end of the component', () => {
  const drawn = loadingProfiles({ ...COMMON, view: 'effect' });

  expect(drawn.view).toBe('effect');
  expect(drawn.valueLabel).toBe('');
  expect(drawn.mean).toStrictEqual(loadings.mean);

  const values = drawn.profiles[0]?.values ?? [];
  const second = drawn.profiles[0]?.secondValues ?? [];

  expect(values[0]).toBeCloseTo(7.317570538064391, 12);
  expect(values[2]).toBeCloseTo(7.258781226938924, 12);
  expect(second[0]).toBeCloseTo(4.3690961286022745, 12);
  expect(second[2]).toBeCloseTo(0.25721877306107643, 12);

  const mean = loadings.mean ?? [];
  const scales = loadings.scales ?? [];
  const spread = loadings.spread ?? [];
  for (let column = 0; column < 4; column++) {
    const step =
      2 *
      (spread[0] ?? 0) *
      loadings.weights.get(0, column) *
      (scales[column] ?? 0);

    expect(values[column]).toBeCloseTo((mean[column] ?? 0) + step, 12);
    expect(second[column]).toBeCloseTo((mean[column] ?? 0) - step, 12);
  }
});

test('the sample view adds one component to the next until the sample is there', () => {
  const scores = [
    result.scores.get(0, 0),
    result.scores.get(0, 1),
    result.scores.get(0, 2),
  ];
  const drawn = loadingProfiles({
    ...COMMON,
    view: 'sample',
    sampleScores: scores,
    sampleLabel: 'Flower 1',
  });

  expect(drawn.view).toBe('sample');
  expect(drawn.profiles[0]?.secondValues).toBeUndefined();

  const first = drawn.profiles[0]?.values ?? [];

  expect(first[0]).toBeCloseTo(4.8694287526828886, 12);
  expect(first[2]).toBeCloseTo(1.4453281573484134, 12);

  // Three of the four components put the first flower back where it was.
  const third = drawn.profiles[2]?.values ?? [];

  expect(third[0]).toBeCloseTo(5.094788370831797, 12);
  expect(third[1]).toBeCloseTo(3.501296719199302, 12);
  expect(third[2]).toBeCloseTo(1.4340789332260093, 12);
  expect(third[3]).toBeCloseTo(0.19038654387256004, 12);
});

test('a view whose data is missing falls back to the weights and says so', () => {
  const plain = pcaResult(new PCA(rows), { rows, variables: IRIS_AXIS });
  const unscaled = plain.loadings as ProjectionLoadings;
  const rescaled = loadingProfiles({
    ...COMMON,
    loadings: unscaled,
    axes: plain.axes,
    view: 'rescaled',
  });

  expect(rescaled.view).toBe('weights');
  expect(rescaled.valueLabel).toBe('Weight');
  expect(rescaled.profiles[0]?.values).toStrictEqual([
    0.3613865917853688, -0.0845225140645687, 0.8566706059498349,
    0.35828919715155066,
  ]);

  const sample = loadingProfiles({ ...COMMON, view: 'sample' });

  expect(sample.view).toBe('weights');
  expect(sample.mean).toBeUndefined();
});

test('the strongest order puts petal length first and reports where each slot came from', () => {
  const drawn = loadingProfiles({
    ...COMMON,
    view: 'weights',
    order: 'strongest',
  });

  expect(Array.from(drawn.order)).toStrictEqual([2, 3, 0, 1]);
  expect(drawn.profiles[0]?.values).toStrictEqual([
    0.580413095796294, 0.5648565357793605, 0.5210659146701195,
    -0.2693474425059427,
  ]);
  // Every panel is drawn in that one order, so the stack reads down a column.
  expect(drawn.profiles[1]?.values[0]).toBe(0.024491609085586494);
});

test('one shared scale covers every panel and the zero the bars stand on', () => {
  const drawn = loadingProfiles({ ...COMMON, view: 'weights' });

  expect(drawn.sharedScale).toBe(true);
  expect(drawn.domain.min).toBeCloseTo(-0.7121511569435057, 12);
  expect(drawn.domain.max).toBeCloseTo(1.0011740793732966, 12);

  for (const profile of drawn.profiles) {
    for (const value of profile.values) {
      expect(value).toBeGreaterThanOrEqual(drawn.domain.min);
      expect(value).toBeLessThanOrEqual(drawn.domain.max);
    }
  }
});

test('the count never asks for a component the model does not hold', () => {
  const drawn = loadingProfiles({ ...COMMON, view: 'weights', count: 99 });

  expect(drawn.profiles).toHaveLength(4);

  const none = loadingProfiles({ ...COMMON, view: 'weights', count: 0 });

  expect(none.profiles).toStrictEqual([]);
  expect(none.domain).toStrictEqual({ min: 0, max: 1 });
});
