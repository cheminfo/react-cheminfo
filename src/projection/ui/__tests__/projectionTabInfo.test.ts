import { getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import type { ProjectionResult, VariableAxis } from '../../core/index.ts';
import {
  PROJECTION_COPY,
  explainedShares,
  loadingProfiles,
  pcaResult,
} from '../../core/index.ts';
import {
  projectionPairsInfo,
  projectionSharesInfo,
  projectionVariablesInfo,
} from '../projectionTabInfo.ts';

const rows = getNumbers();
const IRIS_AXIS: VariableAxis = {
  kind: 'named',
  names: ['Sepal length', 'Sepal width', 'Petal length', 'Petal width'],
};
const iris = pcaResult(new PCA(rows, { scale: true }), {
  rows,
  scaled: true,
  variables: IRIS_AXIS,
});

const SPECTRUM_AXIS: VariableAxis = {
  kind: 'continuous',
  values: [1600, 1650, 1700],
  label: 'Wavenumber',
  unit: 'cm⁻¹',
};

const spectrum: ProjectionResult = {
  method: 'Principal components',
  axes: [
    { name: 'PC 1', share: 0.8 },
    { name: 'PC 2', share: 0.2 },
  ],
  scores: rowMatrix([
    [1, 0],
    [-1, 0],
  ]),
  loadings: {
    weights: rowMatrix([
      [0.1, 0.5, -0.2],
      [0.3, 0.081, 0.6],
    ]),
    variables: SPECTRUM_AXIS,
    valueLabel: 'Absorbance',
  },
};

test('the pair grid explains its own diagonal, and names the colour once', () => {
  const info = projectionPairsInfo(PROJECTION_COPY, 'Species', true);

  expect(info).toContain(PROJECTION_COPY.intro.pairs);
  expect(info).toContain(
    'Colour = Species. The strip along the diagonal shows how the samples spread out along that component on its own.',
  );
});

test('an uncoloured grid is not told what a colour it is not drawing means', () => {
  const info = projectionPairsInfo(PROJECTION_COPY, 'Species', false);

  expect(info).toBe(PROJECTION_COPY.intro.pairs);
});

test('the panels are explained by what they draw and by what their ink means', () => {
  const info = projectionVariablesInfo(
    profiles(iris, 'effect', 3),
    PROJECTION_COPY,
    'flower-1',
  );

  expect(info).toContain(PROJECTION_COPY.intro.variablesEffect);
  expect(info).toContain(PROJECTION_COPY.legend.variablesEffect);
  expect(info.toLowerCase()).not.toContain('reconstructed');
});

test('a continuous axis is named in the explanation, lowercased and pluralised', () => {
  const info = projectionVariablesInfo(
    profiles(spectrum, 'weights', 2),
    PROJECTION_COPY,
    'flower-1',
  );

  expect(info).toContain(
    'drawn back over your wavenumbers: what pushes a sample to one end of the map.',
  );
  expect(info).toContain(PROJECTION_COPY.legend.variablesWeights);
});

test('a run with no weights explains nothing rather than explaining a blank', () => {
  expect(projectionVariablesInfo(null, PROJECTION_COPY, 'flower-1')).toBe('');
});

test('the shares tab says what the first component explains, and the first few', () => {
  const info = projectionSharesInfo(
    explainedShares(iris.axes, { target: 0.95 }),
    PROJECTION_COPY,
  );

  expect(info).toContain(PROJECTION_COPY.intro.shares);
  expect(info).toContain(
    'Component 1 accounts for 73.0% of the differences between your samples.',
  );
  expect(info).toContain(
    'The first 2 components together account for 95.8% — the rest is mostly small, scattered differences.',
  );
  expect(info).toContain(PROJECTION_COPY.legend.shares);
});

test('a target of zero is said nothing about', () => {
  const info = projectionSharesInfo(
    explainedShares(iris.axes, { target: 0 }),
    PROJECTION_COPY,
  );

  expect(info).toContain('Component 1 accounts for 73.0%');
  expect(info).not.toContain('components together account for');
});

test('a target the kept components never reach is said so, not left unexplained', () => {
  const short = pcaResult(new PCA(rows, { scale: true }), {
    rows,
    scaled: true,
    count: 2,
  });
  const info = projectionSharesInfo(
    explainedShares(short.axes, { target: 0.99 }),
    PROJECTION_COPY,
  );

  expect(info).toContain(
    'Even all 2 components only account for 95.8%, so your samples differ in many small ways at once.',
  );
});

/**
 * The panels the viewer would have built for one view.
 * @param result - What the run produced.
 * @param view - What the panels draw.
 * @param count - How many of them there are.
 * @returns The panels.
 */
function profiles(
  result: ProjectionResult,
  view: 'effect' | 'weights',
  count: number,
) {
  return loadingProfiles({
    loadings: result.loadings ?? {
      weights: rowMatrix([]),
      variables: IRIS_AXIS,
    },
    axes: result.axes,
    view,
    count,
    spread: 2,
    sharedScale: true,
    order: 'original',
  });
}
