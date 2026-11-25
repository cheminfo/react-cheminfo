import { afterEach, expect, test, vi } from 'vitest';

import type { LatestRunContext } from '../latestRuns.ts';
import { createLatestRuns } from '../latestRuns.ts';

afterEach(() => {
  vi.useRealTimers();
});

/**
 * A task the test settles by hand, and what it was handed.
 * @returns The task, the contexts it was handed and how to settle each run.
 */
function manualTask() {
  const handed: LatestRunContext[] = [];
  const settle: Array<{
    answer: (value: string) => void;
    fail: (error: Error) => void;
  }> = [];
  const task = (context: LatestRunContext) => {
    handed.push(context);
    return new Promise<string>((answer, fail) => {
      settle.push({ answer, fail });
      context.signal.addEventListener('abort', () =>
        fail(new Error('aborted')),
      );
    });
  };
  return { task, handed, settle };
}

test('a newer key aborts the run on its way, whose late answer is never told', async () => {
  const runs = createLatestRuns();
  const told: string[] = [];
  const { task, handed, settle } = manualTask();
  const onAnswer = (answer: string) => told.push(answer);
  const first = runs.ask('pane', 'plane 1', task, { onAnswer });
  const second = runs.ask('pane', 'plane 2', task, { onAnswer });
  settle[1]?.answer('picture 2');
  await Promise.all([first, second]);

  expect([
    told,
    handed[0]?.signal.aborted,
    handed[0]?.current(),
    handed[1]?.current(),
    runs.keyOf('pane'),
    runs.pending('pane'),
  ]).toStrictEqual([['picture 2'], true, false, true, 'plane 2', false]);
});

test('the key asked last changes nothing; a dropped slot forgets it and a failure is told unless aborted', async () => {
  const runs = createLatestRuns();
  const failures: string[] = [];
  const { task, settle } = manualTask();
  const options = {
    onAnswer: () => undefined,
    onFailure: (error: unknown) =>
      failures.push(error instanceof Error ? error.message : 'what?'),
  };
  const first = runs.ask('table', 's3', task, options);
  const again = runs.ask('table', 's3', task, options);
  const sameRun = first === again;
  settle[0]?.fail(new Error('the engine stopped'));
  await first;
  const dropped = runs.ask('count', 'all planes', task, options);
  runs.drop('count');
  await dropped;

  expect([sameRun, settle.length, failures, runs.slots()]).toStrictEqual([
    true,
    2,
    ['the engine stopped'],
    ['table'],
  ]);
});

test('a delayed ask starts once it stayed the latest, and a newer one before then starts none', async () => {
  vi.useFakeTimers();
  const runs = createLatestRuns();
  const started: string[] = [];
  const task = (key: string) => () => {
    started.push(key);
    return Promise.resolve(key);
  };
  const told: string[] = [];
  const onAnswer = (answer: string) => told.push(answer);
  const given = runs.ask('table', 'σ 1', task('σ 1'), {
    delayMs: 80,
    onAnswer,
  });
  vi.advanceTimersByTime(50);
  const kept = runs.ask('table', 'σ 2', task('σ 2'), { delayMs: 80, onAnswer });
  await given;
  vi.advanceTimersByTime(79);
  const waiting = [...started];
  const resting = runs.waiting('table');
  vi.advanceTimersByTime(1);
  const started80 = runs.waiting('table');
  await kept;

  expect([waiting, resting, started80, started, told]).toStrictEqual([
    [],
    true,
    false,
    ['σ 2'],
    ['σ 2'],
  ]);
});

test('a run started again replaces the one on its way, its own answer told; the slot then keeps no key', async () => {
  const runs = createLatestRuns();
  const told: string[] = [];
  const { task, handed, settle } = manualTask();
  const onAnswer = (answer: string) => told.push(answer);
  const first = runs.replace('opening', task, { onAnswer });
  const second = runs.replace('opening', task, { onAnswer });
  settle[1]?.answer('islets');
  await Promise.all([first, second]);
  const keyless = runs.keyOf('opening');
  const asked = runs.ask('opening', 'islets', task, { onAnswer });
  settle[2]?.answer('islets again');
  await asked;

  expect([
    told,
    handed[0]?.signal.aborted,
    handed.length,
    keyless,
  ]).toStrictEqual([['islets', 'islets again'], true, 3, undefined]);
});
