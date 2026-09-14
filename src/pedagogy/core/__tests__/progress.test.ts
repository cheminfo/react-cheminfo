import { expect, test } from 'vitest';

import type { ExerciseProgress } from '../progress.ts';
import {
  emptyProgress,
  mergeExerciseProgress,
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

test('a stored exercise is read over a blank record, wrong shapes dropped and extra fields kept', () => {
  expect(
    mergeExerciseProgress({
      status: 'solved',
      answer: 42,
      showSolution: true,
      seed: 7,
    }),
  ).toStrictEqual({
    status: 'solved',
    answer: '',
    hintsRevealed: 0,
    showSolution: true,
    seed: 7,
  });
  expect(mergeExerciseProgress('not a record')).toStrictEqual(emptyProgress());
});

test('a status outside the three the page knows reads as idle', () => {
  expect(mergeExerciseProgress({ status: 'brilliant' })).toStrictEqual(
    emptyProgress(),
  );
  expect(mergeExerciseProgress({ status: 'attempted' }).status).toBe(
    'attempted',
  );
});

test('a negative or fractional hint count reads as the whole hints it names', () => {
  expect(mergeExerciseProgress({ hintsRevealed: -3 }).hintsRevealed).toBe(0);
  expect(mergeExerciseProgress({ hintsRevealed: 0.5 }).hintsRevealed).toBe(0);
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
