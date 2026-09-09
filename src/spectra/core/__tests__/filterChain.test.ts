import { expect, test } from 'vitest';

import {
  addFilter,
  defaultFilter,
  duplicateFilter,
  filterOptions,
  moveFilter,
  readFilterOption,
  removeFilter,
  setFilterOption,
} from '../filterChain.ts';
import type { SpectrumFilter } from '../settings.ts';

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
