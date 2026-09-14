import { expect, test } from 'vitest';

import type { SettingsProblem } from '../../core/problems.ts';
import { problemsAbout } from '../problemsAbout.ts';

const PROBLEMS: readonly SettingsProblem[] = [
  {
    severity: 'error',
    part: 'range',
    index: 0,
    where: 'Range 1',
    message: 'From is not below to.',
  },
  {
    severity: 'warning',
    part: 'scaling',
    where: 'Scaling',
    message: 'The difference is taken against the first spectrum.',
  },
  {
    severity: 'error',
    part: 'range',
    index: 1,
    where: 'Band two',
    message: 'amide names two ranges; the second wins.',
  },
];

test('a part gets exactly its own problems, in the order they were found', () => {
  expect(problemsAbout(PROBLEMS, 'range')).toStrictEqual([
    PROBLEMS[0],
    PROBLEMS[2],
  ]);
  expect(problemsAbout(PROBLEMS, 'scaling')).toStrictEqual([PROBLEMS[1]]);
});

test('a problem is routed by its part and never by its label, so a reworded label cannot move it to another panel', () => {
  const memory: SettingsProblem = {
    severity: 'error',
    part: 'memory',
    where: 'Resampling',
    message: 'The budget must be a number above zero.',
  };

  expect(problemsAbout([memory], 'resampling')).toStrictEqual([]);
  expect(problemsAbout([memory], 'memory')).toStrictEqual([memory]);
});

test('a part nothing is wrong with gets an empty list', () => {
  expect(problemsAbout(PROBLEMS, 'calculation')).toStrictEqual([]);
});
