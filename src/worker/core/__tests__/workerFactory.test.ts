import { expect, test } from 'vitest';

import { CancelledRequestError } from '../errors.ts';
import { createWorkerChannel } from '../workerChannel.ts';

import type { FakeWorker } from './fakeWorker.ts';
import { recordingFactory } from './fakeWorker.ts';

interface Job {
  smiles: string;
}

test('where there is no Worker, a factory channel runs the job in-process with progress and a signal', async () => {
  expect('Worker' in globalThis).toBe(false);

  const created: FakeWorker[] = [];
  const signals: AbortSignal[] = [];
  const channel = createWorkerChannel<number, number, string>(
    recordingFactory(created),
    {
      schedule: 'latest',
      runInProcess: async (value, { signal, reportProgress }) => {
        signals.push(signal);
        reportProgress(`squaring ${value}`);
        await Promise.resolve();
        return value * value;
      },
    },
  );
  const progress: string[] = [];

  const first = channel.request(3, { onProgress: (p) => progress.push(p) });
  const second = channel.request(4, { onProgress: (p) => progress.push(p) });

  await expect(first).rejects.toBeInstanceOf(CancelledRequestError);
  await expect(second).resolves.toBe(16);
  expect(created).toHaveLength(0);
  expect(signals[0]?.aborted).toBe(true);
  expect(signals[1]?.aborted).toBe(false);
  expect(progress).toStrictEqual(['squaring 4']);
});

test('an in-process job that throws rejects with what it threw', async () => {
  const channel = createWorkerChannel<string, number>(recordingFactory([]), {
    runInProcess: (smiles) => {
      throw new Error(`cannot parse ${smiles}`);
    },
  });

  await expect(channel.request('C1CC')).rejects.toThrow('cannot parse C1CC');
});

test('a factory channel replaces a terminated or failed worker on its next request', async () => {
  const created: FakeWorker[] = [];
  const channel = createWorkerChannel<Job, string>(recordingFactory(created));

  const first = channel.request({ smiles: 'C' });
  channel.terminate();

  await expect(first).rejects.toThrow('worker was terminated');
  expect(created[0]?.terminated).toBe(true);

  const second = channel.request({ smiles: 'CC' });
  created[1]?.emit('error', { message: 'out of memory' });

  await expect(second).rejects.toThrow('worker failed: out of memory');
  expect(created[1]?.terminated).toBe(true);

  const third = channel.request({ smiles: 'CCC' });
  created[2]?.reply(3, 'propane');

  await expect(third).resolves.toBe('propane');
  expect(created).toHaveLength(3);
});

test('a factory that throws rejects that call', async () => {
  const channel = createWorkerChannel<Job, string>(() => {
    throw new Error('module workers are not supported');
  });

  await expect(channel.request({ smiles: 'C' })).rejects.toThrow(
    'module workers are not supported',
  );
  expect(channel.pendingCount).toBe(0);
});
