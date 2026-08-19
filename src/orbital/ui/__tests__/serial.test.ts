import { expect, test } from 'vitest';

import { createSerialRunner } from '../serial.ts';

/** Stands in until the promise hands the real one over. */
function noop(): void {
  // Replaced synchronously by the promise executor below.
}

/**
 * A task that records when it starts and ends, and finishes when told to.
 * @param log - Where to write the marks.
 * @param name - What to write them under.
 * @returns The task and the handle that lets it finish.
 */
function pendingTask(
  log: string[],
  name: string,
): { task: () => Promise<string>; finish: () => void } {
  let release: () => void = noop;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  return {
    task: async () => {
      log.push(`${name}:start`);
      await blocked;
      log.push(`${name}:end`);
      return name;
    },
    finish: release,
  };
}

test('a task waits for the one queued before it', async () => {
  const log: string[] = [];
  const runner = createSerialRunner();
  const first = pendingTask(log, 'first');
  const second = pendingTask(log, 'second');

  const running = Promise.all([
    runner.run(first.task),
    runner.run(second.task),
  ]);
  await Promise.resolve();

  // The second has not begun, which is the whole point: it would otherwise
  // clear the canvas while the first was still building for it.
  expect(log).toStrictEqual(['first:start']);

  first.finish();
  second.finish();

  await expect(running).resolves.toStrictEqual(['first', 'second']);
  expect(log).toStrictEqual([
    'first:start',
    'first:end',
    'second:start',
    'second:end',
  ]);
});

test('a task that throws reaches its own caller and holds nobody up', async () => {
  const log: string[] = [];
  const runner = createSerialRunner();

  const failed = runner.run(async () => {
    log.push('failing');
    throw new Error('render failed');
  });
  const after = runner.run(async () => {
    log.push('after');
    return 'after';
  });

  await expect(failed).rejects.toThrow('render failed');
  await expect(after).resolves.toBe('after');
  expect(log).toStrictEqual(['failing', 'after']);
});

test('the order queued is the order run, however many are waiting', async () => {
  const order: number[] = [];
  const runner = createSerialRunner();

  await Promise.all(
    [0, 1, 2, 3, 4].map((index) =>
      runner.run(async () => {
        await Promise.resolve();
        order.push(index);
      }),
    ),
  );

  expect(order).toStrictEqual([0, 1, 2, 3, 4]);
});
