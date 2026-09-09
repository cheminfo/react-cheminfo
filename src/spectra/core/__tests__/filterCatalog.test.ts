import { expect, test } from 'vitest';

import {
  FILTER_CATALOG,
  FILTER_NAMES,
  filterEntry,
  filterMenu,
  filterNamesInGroup,
} from '../filterCatalog.ts';
import { FILTER_GROUPS } from '../filterFields.ts';

test('every step filterXY dispatches is described, and no other', () => {
  expect(FILTER_NAMES).toHaveLength(23);
  expect(FILTER_NAMES).toStrictEqual([
    'airPLSBaseline',
    'iterativePolynomialBaseline',
    'rollingAverageBaseline',
    'rollingBallBaseline',
    'rollingMedianBaseline',
    'savitzkyGolay',
    'firstDerivative',
    'secondDerivative',
    'thirdDerivative',
    'centerMean',
    'centerMedian',
    'divideBySD',
    'paretoNormalization',
    'normed',
    'rescale',
    'yFunction',
    'xFunction',
    'fromTo',
    'filterX',
    'equallySpaced',
    'calibrateX',
    'ensureGrowing',
    'reverseIfNeeded',
  ]);
});

test('every step carries a label and a sentence saying what it does to the data', () => {
  for (const name of FILTER_NAMES) {
    const entry = filterEntry(name);

    expect(entry.label.length).toBeGreaterThan(2);
    expect(entry.summary.endsWith('.')).toBe(true);
  }
});

test('the menu holds every step exactly once, grouped', () => {
  const menu = filterMenu();
  const listed = menu.flatMap((group) => group.names);

  expect(listed).toHaveLength(FILTER_NAMES.length);
  expect(new Set(listed).size).toBe(FILTER_NAMES.length);
  expect(menu.map((group) => group.group)).toStrictEqual(FILTER_GROUPS);
});

test('the five baselines are grouped together and none of them takes a parameter', () => {
  const baselines = filterNamesInGroup('baseline');

  expect(baselines).toStrictEqual([
    'airPLSBaseline',
    'iterativePolynomialBaseline',
    'rollingAverageBaseline',
    'rollingBallBaseline',
    'rollingMedianBaseline',
  ]);

  for (const name of baselines) {
    expect(filterEntry(name).fields).toHaveLength(0);
    expect(filterEntry(name).fixed).toBeDefined();
  }
});

test('calibrateX offers the peak picking, nested under gsd', () => {
  const keys = filterEntry('calibrateX').fields.map((field) => field.key);

  expect(keys).toContain('gsd.sgOptions.windowSize');
  expect(keys).toContain('gsd.peakDetectionAlgorithm');
  expect(keys).toHaveLength(12);
});

test('a step whose order is a trap says so', () => {
  expect(FILTER_CATALOG.reverseIfNeeded.caution).toContain('changes nothing');
  expect(FILTER_CATALOG.equallySpaced.caution).toContain('resamples twice');
  expect(FILTER_CATALOG.fromTo.caution).toContain('point numbers');
});

test('the one enum field spells its three choices out', () => {
  const algorithm = filterEntry('normed').fields.find(
    (field) => field.key === 'algorithm',
  );

  expect(algorithm?.kind).toBe('enum');
  expect(algorithm?.choices?.map((choice) => choice.value)).toStrictEqual([
    'absolute',
    'max',
    'sum',
  ]);
});
