import { expect, test } from 'vitest';

import type { SettingsProblem } from '../problems.ts';
import type { SpectraSettings } from '../settings.ts';
import { EMPTY_SETTINGS } from '../settings.ts';
import { settingsProblems } from '../settingsProblems.ts';

function messages(settings: SpectraSettings): string[] {
  return settingsProblems(settings).map((found) => found.message);
}

function errors(settings: SpectraSettings): SettingsProblem[] {
  return settingsProblems(settings).filter(
    (found) => found.severity === 'error',
  );
}

test('settings that say nothing raise nothing', () => {
  expect(settingsProblems(EMPTY_SETTINGS)).toStrictEqual([]);
});

test('a grid running backwards is an error, because the resampling throws on it', () => {
  const found = errors({
    ...EMPTY_SETTINGS,
    processor: { normalization: { from: 4000, to: 400 } },
  });

  expect(found).toStrictEqual([
    {
      severity: 'error',
      where: 'Resampling',
      message: 'From is not below to.',
    },
  ]);
});

test('a grid of one point is an error', () => {
  expect(
    messages({
      ...EMPTY_SETTINGS,
      processor: { normalization: { numberOfPoints: 1 } },
    }),
  ).toStrictEqual(['A grid needs at least two points.']);
});

test('an excluded zone hidden from the chart is still dropped from the data, and says so', () => {
  const found = settingsProblems({
    ...EMPTY_SETTINGS,
    processor: {
      normalization: { exclusions: [{ from: 1, to: 2, ignore: true }] },
    },
  });

  expect(found).toStrictEqual([
    {
      severity: 'warning',
      where: 'Excluded zone 1',
      message:
        'Hidden only from the chart: the zone is still dropped from the data.',
    },
  ]);
});

test('a Savitzky-Golay window that is even, or too short, is an error', () => {
  const even = messages({
    ...EMPTY_SETTINGS,
    processor: {
      normalization: {
        filters: [{ name: 'savitzkyGolay', options: { windowSize: 8 } }],
      },
    },
  });

  expect(even).toStrictEqual([
    'The window must be an odd whole number of 5 or more.',
  ]);
});

test('a polynomial that reaches the window size is an error', () => {
  expect(
    messages({
      ...EMPTY_SETTINGS,
      processor: {
        normalization: {
          filters: [
            {
              name: 'savitzkyGolay',
              options: { windowSize: 5, polynomial: 5 },
            },
          ],
        },
      },
    }),
  ).toStrictEqual(['The polynomial degree must stay below the window size.']);
});

test('an expression that never reads its variable is an error', () => {
  expect(
    messages({
      ...EMPTY_SETTINGS,
      processor: {
        normalization: {
          filters: [{ name: 'yFunction', options: { function: '2 + 2' } }],
        },
      },
    }),
  ).toStrictEqual([
    'The expression never reads y, so every point would get the same value.',
  ]);
});

test('scaling measured before a baseline is levelled is called out', () => {
  const found = settingsProblems({
    ...EMPTY_SETTINGS,
    processor: {
      normalization: {
        filters: [{ name: 'rescale' }, { name: 'airPLSBaseline' }],
      },
    },
  });

  expect(found).toStrictEqual([
    {
      severity: 'warning',
      where: 'Step 2 — airPLS baseline',
      message:
        'Step 1 scales the signal before this levels it, so the scaling is measured against an offset that then changes. Level first.',
    },
  ]);
});

test('a crop after the resampling makes the processor throw, and is an error', () => {
  const found = errors({
    ...EMPTY_SETTINGS,
    processor: {
      normalization: {
        applyRangeSelectionFirst: true,
        filters: [{ name: 'fromTo', options: { from: 1, to: 2 } }],
      },
    },
  });

  expect(found).toHaveLength(1);
  expect(found.at(0)?.message).toContain(
    'resampling or cropping has already turned it into a plain one, so the processor throws',
  );
});

test('autoscaling — centre then divide — raises nothing, because it is the point', () => {
  expect(
    settingsProblems({
      ...EMPTY_SETTINGS,
      processor: {
        normalization: {
          filters: [{ name: 'centerMean' }, { name: 'divideBySD' }],
        },
      },
    }),
  ).toStrictEqual([]);
});

test('a memory budget of zero is an error, because the processor keeps no original data at all', () => {
  expect(
    settingsProblems({ ...EMPTY_SETTINGS, processor: { maxMemory: 0 } }),
  ).toStrictEqual([
    {
      severity: 'error',
      where: 'Memory',
      message: 'The budget must be a number above zero.',
    },
  ]);
});

test('an excluded zone running backwards is an error, and names the zone it is about', () => {
  expect(
    errors({
      ...EMPTY_SETTINGS,
      processor: { normalization: { exclusions: [{ from: 2, to: 1 }] } },
    }),
  ).toStrictEqual([
    {
      severity: 'error',
      where: 'Excluded zone 1',
      message: 'From is not below to.',
    },
  ]);
});
