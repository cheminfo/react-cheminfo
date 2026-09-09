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

test('a matrix step the processor does not know is an error naming the three it does', () => {
  const found = errors({
    ...EMPTY_SETTINGS,
    postProcessing: { filters: [{ name: 'matrixZRecale' }] },
  });

  expect(found).toStrictEqual([
    {
      severity: 'error',
      where: 'Matrix step 1',
      message:
        'The matrix stage only knows pqn, centerMean, rescale; it throws on anything else.',
    },
  ]);
});

test('a scaling the processor does not know is an error', () => {
  expect(
    messages({
      ...EMPTY_SETTINGS,
      postProcessing: { scale: { method: 'median' } },
    }),
  ).toStrictEqual([
    'Unknown scaling: median. It throws on anything but min, max, minmax, integration.',
  ]);
});

test('minMax passes, because the processor lower-cases before it matches', () => {
  expect(
    settingsProblems({
      ...EMPTY_SETTINGS,
      postProcessing: { scale: { method: 'minMax' } },
    }),
  ).toStrictEqual([]);
});

test('a range with no name is skipped by the processor, so it is an error here', () => {
  expect(
    messages({
      ...EMPTY_SETTINGS,
      postProcessing: { ranges: [{ from: 1, to: 2 }] },
    }),
  ).toStrictEqual(['A range with no name is silently skipped.']);
});

test('a range name that cannot be a variable is an error, because the calculations read it as one', () => {
  expect(
    messages({
      ...EMPTY_SETTINGS,
      postProcessing: { ranges: [{ from: 1, to: 2, label: 'C=O stretch' }] },
    }),
  ).toStrictEqual([
    'C=O stretch cannot be the name of a variable, and the calculations read it as one.',
  ]);
});

test('a calculation naming a range that does not exist is an error', () => {
  expect(
    messages({
      ...EMPTY_SETTINGS,
      postProcessing: {
        ranges: [{ from: 1, to: 2, label: 'amide' }],
        calculations: [{ label: 'ratio', formula: 'amide / carbonyl' }],
      },
    }),
  ).toStrictEqual([
    'carbonyl is not the name of a range, so the formula would throw.',
  ]);
});

test('a calculation over the ranges it does have raises nothing', () => {
  expect(
    settingsProblems({
      ...EMPTY_SETTINGS,
      postProcessing: {
        ranges: [
          { from: 1, to: 2, label: 'amide' },
          { from: 3, to: 4, label: 'carbonyl' },
        ],
        calculations: [
          { label: 'ratio', formula: 'amide / (amide + carbonyl)' },
        ],
      },
    }),
  ).toStrictEqual([]);
});

test('one name given to two ranges is an error, because the second silently wins', () => {
  expect(
    errors({
      ...EMPTY_SETTINGS,
      postProcessing: {
        ranges: [
          { from: 1, to: 2, label: 'amide' },
          { from: 3, to: 4, label: 'amide' },
        ],
      },
    }),
  ).toStrictEqual([
    {
      severity: 'error',
      where: 'Range 2',
      message: 'amide names two ranges; the second wins.',
    },
  ]);
});

test('a relative scaling with no target is a warning, because the reference is whichever spectrum the processor holds first', () => {
  expect(
    settingsProblems({
      ...EMPTY_SETTINGS,
      postProcessing: { scale: { relative: true } },
    }),
  ).toStrictEqual([
    {
      severity: 'warning',
      where: 'Scaling',
      message:
        'The difference is taken against the first spectrum the processor holds, which is not necessarily one of those selected.',
    },
  ]);
});

test('a calculation with an empty formula is an error, because there is nothing to report', () => {
  expect(
    messages({
      ...EMPTY_SETTINGS,
      postProcessing: {
        ranges: [{ from: 1, to: 2, label: 'amide' }],
        calculations: [{ label: 'ratio', formula: ' '.repeat(3) }],
      },
    }),
  ).toStrictEqual(['The formula is empty.']);
});

test('a calculation leaving a bracket open is an error, because it would not compile', () => {
  expect(
    messages({
      ...EMPTY_SETTINGS,
      postProcessing: {
        ranges: [{ from: 1, to: 2, label: 'amide' }],
        calculations: [{ label: 'ratio', formula: 'amide / (amide + 1' }],
      },
    }),
  ).toStrictEqual(['A bracket is left open.']);
});

test('a calculation closing a bracket it never opened is an error, and says which way round it is', () => {
  expect(
    messages({
      ...EMPTY_SETTINGS,
      postProcessing: {
        ranges: [{ from: 1, to: 2, label: 'amide' }],
        calculations: [{ label: 'ratio', formula: 'amide) + 1' }],
      },
    }),
  ).toStrictEqual(['A closing bracket has nothing to close.']);
});

test('a number written in scientific notation raises nothing, because its exponent is not a range name', () => {
  expect(
    settingsProblems({
      ...EMPTY_SETTINGS,
      postProcessing: {
        ranges: [{ from: 1, to: 2, label: 'amide' }],
        calculations: [{ label: 'permille', formula: 'amide / 1e3' }],
      },
    }),
  ).toStrictEqual([]);
});

test('a calculation reaching into Math raises nothing, because Math is the one name that is not a range', () => {
  expect(
    settingsProblems({
      ...EMPTY_SETTINGS,
      postProcessing: {
        ranges: [{ from: 1, to: 2, label: 'amide' }],
        calculations: [{ label: 'logged', formula: 'Math.log(amide)' }],
      },
    }),
  ).toStrictEqual([]);
});
