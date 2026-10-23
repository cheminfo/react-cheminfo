import { expect, test } from 'vitest';

import type { ExerciseProgress, ProgressRecords } from '../progress.ts';
import type { ControlledProgress } from '../progressController.ts';
import { createProgressController } from '../progressController.ts';

test('an untouched exercise reads as the blank record', () => {
  const progress = { value: {} as ProgressRecords<ExerciseProgress> };
  const controller = createProgressController(progress);

  expect(controller.getExerciseProgress('mf-dmso')).toStrictEqual({
    status: 'idle',
    answer: '',
    hintsRevealed: 0,
    showSolution: false,
  });
});

test('every action replaces the records, so a signal tells its readers', () => {
  const progress = { value: {} as ProgressRecords<ExerciseProgress> };
  const controller = createProgressController(progress);
  const before = progress.value;
  controller.setExerciseStatus('a', 'attempted');
  controller.updateProgress('a', { answer: 'C2H6O' });
  controller.setShowSolution('a', true);

  expect(progress.value).not.toBe(before);
  expect(progress.value).toStrictEqual({
    a: {
      status: 'attempted',
      answer: 'C2H6O',
      hintsRevealed: 0,
      showSolution: true,
    },
  });
});

test('hints open one at a time and stop at the last', () => {
  const progress = { value: {} as ProgressRecords<ExerciseProgress> };
  const controller = createProgressController(progress);
  controller.revealNextHint('a', 2);
  controller.revealNextHint('a', 2);
  controller.revealNextHint('a', 2);
  controller.revealNextHint('b');
  controller.revealNextHint('b');
  controller.revealNextHint('b');

  expect(controller.getExerciseProgress('a').hintsRevealed).toBe(2);
  expect(controller.getExerciseProgress('b').hintsRevealed).toBe(3);
});

test('resetting forgets one exercise, clearing forgets them all', () => {
  const progress = { value: {} as ProgressRecords<ExerciseProgress> };
  const controller = createProgressController(progress);
  controller.setExerciseStatus('a', 'solved');
  controller.setExerciseStatus('b', 'solved');
  controller.resetExercise('a');

  expect(Object.keys(progress.value)).toStrictEqual(['b']);

  controller.clearAllProgress();

  expect(progress.value).toStrictEqual({});
});

test('a site whose records carry no answer gives its own blank record', () => {
  const progress = { value: {} as ProgressRecords<ControlledProgress> };
  const controller = createProgressController(progress, {
    empty: () => ({ status: 'idle', hintsRevealed: 0, showSolution: false }),
  });
  controller.setExerciseStatus('orbital-1', 'solved');

  expect(progress.value).toStrictEqual({
    'orbital-1': { status: 'solved', hintsRevealed: 0, showSolution: false },
  });
});
