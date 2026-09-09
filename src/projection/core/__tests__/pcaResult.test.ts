import { getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/matrix.ts';
import type { PcaLike } from '../pcaLike.ts';
import { pcaResult } from '../pcaResult.ts';
import type { VariableAxis } from '../variableAxis.ts';

const IRIS_AXIS: VariableAxis = {
  kind: 'named',
  names: ['Sepal length', 'Sepal width', 'Petal length', 'Petal width'],
};

const rows = getNumbers();
const pca = new PCA(rows, { scale: true });
const result = pcaResult(pca, { rows, scaled: true, variables: IRIS_AXIS });

test('every component keeps its share, and they add up to one', () => {
  expect(result.axes).toHaveLength(4);
  expect(result.axes[0]?.share).toBe(0.7296244541329989);
  expect(result.axes[1]?.share).toBe(0.22850761786701762);
  expect(result.axes[2]?.share).toBe(0.03668921889282879);
  expect(result.axes[3]?.share).toBe(0.005178709107154812);

  let total = 0;
  for (const axis of result.axes) total += axis.share ?? 0;

  expect(total).toBeCloseTo(1, 12);
});

test('the axes are named and carry their eigenvalues', () => {
  expect(result.axes[0]?.name).toBe('PC1');
  expect(result.axes[3]?.name).toBe('PC4');
  expect(result.axes[0]?.eigenvalue).toBe(2.9184978165319926);
  expect(result.method).toBe('Principal components');
});

test('the sign convention flips the one component of iris that points down', () => {
  // PC 1's strongest weight is petal length at +0.580413, so it is left alone.
  expect(result.loadings?.weights.get(0, 0)).toBe(0.5210659146701195);
  expect(result.loadings?.weights.get(0, 2)).toBe(0.580413095796294);
  expect(result.scores.get(0, 0)).toBe(-2.2571411756481186);

  // PC 2's is sepal width at -0.9232957, so the whole component turns over.
  expect(result.loadings?.weights.get(1, 1)).toBe(0.9232956595407147);
  expect(result.loadings?.weights.get(1, 0)).toBe(0.37741761556456715);
  expect(result.scores.get(0, 1)).toBe(0.47842383212489753);

  // PC 3 and PC 4 already point the way the convention wants.
  expect(result.loadings?.weights.get(2, 0)).toBe(0.7195663527008161);
  expect(result.loadings?.weights.get(3, 2)).toBe(0.8014492463359884);
});

test("'none' hands back exactly what the model returned", () => {
  const raw = pcaResult(pca, {
    rows,
    scaled: true,
    variables: IRIS_AXIS,
    signConvention: 'none',
  });

  expect(raw.loadings?.weights.get(0, 0)).toBe(0.5210659146701195);
  expect(raw.scores.get(0, 0)).toBe(-2.2571411756481186);
  expect(raw.loadings?.weights.get(1, 1)).toBe(-0.9232956595407147);
  expect(raw.loadings?.weights.get(1, 0)).toBe(-0.37741761556456715);
  expect(raw.scores.get(0, 1)).toBe(-0.47842383212489753);
});

test('the average, the scaling and the spread of the scores are read off the rows', () => {
  const mean = result.loadings?.mean ?? [];

  expect(mean).toHaveLength(4);
  expect(mean[0]).toBeCloseTo(5.843333333333335, 12);
  expect(mean[1]).toBeCloseTo(3.057333333333334, 12);
  expect(mean[2]).toBeCloseTo(3.7580000000000027, 12);
  expect(mean[3]).toBeCloseTo(1.199333333333334, 12);

  const scales = result.loadings?.scales ?? [];

  expect(scales).toHaveLength(4);
  expect(scales[0]).toBeCloseTo(0.8280661279778629, 12);
  expect(scales[1]).toBeCloseTo(0.435866284936698, 12);
  expect(scales[2]).toBeCloseTo(1.7652982332594667, 12);
  expect(scales[3]).toBeCloseTo(0.7622376689603465, 12);

  const spread = result.loadings?.spread ?? [];

  expect(spread).toHaveLength(4);
  expect(spread[0]).toBeCloseTo(1.7083611493276216, 12);
  expect(spread[1]).toBeCloseTo(0.9560494084868573, 12);
  expect(spread[2]).toBeCloseTo(0.3830886001583903, 12);
  expect(spread[3]).toBeCloseTo(0.14392649661761112, 12);
});

test('a model that did not scale offers no scaling', () => {
  const unscaled = pcaResult(pca, { rows, variables: IRIS_AXIS });

  expect(unscaled.loadings?.scales).toBeUndefined();
  expect(unscaled.loadings?.valueLabel).toBe('');
  expect(unscaled.loadings?.variables).toStrictEqual(IRIS_AXIS);
});

test('the measurements are numbered when the caller does not name them', () => {
  const plain = pcaResult(pca, { rows });

  expect(plain.loadings?.variables).toStrictEqual({
    kind: 'named',
    names: ['1', '2', '3', '4'],
  });
});

test('a count keeps the first components and nothing else', () => {
  const two = pcaResult(pca, { rows, scaled: true, count: 2 });

  expect(two.axes).toHaveLength(2);
  expect(two.scores.rows).toBe(150);
  expect(two.scores.columns).toBe(2);
  expect(two.loadings?.weights.rows).toBe(2);
  expect(two.axes[0]?.share).toBe(0.7296244541329989);
  expect(two.axes[1]?.share).toBe(0.22850761786701762);
  expect(two.scores.get(0, 1)).toBe(0.47842383212489753);
});

test('rows that cannot be read are refused, not carried into the map', () => {
  expect(() => pcaResult(pca, { rows: [] })).toThrow('was given no rows');
  expect(() =>
    pcaResult(pca, {
      rows: [
        [1, 2, 3, 4],
        [1, 2, 3],
      ],
    }),
  ).toThrow('a row 3 measurements wide at index 1');
  expect(() =>
    pcaResult(pca, {
      rows: [
        [1, 2, 3, 4],
        [1, Number.NaN, 3, 4],
      ],
    }),
  ).toThrow('NaN at row 1, measurement 1');
});

test('a model that dropped a column is refused before it mislabels a panel', () => {
  const narrow: PcaLike = {
    predict: () => rowMatrix([[0, 0, 0]]),
    getExplainedVariance: () => [1, 0, 0],
    getCumulativeVariance: () => [1, 1, 1],
    getEigenvalues: () => [1, 0, 0],
    getLoadings: () =>
      rowMatrix([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]),
  };

  expect(() => pcaResult(narrow, { rows })).toThrow('ignoreZeroVariance');
});

test('samples placed into a finished model are appended and counted apart', () => {
  const numbers = getNumbers();
  const fitted = numbers.slice(0, 140);
  const held = numbers.slice(140);
  const pca = new PCA(fitted, { scale: true });

  const result = pcaResult(pca, {
    rows: fitted,
    projected: held,
    scaled: true,
  });

  expect(result.scores.rows).toBe(150);
  expect(result.fittedCount).toBe(140);

  // A held-out flower lands where the model puts it, not where it helped put
  // itself: projecting it on its own gives the same row.
  const alone = pcaResult(pca, { rows: fitted, projected: held.slice(0, 1) });

  expect(result.scores.get(140, 0)).toBeCloseTo(alone.scores.get(140, 0), 12);
});

test('an empty projected list leaves the result exactly as it was', () => {
  const numbers = getNumbers();
  const pca = new PCA(numbers, { scale: true });

  const plain = pcaResult(pca, { rows: numbers, scaled: true });
  const empty = pcaResult(pca, { rows: numbers, projected: [], scaled: true });

  expect(empty.fittedCount).toBeUndefined();
  expect(plain.fittedCount).toBeUndefined();
  expect(empty.scores.rows).toBe(150);
});
