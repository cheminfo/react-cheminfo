import { expect, test } from 'vitest';

import {
  addFilter,
  defaultFilter,
  duplicateFilter,
  filterOptions,
  moveFilter,
  readFilterOption,
  readNumberOption,
  removeFilter,
  reorder,
  setFilterOption,
} from '../filterChain.ts';
import type { MatrixFilter, SpectrumFilter } from '../settings.ts';

test('an entry moves to its new position and the rest close up behind it', () => {
  expect(reorder(['a', 'b', 'c'], 0, 2)).toStrictEqual(['b', 'c', 'a']);
  expect(reorder(['a', 'b', 'c'], 2, 0)).toStrictEqual(['c', 'a', 'b']);
});

test('moving an entry that is not there leaves the list as it was', () => {
  expect(reorder(['a', 'b'], 5, 0)).toStrictEqual(['a', 'b']);
});

test('removing a step that is not there leaves the chain as it was', () => {
  const chain: readonly SpectrumFilter[] = [
    { name: 'centerMean' },
    { name: 'divideBySD' },
  ];

  expect(removeFilter(chain, 5)).toStrictEqual([...chain]);
  expect(removeFilter(chain, -1)).toStrictEqual([...chain]);
});

test('a shift opens with no options, like any step upstream can default', () => {
  expect(defaultFilter('setMaxY')).toStrictEqual({ name: 'setMaxY' });
});

test('a matrix option that is set reads back as the number it holds, zero included', () => {
  expect(
    readNumberOption({ name: 'rescale', options: { min: 0, max: 1 } }, 'min'),
  ).toBe(0);
  expect(readNumberOption({ name: 'pqn', options: { max: 100 } }, 'max')).toBe(
    100,
  );
});

test('a matrix option left to upstream reads back as nothing, whatever shape the step options are in', () => {
  expect(readNumberOption({ name: 'rescale' }, 'min')).toBeUndefined();
  expect(
    readNumberOption({ name: 'rescale', options: {} }, 'min'),
  ).toBeUndefined();
  expect(
    readNumberOption({ name: 'rescale', options: null }, 'min'),
  ).toBeUndefined();
  expect(
    readNumberOption({ name: 'rescale', options: 'min=0' }, 'min'),
  ).toBeUndefined();
});

test('an option holding something that is not a number reads back as nothing, so the box shows its placeholder instead of junk', () => {
  expect(
    readNumberOption({ name: 'rescale', options: { min: '0' } }, 'min'),
  ).toBeUndefined();
  expect(
    readNumberOption({ name: 'rescale', options: { min: null } }, 'min'),
  ).toBeUndefined();
});

test('setting a number on a matrix step that had no options creates them with only that option in it', () => {
  const step: MatrixFilter = { name: 'rescale' };
  const next = setFilterOption(step, 'min', 0);

  expect(next).toStrictEqual({ name: 'rescale', options: { min: 0 } });
  expect(step).toStrictEqual({ name: 'rescale' });
});

test('setting a number keeps every sibling option, including ones the editor has no field for', () => {
  const step: MatrixFilter = {
    name: 'pqn',
    options: { max: 100, unit: 'ppm' },
  };
  const next = setFilterOption(step, 'min', 3);

  expect(next).toStrictEqual({
    name: 'pqn',
    options: { max: 100, unit: 'ppm', min: 3 },
  });
  expect(step).toStrictEqual({
    name: 'pqn',
    options: { max: 100, unit: 'ppm' },
  });
});

test('rewriting an option keeps its siblings, and its place among them', () => {
  const step: MatrixFilter = { name: 'rescale', options: { min: 0, max: 1 } };
  const next = setFilterOption(step, 'min', -1);

  expect(next).toStrictEqual({ name: 'rescale', options: { min: -1, max: 1 } });
  expect(Object.keys(filterOptions(next))).toStrictEqual(['min', 'max']);
});

test('clearing the last option of a matrix step drops the whole options object, which is the only way back to what upstream does', () => {
  const step: MatrixFilter = { name: 'rescale', options: { min: 0 } };
  const next = setFilterOption(step, 'min', undefined);

  expect(next).toStrictEqual({ name: 'rescale' });
  expect(Object.hasOwn(next, 'options')).toBe(false);
});

