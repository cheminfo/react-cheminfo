import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/matrix.ts';
import type { ProjectionLoadings } from '../projectionResult.ts';
import { drawableVariablesView } from '../variablesView.ts';

const WEIGHTS = rowMatrix([
  [0.1, 0.5],
  [0.3, 0.2],
]);

const BARE: ProjectionLoadings = {
  weights: WEIGHTS,
  variables: { kind: 'named', names: ['a', 'b'] },
};

const WALKABLE: ProjectionLoadings = {
  ...BARE,
  mean: [1, 2],
  spread: [0.5, 0.25],
};

test('a result with no weights at all can only draw weights', () => {
  expect(drawableVariablesView('effect', undefined)).toBe('weights');
  expect(drawableVariablesView('sample', undefined)).toBe('weights');
  expect(drawableVariablesView('rescaled', undefined)).toBe('weights');
});

test('effect needs the average to start from and the spread to walk along', () => {
  expect(drawableVariablesView('effect', BARE)).toBe('weights');
  expect(drawableVariablesView('effect', { ...BARE, mean: [1, 2] })).toBe(
    'weights',
  );
  expect(drawableVariablesView('effect', WALKABLE)).toBe('effect');
});

test('rescaled needs the scaling it undoes', () => {
  expect(drawableVariablesView('rescaled', WALKABLE)).toBe('weights');
  expect(
    drawableVariablesView('rescaled', { ...WALKABLE, scales: [1, 2] }),
  ).toBe('rescaled');
});

test('sample needs the average, and never the spread it does not walk', () => {
  // The bar and the panels disagreed here: one asked for a spread the sample
  // view has no use for, so it offered `weights` where the panels would have
  // drawn the sample quite happily.
  expect(drawableVariablesView('sample', { ...BARE, mean: [1, 2] })).toBe(
    'sample',
  );
  expect(drawableVariablesView('sample', BARE)).toBe('weights');
});

test('a caller that knows the selection gets the stricter answer', () => {
  // The bar leaves the scores out, because what is selected is not part of the
  // result; the panels pass them, and nothing selected means nothing to draw.
  expect(drawableVariablesView('sample', WALKABLE)).toBe('sample');
  expect(drawableVariablesView('sample', WALKABLE, [])).toBe('weights');
  expect(drawableVariablesView('sample', WALKABLE, [1.5])).toBe('sample');
});
