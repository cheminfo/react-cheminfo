import { getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { expect, test } from 'vitest';

import { explainedShares } from '../explainedShares.ts';
import { pcaResult } from '../pcaResult.ts';
import type { ProjectionAxis } from '../projectionResult.ts';

const rows = getNumbers();
const result = pcaResult(new PCA(rows, { scale: true }), {
  rows,
  scaled: true,
});
const shares = explainedShares(result.axes);

test('every component becomes a bar carrying its own colour and number', () => {
  expect(shares.components).toHaveLength(4);
  expect(shares.components[0]?.number).toBe(1);
  expect(shares.components[0]?.label).toBe('PC1');
  expect(shares.components[0]?.color).toBe('#e69f00');
  expect(shares.components[0]?.share).toBe(0.7296244541329989);
  expect(shares.components[0]?.eigenvalue).toBe(2.9184978165319926);
  expect(shares.components[3]?.label).toBe('PC4');
  expect(shares.components[3]?.color).toBe('#f0e442');
});

test('the running total is accumulated here and ends on a whole one', () => {
  expect(shares.components[0]?.cumulative).toBe(0.7296244541329989);
  expect(shares.components[1]?.cumulative).toBe(0.9581320720000166);
  expect(shares.components[2]?.cumulative).toBe(0.9948212908928454);
  expect(shares.components[3]?.cumulative).toBe(1);
});

test('the marker names the first component that reaches it', () => {
  expect(shares.target).toBe(0.95);
  expect(shares.reachesTargetAt).toBe(2);
  expect(explainedShares(result.axes, { target: 0.999 }).reachesTargetAt).toBe(
    4,
  );
  expect(explainedShares(result.axes, { target: 0.7 }).reachesTargetAt).toBe(1);
});

test('a target of nothing draws no marker at all', () => {
  const none = explainedShares(result.axes, { target: 0 });

  expect(none.target).toBe(0);
  expect(none.reachesTargetAt).toBeNull();
});

test('a target out of reach is clamped rather than obeyed', () => {
  expect(explainedShares(result.axes, { target: 4 }).target).toBe(1);
  expect(explainedShares(result.axes, { target: -1 }).target).toBe(0);
  expect(explainedShares(result.axes, { target: Number.NaN }).target).toBe(0);
});

test('a model that was cut short is not rounded up to a whole one', () => {
  const cut: ProjectionAxis[] = [
    { name: 'PC1', share: 0.6 },
    { name: 'PC2', share: 0.2 },
  ];
  const partial = explainedShares(cut);

  expect(partial.components[1]?.cumulative).toBeCloseTo(0.8, 12);
  expect(partial.reachesTargetAt).toBeNull();
  expect(partial.components[1]?.eigenvalue).toBeUndefined();
});

test('an axis that publishes no share stands at zero', () => {
  const mixed: ProjectionAxis[] = [
    { name: 'UMAP 1' },
    { name: 'UMAP 2', share: 0.5 },
  ];
  const drawn = explainedShares(mixed);

  expect(drawn.components[0]?.share).toBe(0);
  expect(drawn.components[0]?.cumulative).toBe(0);
  expect(drawn.components[1]?.cumulative).toBe(0.5);
});

test('no axes at all give no bars and no marker', () => {
  expect(explainedShares([])).toStrictEqual({
    components: [],
    target: 0.95,
    reachesTargetAt: null,
  });
});
