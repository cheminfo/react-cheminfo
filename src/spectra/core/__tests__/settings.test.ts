import { expect, test } from 'vitest';

import type { SpectraProcessorSettings } from '../settings.ts';
import {
  DEFAULT_MAX_MEMORY,
  DEFAULT_NUMBER_OF_POINTS,
  EMPTY_SETTINGS,
  normalizationFilters,
  withNormalizationFilters,
} from '../settings.ts';

const SETTINGS: SpectraProcessorSettings = {
  maxMemory: 1024,
  normalization: {
    from: 400,
    to: 4000,
    filters: [{ name: 'centerMean' }, { name: 'divideBySD' }],
  },
};

test('the defaults are the ones the processor itself uses, spelled out', () => {
  expect(DEFAULT_MAX_MEMORY).toBe(268_435_456);
  expect(DEFAULT_NUMBER_OF_POINTS).toBe(1024);
  expect(EMPTY_SETTINGS).toStrictEqual({
    processor: { normalization: {} },
    postProcessing: {},
  });
});

test('the chain is read back at the narrower type the runtime already assumes', () => {
  expect(normalizationFilters(SETTINGS)).toStrictEqual([
    { name: 'centerMean' },
    { name: 'divideBySD' },
  ]);
});

test('settings that name no chain read as an empty one rather than as nothing', () => {
  expect(normalizationFilters({})).toStrictEqual([]);
  expect(normalizationFilters({ normalization: {} })).toStrictEqual([]);
});

test('writing a chain leaves every other field of the settings alone', () => {
  const written = withNormalizationFilters(SETTINGS, [{ name: 'rescale' }]);

  expect(written).toStrictEqual({
    maxMemory: 1024,
    normalization: { from: 400, to: 4000, filters: [{ name: 'rescale' }] },
  });
  expect(SETTINGS.normalization?.filters).toHaveLength(2);
});

test('a chain can be written onto settings that had none', () => {
  expect(
    withNormalizationFilters({}, [{ name: 'ensureGrowing' }]),
  ).toStrictEqual({
    normalization: { filters: [{ name: 'ensureGrowing' }] },
  });
});
