import { expect, test } from 'vitest';

import type { ExerciseProgress } from '../progress.ts';
import {
  emptyProgress,
  mergeExerciseProgress,
  mergeProgressRecord,
  progressSummary,
} from '../progress.ts';

test('an untouched exercise starts idle, blank and hintless', () => {
  expect(emptyProgress()).toStrictEqual({
    status: 'idle',
    answer: '',
    hintsRevealed: 0,
    showSolution: false,
  });
});

test('a record written as it stands is read back unchanged', () => {
  expect(
    mergeProgressRecord(
      {
        status: 'solved',
        answer: 'x^2',
        hintsRevealed: 2,
        showSolution: true,
      },
      emptyProgress(),
    ),
  ).toStrictEqual({
    status: 'solved',
    answer: 'x^2',
    hintsRevealed: 2,
    showSolution: true,
  });
});

test('a field written by an older version lands on its default', () => {
  expect(mergeProgressRecord({ answer: 'x' }, emptyProgress())).toStrictEqual({
    status: 'idle',
    answer: 'x',
    hintsRevealed: 0,
    showSolution: false,
  });
});

test('a field of the wrong shape falls back on its own', () => {
  expect(
    mergeProgressRecord(
      { answer: 42, hintsRevealed: '2', showSolution: 'yes' },
      emptyProgress(),
    ),
  ).toStrictEqual({
    status: 'idle',
    answer: '',
    hintsRevealed: 0,
    showSolution: false,
  });
});

test('a field the record never declared is not carried over', () => {
  expect(
    mergeProgressRecord({ answer: 'x', drawings: {} }, emptyProgress()),
  ).toStrictEqual({ ...emptyProgress(), answer: 'x' });
});

test('an array default only accepts an array', () => {
  const defaults = { found: [] as string[], gaveUp: false };

  expect(mergeProgressRecord({ found: ['CCO'] }, defaults)).toStrictEqual({
    found: ['CCO'],
    gaveUp: false,
  });
  expect(mergeProgressRecord({ found: 'CCO' }, defaults)).toStrictEqual({
    found: [],
    gaveUp: false,
  });
});

test('a null default accepts whatever was stored', () => {
  expect(
    mergeProgressRecord({ verdict: 'wrong' }, { verdict: null }),
  ).toStrictEqual({ verdict: 'wrong' });
});

test('an unreadable record gives the defaults untouched', () => {
  expect(mergeProgressRecord(null, emptyProgress())).toStrictEqual(
    emptyProgress(),
  );
  expect(mergeProgressRecord('[]', emptyProgress())).toStrictEqual(
    emptyProgress(),
  );
  expect(mergeProgressRecord([1, 2], emptyProgress())).toStrictEqual(
    emptyProgress(),
  );
});

test('a status outside the three the page knows reads as idle', () => {
  expect(mergeExerciseProgress({ status: 'brilliant' })).toStrictEqual(
    emptyProgress(),
  );
  expect(mergeExerciseProgress({ status: 'attempted' }).status).toBe(
    'attempted',
  );
});

test('a negative or fractional hint count reads as none revealed', () => {
  expect(mergeExerciseProgress({ hintsRevealed: -3 }).hintsRevealed).toBe(0);
  expect(mergeExerciseProgress({ hintsRevealed: 2.7 }).hintsRevealed).toBe(2);
});

test('the summary counts the exercises of the set, not the ones touched', () => {
  const records: Record<string, ExerciseProgress> = {
    one: { ...emptyProgress(), status: 'solved' },
    two: { ...emptyProgress(), status: 'attempted' },
    three: { ...emptyProgress(), status: 'idle' },
  };

  expect(
    progressSummary(records, ['one', 'two', 'three', 'four']),
  ).toStrictEqual({ solved: 1, attempted: 1, total: 4, ratio: 0.25 });
});

test('the summary falls back on the records when no set is named', () => {
  const records: Record<string, ExerciseProgress> = {
    one: { ...emptyProgress(), status: 'solved' },
    two: { ...emptyProgress(), status: 'solved' },
  };

  expect(progressSummary(records)).toStrictEqual({
    solved: 2,
    attempted: 0,
    total: 2,
    ratio: 1,
  });
});

test('a summary of nothing is 0 rather than a division by zero', () => {
  expect(progressSummary({})).toStrictEqual({
    solved: 0,
    attempted: 0,
    total: 0,
    ratio: 0,
  });
});
