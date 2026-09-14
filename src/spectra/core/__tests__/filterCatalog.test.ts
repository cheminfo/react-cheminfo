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
  expect(FILTER_NAMES).toHaveLength(27);
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
    'setMinY',
    'setMaxY',
    'xFunction',
    'setMinX',
    'setMaxX',
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

test('each of the four shifts asks for the one value it moves an end to, and warns that empty is not "leave it"', () => {
  expect(filterNamesInGroup('x-axis').slice(0, 3)).toStrictEqual([
    'xFunction',
    'setMinX',
    'setMaxX',
  ]);
  expect(filterNamesInGroup('y-axis')).toStrictEqual([
    'yFunction',
    'setMinY',
    'setMaxY',
  ]);
  expect(filterEntry('setMinX').fields.map((field) => field.key)).toStrictEqual(
    ['min'],
  );
  expect(filterEntry('setMaxY').fields.map((field) => field.key)).toStrictEqual(
    ['max'],
  );
  expect(filterEntry('setMaxX').caution).toBe(
    'Left empty, the largest x is moved to 1, not left where it is.',
  );
  expect(filterEntry('setMinY').caution).toBe(
    'Left empty, the smallest y is moved to 0, not left where it is.',
  );
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
