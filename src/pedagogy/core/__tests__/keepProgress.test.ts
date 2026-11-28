import { expect, test } from 'vitest';

import { keepProgress } from '../keepProgress.ts';
import type {
  ExerciseProgress,
  ProgressRecords,
  ProgressStore,
} from '../progress.ts';
import { emptyProgress, mergeExerciseProgress } from '../progress.ts';

/**
 * A store kept in memory, recording every save.
 * @param initial - What it holds at first.
 * @param answerLater - Whether it answers through a promise.
 * @returns The store, with the records it was asked to save.
 */
function memoryStore(
  initial: ProgressRecords,
  answerLater = false,
): ProgressStore & { saved: ProgressRecords[] } {
  const saved: ProgressRecords[] = [];
  return {
    name: 'memory',
    saved,
    load: () => (answerLater ? Promise.resolve(initial) : initial),
    save: (records) => {
      saved.push(records);
    },
  };
}

/**
 * An effect run once now and again on demand, standing in for signals.
 * @returns The effect, and what runs every effect again.
 */
function manualEffect() {
  const callbacks: Array<() => void> = [];
  const effect = (callback: () => void) => {
    callbacks.push(callback);
    callback();
    return stopNothing;
  };
  const flush = () => {
    for (const callback of callbacks) callback();
  };
  return { effect, flush };
}

function stopNothing(): void {
  // The stand-in keeps every effect for the whole test.
}

test('the stored records fill the signal, and a change is saved', () => {
  const store = memoryStore({
    'protecting/cbz-on/product': { ...emptyProgress(), status: 'solved' },
  });
  const signals = manualEffect();
  const records: { value: ProgressRecords<ExerciseProgress> } = { value: {} };
  const kept = keepProgress(records, {
    store,
    effect: signals.effect,
    read: mergeExerciseProgress,
  });

  expect(kept.progressOf('protecting/cbz-on/product').status).toBe('solved');
  expect(kept.progressOf('never-opened')).toStrictEqual(emptyProgress());

  kept.updateProgress('never-opened', { hintsRevealed: 2 });
  signals.flush();

  expect(kept.progressOf('never-opened')).toStrictEqual({
    ...emptyProgress(),
    hintsRevealed: 2,
  });
  expect(store.saved.at(-1)).toStrictEqual(records.value);
  expect(Object.keys(records.value)).toStrictEqual([
    'protecting/cbz-on/product',
    'never-opened',
  ]);
});

test('clearing forgets only the exercises named', () => {
  const records: { value: ProgressRecords<ExerciseProgress> } = { value: {} };
  const kept = keepProgress(records, {
    store: memoryStore({
      a: { ...emptyProgress(), status: 'solved' },
      b: { ...emptyProgress(), status: 'attempted' },
      c: { ...emptyProgress(), showSolution: true },
    }),
    effect: manualEffect().effect,
    read: mergeExerciseProgress,
  });

  kept.clearProgress(['a', 'c']);

  expect(Object.keys(records.value)).toStrictEqual(['b']);
  expect(kept.progressOf('a')).toStrictEqual(emptyProgress());
});

test('a store that answers later fills the signal once it does', async () => {
  const records: { value: ProgressRecords<ExerciseProgress> } = { value: {} };
  const kept = keepProgress(records, {
    store: memoryStore({ a: { ...emptyProgress(), status: 'solved' } }, true),
    effect: manualEffect().effect,
    read: mergeExerciseProgress,
  });

  expect(kept.progressOf('a').status).toBe('idle');

  await Promise.resolve();

  expect(kept.progressOf('a').status).toBe('solved');
});

test('a site record is read through the site’s own reader', () => {
  interface AnswerProgress extends ExerciseProgress {
    formula: string;
  }
  const records: { value: ProgressRecords<AnswerProgress> } = { value: {} };
  const kept = keepProgress(records, {
    store: {
      name: 'memory',
      load: () => ({ x: { formula: 42 } as unknown as AnswerProgress }),
      save: () => undefined,
    },
    effect: manualEffect().effect,
    read: (stored) => ({
      ...mergeExerciseProgress(stored),
      formula:
        typeof (stored as { formula?: unknown } | undefined)?.formula ===
        'string'
          ? (stored as { formula: string }).formula
          : '',
    }),
  });

  expect(kept.progressOf('x').formula).toBe('');
});