test('clearing an option a matrix step never held leaves it with no options rather than an empty object', () => {
  const step: MatrixFilter = { name: 'centerMean' };
  const next = setFilterOption(step, 'min', undefined);

  expect(next).toStrictEqual({ name: 'centerMean' });
  expect(Object.hasOwn(next, 'options')).toBe(false);
});

test('a zero is written like any other number, because zero is a bound the reader meant', () => {
  const step: MatrixFilter = { name: 'rescale', options: { max: 1 } };

  expect(setFilterOption(step, 'min', 0)).toStrictEqual({
    name: 'rescale',
    options: { max: 1, min: 0 },
  });
});

test('options that are not an object are thrown away rather than read, so a written step is always one the processor can take', () => {
  const text: MatrixFilter = { name: 'pqn', options: 'max=100' };
  const empty: MatrixFilter = { name: 'pqn', options: null };

  expect(setFilterOption(text, 'min', 3)).toStrictEqual({
    name: 'pqn',
    options: { min: 3 },
  });
  expect(setFilterOption(empty, 'min', 3)).toStrictEqual({
    name: 'pqn',
    options: { min: 3 },
  });
});

const CHAIN: readonly SpectrumFilter[] = [
  { name: 'centerMean' },
  { name: 'divideBySD' },
  { name: 'rescale', options: { min: 0, max: 1 } },
];

test('a new step carries no options, so upstream keeps every default it has', () => {
  expect(defaultFilter('centerMean')).toStrictEqual({ name: 'centerMean' });
  expect(defaultFilter('savitzkyGolay')).toStrictEqual({
    name: 'savitzkyGolay',
  });
});

test('calibrateX is the one step opened with options, because a partial gsd loses its tuning', () => {
  expect(defaultFilter('calibrateX')).toStrictEqual({
    name: 'calibrateX',
    options: {
      gsd: {
        maxCriteria: true,
        minMaxRatio: 0.1,
        realTopDetection: true,
        smoothY: true,
        sgOptions: { windowSize: 7, polynomial: 3 },
      },
    },
  });
});

test('a step is added at the end, where a chain grows', () => {
  expect(addFilter(CHAIN, 'normed')).toHaveLength(4);
  expect(addFilter(CHAIN, 'normed')[3]).toStrictEqual({ name: 'normed' });
});

test('removing a step leaves the others in order', () => {
  expect(removeFilter(CHAIN, 1)).toStrictEqual([CHAIN[0], CHAIN[2]]);
});

test('a duplicate sits just after its original and shares nothing with it', () => {
  const duplicated = duplicateFilter(CHAIN, 2);

  expect(duplicated).toHaveLength(4);
  expect(duplicated[3]).toStrictEqual(CHAIN[2]);
  expect(duplicated[3]).not.toBe(CHAIN[2]);
});

test('a step moves one place at a time and never off either end', () => {
  expect(moveFilter(CHAIN, 0, 1)[0]).toStrictEqual({ name: 'divideBySD' });
  expect(moveFilter(CHAIN, 0, -1)).toStrictEqual([...CHAIN]);
  expect(moveFilter(CHAIN, 2, 1)).toStrictEqual([...CHAIN]);
});

test('an option is read and written through its dotted path', () => {
  const step = setFilterOption(
    { name: 'calibrateX' },
    'gsd.sgOptions.windowSize',
    11,
  );

  expect(readFilterOption(step, 'gsd.sgOptions.windowSize')).toBe(11);
  expect(filterOptions(step)).toStrictEqual({
    gsd: { sgOptions: { windowSize: 11 } },
  });
});

test('clearing an option drops the key, so upstream goes back to its own default', () => {
  const set = setFilterOption({ name: 'rescale' }, 'min', 0.5);
  const cleared = setFilterOption(set, 'min', undefined);

  expect(readFilterOption(set, 'min')).toBe(0.5);
  expect(cleared).toStrictEqual({ name: 'rescale' });
});

test('clearing one option of several leaves the rest alone', () => {
  const step = setFilterOption(
    { name: 'rescale', options: { min: 0, max: 1 } },
    'min',
    undefined,
  );

  expect(step).toStrictEqual({ name: 'rescale', options: { max: 1 } });
});

test('reading an option a step never had answers undefined rather than throwing', () => {
  expect(
    readFilterOption({ name: 'centerMean' }, 'gsd.sgOptions.windowSize'),
  ).toBeUndefined();
  expect(filterOptions({ name: 'centerMean' })).toStrictEqual({});
});
