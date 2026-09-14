import { afterEach, expect, test, vi } from 'vitest';

import { CancelledRequestError, RequestTimeoutError } from '../errors.ts';
import { createWorkerChannel } from '../workerChannel.ts';

import { FakeWorker, recordingFactory } from './fakeWorker.ts';

interface Job {
  smiles: string;
}

afterEach(() => {
  vi.useRealTimers();
});

test('progress the worker posts reaches the call it is about, and stops once it is answered', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string, number>(worker);
  const first: number[] = [];
  const second: number[] = [];

  const one = channel.request(
    { smiles: 'CCO' },
    { onProgress: (p) => first.push(p) },
  );
  const two = channel.request(
    { smiles: 'CCC' },
    { onProgress: (p) => second.push(p) },
  );
  worker.progress(1, 0.25);
  worker.progress(2, 0.5);
  worker.progress(1, 0.75);
  worker.reply(1, 'ethanol');
  worker.progress(1, 1);
  worker.reply(2, 'propane');

  await expect(one).resolves.toBe('ethanol');
  await expect(two).resolves.toBe('propane');
  expect(first).toStrictEqual([0.25, 0.75]);
  expect(second).toStrictEqual([0.5]);
});

test('buffers to transfer go to postMessage with the job', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<ArrayBuffer, number>(worker);
  const bytes = new ArrayBuffer(8);

  const answer = channel.request(bytes, { transfer: [bytes] });
  worker.reply(1, 8);

  await expect(answer).resolves.toBe(8);
  expect(worker.transfers).toStrictEqual([[bytes]]);
});

test('latest: a new request supersedes the waiting ones and is posted once the running job answers', async () => {
  const created: FakeWorker[] = [];
  const channel = createWorkerChannel<Job, string>(recordingFactory(created), {
    schedule: 'latest',
    name: 'conformers',
  });

  expect(created).toHaveLength(0);

  const first = channel.request({ smiles: 'C' });
  const second = channel.request({ smiles: 'CC' });
  const third = channel.request({ smiles: 'CCC' });

  await expect(first).rejects.toThrow(
    'conformers request 1 was superseded by a newer request',
  );
  await expect(second).rejects.toBeInstanceOf(CancelledRequestError);
  expect(created).toHaveLength(1);
  expect(created[0]?.sent).toStrictEqual([{ id: 1, request: { smiles: 'C' } }]);
  expect(channel.pendingCount).toBe(1);

  created[0]?.reply(1, 'methane');

  expect(created[0]?.sent).toStrictEqual([
    { id: 1, request: { smiles: 'C' } },
    { id: 3, request: { smiles: 'CCC' } },
  ]);

  created[0]?.reply(3, 'propane');

  await expect(third).resolves.toBe('propane');
});

test('with cooperative cancel, a superseded job that was posted is asked to stop', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker, {
    schedule: 'latest',
    cooperativeCancel: true,
  });

  const first = channel.request({ smiles: 'C' });
  const second = channel.request({ smiles: 'CC' });

  await expect(first).rejects.toBeInstanceOf(CancelledRequestError);
  expect(worker.sent).toStrictEqual([
    { id: 1, request: { smiles: 'C' } },
    { id: 1, cancel: true },
  ]);

  worker.fail(1, 'stopped');

  expect(worker.sent.at(-1)).toStrictEqual({
    id: 2,
    request: { smiles: 'CC' },
  });

  worker.reply(2, 'ethane');

  await expect(second).resolves.toBe('ethane');
});

test('restart: a new request terminates the running worker and starts on a fresh one', async () => {
  const created: FakeWorker[] = [];
  const channel = createWorkerChannel<Job, string>(recordingFactory(created), {
    schedule: 'restart',
  });

  const first = channel.request({ smiles: 'C' });
  const second = channel.request({ smiles: 'CC' });

  await expect(first).rejects.toThrow(
    'worker request 1 was superseded by a newer request',
  );
  expect(created).toHaveLength(2);
  expect(created[0]?.terminated).toBe(true);
  expect(created[1]?.sent).toStrictEqual([
    { id: 2, request: { smiles: 'CC' } },
  ]);

  created[0]?.reply(1, 'stale');
  created[1]?.reply(2, 'ethane');

  await expect(second).resolves.toBe('ethane');
});

test('restart cannot be asked of a single worker', () => {
  expect(() =>
    createWorkerChannel(new FakeWorker(), { schedule: 'restart', name: 'vcl' }),
  ).toThrow('vcl: the restart schedule needs a worker factory');
});

test('a running job that outlives its budget has its worker thrown away', async () => {
  vi.useFakeTimers();
  const created: FakeWorker[] = [];
  const channel = createWorkerChannel<Job, string>(recordingFactory(created), {
    schedule: 'latest',
    defaultTimeoutMs: 1000,
  });

  const first = channel.request({ smiles: 'C' });
  vi.advanceTimersByTime(1000);

  await expect(first).rejects.toBeInstanceOf(RequestTimeoutError);
  expect(created[0]?.terminated).toBe(true);

  const second = channel.request({ smiles: 'CC' });

  expect(created).toHaveLength(2);
  expect(created[1]?.sent).toStrictEqual([
    { id: 2, request: { smiles: 'CC' } },
  ]);

  created[1]?.reply(2, 'ethane');

  await expect(second).resolves.toBe('ethane');
});

test('cancel rejects every waiting call, keeps the worker, and asks a cooperative one to stop', async () => {
  const worker = new FakeWorker();
  const channel = createWorkerChannel<Job, string>(worker, {
    cooperativeCancel: true,
    name: 'surge',
  });

  const first = channel.request({ smiles: 'C' });
  const second = channel.request({ smiles: 'CC' });
  channel.cancel();

  await expect(first).rejects.toThrow('surge request 1 was cancelled');
  await expect(second).rejects.toBeInstanceOf(CancelledRequestError);
  expect(worker.terminated).toBe(false);
  expect(worker.sent.slice(2)).toStrictEqual([
    { id: 1, cancel: true },
    { id: 2, cancel: true },
  ]);

  const third = channel.request({ smiles: 'CCC' });
  worker.reply(3, 'propane');

  await expect(third).resolves.toBe('propane');
});
