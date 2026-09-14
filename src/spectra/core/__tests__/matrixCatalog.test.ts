import { expect, test } from 'vitest';

import {
  MATRIX_FILTER_NAMES,
  MATRIX_STEPS,
  SCALE_METHODS,
  SCALE_METHOD_LABELS,
  findMatrixStep,
  isMatrixFilterName,
  isScaleMethod,
} from '../matrixCatalog.ts';

test('the editor knows exactly the three steps the processor own switch matches, and no fourth', () => {
  expect(Object.keys(MATRIX_STEPS)).toStrictEqual([
    'pqn',
    'centerMean',
    'rescale',
  ]);
  expect(MATRIX_FILTER_NAMES).toStrictEqual(['pqn', 'centerMean', 'rescale']);
});

test('centre on the mean takes no fields at all and says any option set on it is ignored', () => {
  expect(MATRIX_STEPS.centerMean.fields).toStrictEqual([]);
  expect(MATRIX_STEPS.centerMean.label).toBe('Centre on the mean');
  expect(MATRIX_STEPS.centerMean.summary).toBe(
    'Subtracts the mean of every column. It takes no options: anything set here is ignored.',
  );
});

test('pqn offers both options upstream declares but warns in its summary that Min is never read', () => {
  expect(MATRIX_STEPS.pqn.fields).toStrictEqual([
    { key: 'min', label: 'Min' },
    { key: 'max', label: 'Max', placeholder: '100' },
  ]);
  expect(MATRIX_STEPS.pqn.summary).toBe(
    'Divides every spectrum by its own dilution factor, read against the median spectrum. Min is declared upstream but never read.',
  );
});

test('rescale offers both bounds, each placeholding the value upstream falls back to', () => {
  expect(MATRIX_STEPS.rescale.fields).toStrictEqual([
    { key: 'min', label: 'Min', placeholder: '0' },
    { key: 'max', label: 'Max', placeholder: '1' },
  ]);
  expect(MATRIX_STEPS.rescale.label).toBe('Rescale');
});

test('a known name resolves to the entry the menu itself is built from', () => {
  expect(findMatrixStep('pqn')).toBe(MATRIX_STEPS.pqn);
  expect(findMatrixStep('centerMean')).toBe(MATRIX_STEPS.centerMean);
  expect(findMatrixStep('rescale')).toBe(MATRIX_STEPS.rescale);
});

test('a name the processor would throw on, or no name at all, resolves to nothing so the row falls back to the raw name', () => {
  expect(findMatrixStep(undefined)).toBeUndefined();
  expect(findMatrixStep('')).toBeUndefined();
  expect(findMatrixStep('savitzkyGolay')).toBeUndefined();
  expect(findMatrixStep('PQN')).toBeUndefined();
});

test('an inherited property name is not mistaken for a step, because only the three names are looked up', () => {
  expect(findMatrixStep('toString')).toBeUndefined();
  expect(findMatrixStep('constructor')).toBeUndefined();
  expect(isMatrixFilterName('hasOwnProperty')).toBe(false);
});

test('a matrix step name must be spelled exactly, because the processor switch compares it as written', () => {
  expect(isMatrixFilterName('centerMean')).toBe(true);
  expect(isMatrixFilterName('centermean')).toBe(false);
});

test('the four scalings are named in the order the processor switch lists them', () => {
  expect(SCALE_METHODS).toStrictEqual(['min', 'max', 'minmax', 'integration']);
  expect(Object.keys(SCALE_METHOD_LABELS)).toStrictEqual([...SCALE_METHODS]);
  expect(SCALE_METHOD_LABELS).toStrictEqual({
    min: 'Smallest value',
    max: 'Largest value',
    minmax: 'Both ends',
    integration: 'Integral',
  });
});

test('a scaling is recognised once lower-cased, and only then, because that is how the processor compares it', () => {
  expect(isScaleMethod('minmax')).toBe(true);
  expect(isScaleMethod('minMax')).toBe(false);
  expect(isScaleMethod('median')).toBe(false);
});
