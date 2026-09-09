import { expect, test } from 'vitest';

import type { MatrixFilter } from '../../core/settings.ts';
import {
  MATRIX_ADD_OPTIONS,
  MATRIX_STEPS,
  matrixStep,
  readMatrixOption,
  writeMatrixOption,
} from '../matrixSteps.ts';

test('the editor knows exactly the three steps the processor own switch matches, and no fourth', () => {
  expect(Object.keys(MATRIX_STEPS)).toStrictEqual([
    'pqn',
    'centerMean',
    'rescale',
  ]);
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

test('the add menu prompts first and then offers only the three names that run', () => {
  expect(MATRIX_ADD_OPTIONS).toStrictEqual([
    { value: '', label: 'Add a matrix step…' },
    { value: 'pqn', label: 'Probabilistic quotient normalization' },
    { value: 'centerMean', label: 'Centre on the mean' },
    { value: 'rescale', label: 'Rescale' },
  ]);
});

test('a known name resolves to the entry the menu itself is built from', () => {
  expect(matrixStep('pqn')).toBe(MATRIX_STEPS.pqn);
  expect(matrixStep('centerMean')).toBe(MATRIX_STEPS.centerMean);
  expect(matrixStep('rescale')).toBe(MATRIX_STEPS.rescale);
});

test('a name the processor would throw on, or no name at all, resolves to nothing so the row falls back to the raw name', () => {
  expect(matrixStep(undefined)).toBeUndefined();
  expect(matrixStep('')).toBeUndefined();
  expect(matrixStep('savitzkyGolay')).toBeUndefined();
  expect(matrixStep('PQN')).toBeUndefined();
});

test('an inherited property name is not mistaken for a step, because only own keys are looked up', () => {
  expect(matrixStep('toString')).toBeUndefined();
  expect(matrixStep('constructor')).toBeUndefined();
});

test('an option that is set reads back as the number it holds, zero included', () => {
  expect(
    readMatrixOption({ name: 'rescale', options: { min: 0, max: 1 } }, 'min'),
  ).toBe(0);
  expect(readMatrixOption({ name: 'pqn', options: { max: 100 } }, 'max')).toBe(
    100,
  );
});

test('an option left to upstream reads back as nothing, whatever shape the step options are in', () => {
  expect(readMatrixOption({ name: 'rescale' }, 'min')).toBeUndefined();
  expect(
    readMatrixOption({ name: 'rescale', options: {} }, 'min'),
  ).toBeUndefined();
  expect(
    readMatrixOption({ name: 'rescale', options: null }, 'min'),
  ).toBeUndefined();
  expect(
    readMatrixOption({ name: 'rescale', options: 'min=0' }, 'min'),
  ).toBeUndefined();
});

test('an option holding something that is not a number reads back as nothing, so the box shows its placeholder instead of junk', () => {
  expect(
    readMatrixOption({ name: 'rescale', options: { min: '0' } }, 'min'),
  ).toBeUndefined();
  expect(
    readMatrixOption({ name: 'rescale', options: { min: null } }, 'min'),
  ).toBeUndefined();
});

test('setting a number on a step that had no options creates them with only that option in it', () => {
  const step: MatrixFilter = { name: 'rescale' };
  const next = writeMatrixOption(step, 'min', 0);

  expect(next).toStrictEqual({ name: 'rescale', options: { min: 0 } });
  expect(step).toStrictEqual({ name: 'rescale' });
});

test('setting a number keeps every sibling option, including ones the editor has no field for', () => {
  const step: MatrixFilter = {
    name: 'pqn',
    options: { max: 100, unit: 'ppm' },
  };
  const next = writeMatrixOption(step, 'min', 3);

  expect(next).toStrictEqual({
    name: 'pqn',
    options: { max: 100, unit: 'ppm', min: 3 },
  });
  expect(step).toStrictEqual({
    name: 'pqn',
    options: { max: 100, unit: 'ppm' },
  });
});

test('rewriting an option keeps its siblings, and the rewritten key moves to the end of the options', () => {
  const next = writeMatrixOption(
    { name: 'rescale', options: { min: 0, max: 1 } },
    'min',
    -1,
  );

  expect(next).toStrictEqual({ name: 'rescale', options: { max: 1, min: -1 } });
  expect(Object.keys((next.options ?? {}) as object)).toStrictEqual([
    'max',
    'min',
  ]);
});

test('clearing one option drops that key and leaves the others set', () => {
  const next = writeMatrixOption(
    { name: 'rescale', options: { min: 0, max: 1 } },
    'max',
    undefined,
  );

  expect(next).toStrictEqual({ name: 'rescale', options: { min: 0 } });
  expect(Object.hasOwn((next.options ?? {}) as object, 'max')).toBe(false);
});

test('clearing the last option drops the whole options object, which is the only way back to what upstream does', () => {
  const next = writeMatrixOption(
    { name: 'rescale', options: { min: 0 } },
    'min',
    undefined,
  );

  expect(next).toStrictEqual({ name: 'rescale' });
  expect(Object.hasOwn(next, 'options')).toBe(false);
});

test('clearing an option a step never held leaves it with no options rather than an empty object', () => {
  const next = writeMatrixOption({ name: 'centerMean' }, 'min', undefined);

  expect(next).toStrictEqual({ name: 'centerMean' });
  expect(Object.hasOwn(next, 'options')).toBe(false);
});

test('a zero is written like any other number, because zero is a bound the reader meant', () => {
  const next = writeMatrixOption(
    { name: 'rescale', options: { max: 1 } },
    'min',
    0,
  );

  expect(next).toStrictEqual({ name: 'rescale', options: { max: 1, min: 0 } });
});

test('options that are not an object are thrown away rather than read, so a written step is always one the processor can take', () => {
  expect(
    writeMatrixOption({ name: 'pqn', options: 'max=100' }, 'min', 3),
  ).toStrictEqual({ name: 'pqn', options: { min: 3 } });
  expect(
    writeMatrixOption({ name: 'pqn', options: null }, 'min', 3),
  ).toStrictEqual({
    name: 'pqn',
    options: { min: 3 },
  });
});
