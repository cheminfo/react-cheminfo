import { afterEach, expect, expectTypeOf, test, vi } from 'vitest';

import { CancelledRequestError, RequestTimeoutError } from '../errors.ts';
import type { WorkerEventLike, WorkerLike } from '../messages.ts';
import { createWorkerChannel } from '../workerChannel.ts';

interface Job {
  smiles: string;
}

// The sites hand the channel a real `Worker`, which must keep satisfying it.
expectTypeOf<Worker>().toExtend<WorkerLike>();

afterEach(() => {
  vi.useRealTimers();
});

test('a request is posted with an identifier and resolves on the matching answer', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker);

  const answer = channel.request({ smiles: 'CCO' });

  expect(worker.sent).toStrictEqual([{ id: 1, request: { smiles: 'CCO' } }]);
  expect(channel.pendingCount).toBe(1);

  worker.reply(1, 'ethanol');

  await expect(answer).resolves.toBe('ethanol');
  expect(channel.pendingCount).toBe(0);
});

test('two requests in flight are matched to their own answers, in any order', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker);

  const first = channel.request({ smiles: 'CCO' });
  const second = channel.request({ smiles: 'CCC' });

  expect(channel.pendingCount).toBe(2);

  worker.reply(2, 'propane');
  worker.reply(1, 'ethanol');

  await expect(second).resolves.toBe('propane');
  await expect(first).resolves.toBe('ethanol');
  expect(channel.pendingCount).toBe(0);
});

test('an answer nobody waits for, and a message that is not the protocol, are ignored', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker);

  const answer = channel.request({ smiles: 'CCO' });
  worker.reply(99, 'nobody asked');
  worker.emit('message', { data: { progress: 0.5 } });
  worker.emit('message', { data: 'not an object' });

  expect(channel.pendingCount).toBe(1);

  worker.reply(1, 'ethanol');

  await expect(answer).resolves.toBe('ethanol');
});

test('a failed answer rejects with the message the worker sent and drops the entry', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker);

  const answer = channel.request({ smiles: 'CCO' });
  worker.fail(1, 'the structure could not be parsed');

  await expect(answer).rejects.toThrow('the structure could not be parsed');
  expect(channel.pendingCount).toBe(0);
});

test('a request that outlives its budget rejects, and a late answer changes nothing', async () => {
  vi.useFakeTimers();
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker, {
    name: 'conformers',
  });

  const answer = channel.request({ smiles: 'CCO' });
  vi.advanceTimersByTime(119_999);

  expect(channel.pendingCount).toBe(1);

  vi.advanceTimersByTime(1);

  await expect(answer).rejects.toBeInstanceOf(RequestTimeoutError);
  await expect(answer).rejects.toThrow(
    'conformers request 1 timed out after 120000 ms',
  );
  expect(channel.pendingCount).toBe(0);

  expect(() => {
    worker.reply(1, 'ethanol');
  }).not.toThrow();
  expect(channel.pendingCount).toBe(0);
});

test('a per-call budget overrides the channel default', async () => {
  vi.useFakeTimers();
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker, {
    defaultTimeoutMs: 60_000,
  });

  const answer = channel.request({ smiles: 'CCO' }, { timeoutMs: 5000 });
  vi.advanceTimersByTime(5000);

  await expect(answer).rejects.toThrow(
    'worker request 1 timed out after 5000 ms',
  );
});

test('a budget that is not a positive number falls back to the default', async () => {
  vi.useFakeTimers();
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker, {
    defaultTimeoutMs: 5000,
  });

  const answer = channel.request({ smiles: 'CCO' }, { timeoutMs: Number.NaN });
  vi.advanceTimersByTime(4999);

  expect(channel.pendingCount).toBe(1);

  vi.advanceTimersByTime(1);

  await expect(answer).rejects.toThrow(
    'worker request 1 timed out after 5000 ms',
  );
});

test('an aborted signal rejects the call and drops the entry', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker);
  const controller = new AbortController();

  const answer = channel.request(
    { smiles: 'CCO' },
    { signal: controller.signal },
  );
  controller.abort();

  await expect(answer).rejects.toBeInstanceOf(CancelledRequestError);
  await expect(answer).rejects.toThrow('worker request 1 was cancelled');
  expect(channel.pendingCount).toBe(0);
});

test('a signal that is already aborted posts nothing at all', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker);

  await expect(
    channel.request({ smiles: 'CCO' }, { signal: AbortSignal.abort() }),
  ).rejects.toBeInstanceOf(CancelledRequestError);
  expect(worker.sent).toStrictEqual([]);
  expect(channel.pendingCount).toBe(0);
});

test('a worker that fails outright rejects everything waiting', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker, {
    name: 'geometry',
  });

  const first = channel.request({ smiles: 'CCO' });
  const second = channel.request({ smiles: 'CCC' });
  worker.emit('error', { message: 'importScripts failed' });

  await expect(first).rejects.toThrow('geometry failed: importScripts failed');
  await expect(second).rejects.toThrow('geometry failed: importScripts failed');
  expect(channel.pendingCount).toBe(0);
});

test('terminate stops the worker, rejects what is waiting and refuses more', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker);

  const answer = channel.request({ smiles: 'CCO' });
  channel.terminate();

  await expect(answer).rejects.toBeInstanceOf(CancelledRequestError);
  expect(worker.terminated).toBe(true);
  expect(channel.pendingCount).toBe(0);

  await expect(channel.request({ smiles: 'CCC' })).rejects.toThrow(
    'worker was terminated',
  );
  expect(worker.sent).toHaveLength(1);
});

test('a payload the worker refuses rejects that call alone', async () => {
  const worker = new FakeWorker();
  worker.refusePostMessage = true;
  const channel = createWorkerChannel<Job, string>(worker);

  await expect(channel.request({ smiles: 'CCO' })).rejects.toThrow(
    'could not be cloned',
  );
  expect(channel.pendingCount).toBe(0);
});

class FakeWorker implements WorkerLike {
  public readonly sent: unknown[] = [];
  public terminated = false;
  public refusePostMessage = false;
  readonly #listeners = new Map<
    string,
    Array<(event: WorkerEventLike) => void>
  >();

  public postMessage(message: unknown): void {
    if (this.refusePostMessage) throw new Error('the job could not be cloned');
    this.sent.push(message);
  }

  public addEventListener(
    type: 'message' | 'error',
    listener: (event: WorkerEventLike) => void,
  ): void {
    const listeners = this.#listeners.get(type) ?? [];
    listeners.push(listener);
    this.#listeners.set(type, listeners);
  }

  public terminate(): void {
    this.terminated = true;
  }

  public emit(type: 'message' | 'error', event: WorkerEventLike): void {
    for (const listener of this.#listeners.get(type) ?? []) listener(event);
  }

  public reply(id: number, response: unknown): void {
    this.emit('message', { data: { id, ok: true, response } });
  }

  public fail(id: number, message: string): void {
    this.emit('message', { data: { id, ok: false, message } });
  }
}
