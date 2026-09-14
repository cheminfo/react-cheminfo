import { expect, test } from 'vitest';

import type { ProgressBucket } from '../bucketProgressStore.ts';
import { bucketProgressStore } from '../bucketProgressStore.ts';
import type { ExerciseProgress } from '../progress.ts';
import { emptyProgress, mergeExerciseProgress } from '../progress.ts';

function memoryBucket<TBucket extends object>(
  initial: TBucket,
): ProgressBucket<TBucket> & { writes: TBucket[] } {
  let value = initial;
  const writes: TBucket[] = [];
  return {
    writes,
    read: () => ({ value }),
    write(next) {
      value = next;
      writes.push(next);
    },
  };
}

test('the whole bucket is the records when no field is named', () => {
  const bucket = memoryBucket<Record<string, unknown>>({
    w1: { status: 'solved', answer: 'CCO' },
    w2: 'not a record',
  });
  const store = bucketProgressStore<Record<string, unknown>, object>({
    bucket,
  });

  expect(store.name).toBe('this browser');
  expect(store.load()).toStrictEqual({
    w1: { status: 'solved', answer: 'CCO' },
  });

  void store.save({ w3: { answer: 'C' } });

  expect(bucket.writes).toStrictEqual([{ w3: { answer: 'C' } }]);
});

test('records kept under a field are read through readRecord, and saving leaves the rest', () => {
  const bucket = memoryBucket<{ theme: string; seed42?: unknown }>({
    theme: 'dark',
    seed42: {
      e1: { status: 'bogus', hintsRevealed: 2.7 },
      e2: null,
    },
  });
  const store = bucketProgressStore<
    { theme: string; seed42?: unknown },
    ExerciseProgress
  >({
    bucket,
    field: 'seed42',
    readRecord: mergeExerciseProgress,
    name: 'this course',
  });

  expect(store.name).toBe('this course');
  expect(store.load()).toStrictEqual({
    e1: { ...emptyProgress(), hintsRevealed: 2 },
  });

  const solved = { ...emptyProgress(), status: 'solved' as const };
  void store.save({ e1: solved });

  expect(bucket.writes).toStrictEqual([
    { theme: 'dark', seed42: { e1: solved } },
  ]);
});

test('a field that holds no record loads as no progress', () => {
  const store = bucketProgressStore<{ seed?: unknown }, object>({
    bucket: memoryBucket({ seed: ['e1'] }),
    field: 'seed',
  });

  expect(store.load()).toStrictEqual({});
});
