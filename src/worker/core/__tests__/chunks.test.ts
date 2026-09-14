import { expect, test } from 'vitest';

import { runInChunks, yieldToBrowser } from '../chunks.ts';

async function* records() {
  yield 'aspirin';
  yield 'caffeine';
  yield 'ethanol';
}

test('every item is worked through in order, with its index, and the count comes back', async () => {
  const seen: string[] = [];
  const progress: string[] = [];

  const count = await runInChunks(
    ['C', 'CC', 'CCC'],
    (smiles, index) => {
      seen.push(`${index}:${smiles}`);
    },
    { onProgress: (done, total) => progress.push(`${done}/${total}`) },
  );

  expect(count).toBe(3);
  expect(seen).toStrictEqual(['0:C', '1:CC', '2:CCC']);
  expect(progress.at(-1)).toBe('3/3');
});

test('between two chunks the browser gets a real turn, and hears how far the run is', async () => {
  const events: string[] = [];
  setTimeout(() => events.push('timer'), 0);

  await runInChunks(
    ['a', 'b', 'c', 'd', 'e'],
    (item) => {
      events.push(`item ${item}`);
    },
    {
      sliceMs: 0,
      chunkSize: 2,
      onProgress: (done, total) => events.push(`progress ${done}/${total}`),
    },
  );

  expect(events).toStrictEqual([
    'item a',
    'item b',
    'progress 2/5',
    'timer',
    'item c',
    'item d',
    'progress 4/5',
    'item e',
    'progress 5/5',
  ]);
});

test('async work is awaited, an async iterable is read, and an estimated total is raised', async () => {
  const names: string[] = [];
  const progress: string[] = [];

  const count = await runInChunks(
    records(),
    async (name) => {
      await Promise.resolve();
      names.push(name.toUpperCase());
    },
    {
      sliceMs: 0,
      total: 2,
      onProgress: (done, total) => progress.push(`${done}/${total}`),
    },
  );

  expect(count).toBe(3);
  expect(names).toStrictEqual(['ASPIRIN', 'CAFFEINE', 'ETHANOL']);
  expect(progress).toStrictEqual(['1/2', '2/2', '3/3', '3/3']);
});

test('a synchronous list with synchronous work runs without a microtask until its first turn', async () => {
  const order: string[] = [];
  void Promise.resolve().then(() => order.push('microtask'));

  const run = runInChunks(
    new Set(['C', 'CC', 'CCC']),
    (smiles) => {
      order.push(smiles);
    },
    { sliceMs: 60_000 },
  );
  order.push('returned');

  await expect(run).resolves.toBe(3);
  expect(order).toStrictEqual(['C', 'CC', 'CCC', 'returned', 'microtask']);
});

test('an aborted signal stops the run before the next item', async () => {
  const controller = new AbortController();
  const seen: string[] = [];

  const run = runInChunks(
    ['C', 'CC', 'CCC', 'CCCC'],
    (smiles) => {
      seen.push(smiles);
      if (smiles === 'CC') {
        controller.abort(new Error('the user pressed Cancel'));
      }
    },
    { signal: controller.signal },
  );

  await expect(run).rejects.toThrow('the user pressed Cancel');
  expect(seen).toStrictEqual(['C', 'CC']);
  await expect(
    runInChunks(['C'], () => undefined, { signal: controller.signal }),
  ).rejects.toThrow('the user pressed Cancel');
});

test('a yield waits for a macrotask, after the microtasks already queued', async () => {
  const order: string[] = [];

  const yielded = yieldToBrowser().then(() => order.push('yielded'));
  void Promise.resolve().then(() => order.push('microtask'));
  await yielded;

  expect(order).toStrictEqual(['microtask', 'yielded']);
});
