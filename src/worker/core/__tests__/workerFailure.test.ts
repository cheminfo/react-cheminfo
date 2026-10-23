import { afterEach, expect, test, vi } from 'vitest';

import { CancelledRequestError, RequestTimeoutError } from '../errors.ts';
import { createWorkerChannel } from '../workerChannel.ts';
import type { WorkerFailure } from '../workerChannelTypes.ts';

import { FakeWorker, recordingFactory } from './fakeWorker.ts';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** A page that has workers, though no test here lets one start. */
function StandInWorker(): void {
  // Never constructed: each factory here throws before it would be.
}

class SiteError extends Error {
  override name = 'SiteError';
  constructor(
    readonly key: string,
    message: string,
  ) {
    super(message);
  }
}

test('a failed answer is worded by the channel, its detail in hand', async () => {
  const worker = new FakeWorker();
  const seen: WorkerFailure[] = [];
  const channel = createWorkerChannel<string, string>(worker, {
    name: 'conformers',
    failure: (failure) => {
      seen.push(failure);
      const { detail, message } = failure;
      return typeof detail === 'string'
        ? new SiteError(detail, message)
        : undefined;
    },
  });

  const translated = channel.request('C1CC');
  const plain = channel.request('CC(');
  worker.emit('message', {
    data: {
      id: 1,
      ok: false,
      message: 'ring not closed',
      detail: 'error.ring',
    },
  });
  worker.fail(2, 'unbalanced bracket');

  await expect(translated).rejects.toStrictEqual(
    new SiteError('error.ring', 'ring not closed'),
  );
  await expect(plain).rejects.toThrow('unbalanced bracket');
  expect(seen).toStrictEqual([
    {
      kind: 'job',
      name: 'conformers',
      message: 'ring not closed',
      detail: 'error.ring',
      cause: {
        id: 1,
        ok: false,
        message: 'ring not closed',
        detail: 'error.ring',
      },
    },
    {
      kind: 'job',
      name: 'conformers',
      message: 'unbalanced bracket',
      detail: undefined,
      cause: { id: 2, ok: false, message: 'unbalanced bracket' },
    },
  ]);
});

test('a worker that never ran is told apart from one that failed', async () => {
  const created: FakeWorker[] = [];
  const kinds: string[] = [];
  const channel = createWorkerChannel<string, string>(
    recordingFactory(created),
    {
      name: 'geometry',
      failure: (failure) => {
        kinds.push(`${failure.kind}:${failure.message}`);
        return failure.kind === 'worker' && failure.message === ''
          ? new Error('the geometry worker could not start')
          : undefined;
      },
    },
  );

  const first = channel.request('CCO');
  created[0]?.emit('error', {});
  const second = channel.request('CCN');
  created[1]?.emit('error', { message: 'out of memory' });

  await expect(first).rejects.toThrow('the geometry worker could not start');
  await expect(second).rejects.toThrow('geometry failed: out of memory');
  expect(kinds).toStrictEqual(['worker:', 'worker:out of memory']);
});

test('timeouts and cancellations keep their own errors, unworded', async () => {
  vi.useFakeTimers();
  const failure = vi.fn(() => new Error('never used'));
  const channel = createWorkerChannel<string, string>(new FakeWorker(), {
    failure,
  });

  const late = channel.request('C', { timeoutMs: 10 });
  const cancelled = channel.request('CC');
  channel.cancel();
  vi.advanceTimersByTime(20);

  await expect(late).rejects.toBeInstanceOf(CancelledRequestError);
  await expect(cancelled).rejects.toBeInstanceOf(CancelledRequestError);

  const timed = channel.request('CCC', { timeoutMs: 10 });
  vi.advanceTimersByTime(20);

  await expect(timed).rejects.toBeInstanceOf(RequestTimeoutError);
  expect(failure).not.toHaveBeenCalled();
});

test('a job whose worker died before answering is posted once more on a fresh one', async () => {
  const created: FakeWorker[] = [];
  const channel = createWorkerChannel<string, string>(
    recordingFactory(created),
    { schedule: 'latest', retryAfterWorkerFailure: true },
  );

  const answer = channel.request('c1ccccc1');
  created[0]?.emit('error', {});
  created[1]?.reply(1, 'benzene');

  await expect(answer).resolves.toBe('benzene');
  expect(created.map((worker) => worker.terminated)).toStrictEqual([
    true,
    false,
  ]);
  expect(created[1]?.sent).toStrictEqual([{ id: 1, request: 'c1ccccc1' }]);

  const doomed = channel.request('C1CC');
  created[1]?.emit('error', {});
  created[2]?.emit('error', { message: 'still broken' });

  await expect(doomed).rejects.toThrow('worker failed: still broken');
  expect(created).toHaveLength(3);
});

test('a job handed buffers is never posted twice', async () => {
  const created: FakeWorker[] = [];
  const channel = createWorkerChannel<string, string>(
    recordingFactory(created),
    { retryAfterWorkerFailure: true },
  );
  const buffer = new ArrayBuffer(8);

  const answer = channel.request('grid', { transfer: [buffer] });
  created[0]?.emit('error', { message: 'crashed' });

  await expect(answer).rejects.toThrow('worker failed: crashed');
  expect(created).toHaveLength(1);
});

test('a browser that refuses a worker runs every job in-process instead', async () => {
  vi.stubGlobal('Worker', StandInWorker);
  let attempts = 0;
  const channel = createWorkerChannel<number, number>(
    () => {
      attempts++;
      throw new DOMException('opaque origin', 'SecurityError');
    },
    { runInProcess: (value) => Promise.resolve(value * 2) },
  );

  await expect(channel.request(2)).resolves.toBe(4);
  await expect(channel.request(5)).resolves.toBe(10);
  expect(attempts).toBe(1);
});

test('without an in-process run, a refused worker is a start failure', async () => {
  vi.stubGlobal('Worker', StandInWorker);
  const seen: string[] = [];
  const channel = createWorkerChannel<number, number>(
    () => {
      throw new Error('module workers are not supported');
    },
    {
      failure: (failure) => {
        seen.push(`${failure.kind}:${failure.message}`);
        return new Error('this browser cannot run the calculation');
      },
    },
  );

  await expect(channel.request(1)).rejects.toThrow(
    'this browser cannot run the calculation',
  );
  expect(seen).toStrictEqual(['start:module workers are not supported']);
});

test('an in-process job that throws is worded like a worker job', async () => {
  const error = new Error('cannot embed C1CC');
  const channel = createWorkerChannel<string, string>(recordingFactory([]), {
    runInProcess: () => Promise.reject(error),
    failure: (failure) =>
      failure.cause === error
        ? new SiteError('error.embed', failure.message)
        : undefined,
  });

  await expect(channel.request('C1CC')).rejects.toStrictEqual(
    new SiteError('error.embed', 'cannot embed C1CC'),
  );
});
