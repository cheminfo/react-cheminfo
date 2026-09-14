import { expect, test, vi } from 'vitest';

import { CancelledRequestError } from '../errors.ts';
import type { WorkerEventLike, WorkerLike } from '../messages.ts';
import type { WorkerScopeLike } from '../serveWorkerRequests.ts';
import { serveWorkerRequests } from '../serveWorkerRequests.ts';
import { createWorkerChannel } from '../workerChannel.ts';

test('outside a dedicated worker there is no scope to serve', () => {
  expect(serveWorkerRequests(() => 1)).toBe(false);
});

test('a request of the wrong shape is refused before it reaches the handler', async () => {
  const scope = new FakeScope();
  const handled: string[] = [];
  serveWorkerRequests(
    (smiles: string) => {
      handled.push(smiles);
      return smiles.length;
    },
    {
      scope,
      accepts: (request): request is string => typeof request === 'string',
    },
  );

  scope.send({ id: 1, request: 42 });
  scope.send({ id: 2, request: 'CCO' });

  await vi.waitFor(() => {
    expect(scope.posted).toHaveLength(2);
  });

  expect(scope.posted).toStrictEqual([
    { id: 1, ok: false, message: 'not a request this worker handles' },
    { id: 2, ok: true, response: 3 },
  ]);
  expect(handled).toStrictEqual(['CCO']);
});

test('a request is answered with what the handler returns, and other messages are ignored', async () => {
  const scope = new FakeScope();
  serveWorkerRequests((smiles: string) => smiles.length, { scope });

  scope.send({ id: 7, request: 'CCO' });
  scope.send({ progress: 1 });
  scope.send('not an object');

  await vi.waitFor(() => {
    expect(scope.posted).toStrictEqual([{ id: 7, ok: true, response: 3 }]);
  });
});

test('a handler that fails answers with its message, whatever was thrown', async () => {
  const scope = new FakeScope();
  serveWorkerRequests(
    (smiles: string) => {
      if (smiles === '') throw new Error('empty SMILES');
      return Promise.reject(new Error(`cannot parse ${smiles}`));
    },
    { scope },
  );

  scope.send({ id: 1, request: '' });
  scope.send({ id: 2, request: 'C1CC' });

  await vi.waitFor(() => {
    expect(scope.posted).toStrictEqual([
      { id: 1, ok: false, message: 'empty SMILES' },
      { id: 2, ok: false, message: 'cannot parse C1CC' },
    ]);
  });
});

test('progress is posted while the job runs, and a cancel message aborts its signal', async () => {
  const scope = new FakeScope();
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  serveWorkerRequests<number, string, number>(
    async (value, { signal, reportProgress }) => {
      reportProgress(1);
      await gate;
      reportProgress(2);
      return signal.aborted ? 'stopped' : String(value);
    },
    { scope },
  );

  scope.send({ id: 3, request: 42 });
  await vi.waitFor(() => {
    expect(scope.posted).toStrictEqual([{ id: 3, progress: 1 }]);
  });
  scope.send({ id: 3, cancel: true });
  release?.();

  await vi.waitFor(() => {
    expect(scope.posted).toStrictEqual([
      { id: 3, progress: 1 },
      { id: 3, ok: true, response: 'stopped' },
    ]);
  });
});

test('the buffers of an answer are transferred, and an answer that cannot be posted still ends the job', async () => {
  const scope = new FakeScope();
  serveWorkerRequests(
    (length: number) =>
      length < 0 ? { handle: Symbol('x') } : new ArrayBuffer(length),
    {
      scope,
      transfer: (response) =>
        response instanceof ArrayBuffer ? [response] : [],
    },
  );
  scope.refuse = (message) =>
    (message as { response?: unknown }).response instanceof Object &&
    !((message as { response?: unknown }).response instanceof ArrayBuffer);

  scope.send({ id: 1, request: 16 });
  scope.send({ id: 2, request: -1 });

  await vi.waitFor(() => {
    expect(scope.posted).toHaveLength(2);
  });

  expect(scope.transfers[0]).toHaveLength(1);
  expect(scope.posted[1]).toStrictEqual({
    id: 2,
    ok: false,
    message: 'the answer could not be cloned',
  });
});

test('a transfer list that cannot be built still answers with its failure', async () => {
  const scope = new FakeScope();
  serveWorkerRequests(
    (length: number) => ({ grid: length > 0 ? new ArrayBuffer(length) : null }),
    {
      scope,
      transfer: (response) => {
        if (response.grid === null) throw new Error('the grid is missing');
        return [response.grid];
      },
    },
  );

  scope.send({ id: 1, request: 0 });

  await vi.waitFor(() => {
    expect(scope.posted).toStrictEqual([
      { id: 1, ok: false, message: 'the grid is missing' },
    ]);
  });
});

test('a channel and a served worker speak the same protocol, cancellation included', async () => {
  const scope = new FakeScope();
  const worker = scope.connect();
  serveWorkerRequests<number, number, number>(
    async (value, { signal, reportProgress }) => {
      for (let step = 1; step <= 3; step++) {
        if (signal.aborted) throw new Error('stopped');
        reportProgress(step);
        // eslint-disable-next-line no-await-in-loop -- the job hands the thread back between steps
        await Promise.resolve();
      }
      return value * 2;
    },
    { scope },
  );
  const channel = createWorkerChannel<number, number, number>(worker, {
    schedule: 'latest',
    cooperativeCancel: true,
  });
  const progress: number[] = [];

  const first = channel.request(1);
  const second = channel.request(2, { onProgress: (p) => progress.push(p) });

  await expect(first).rejects.toBeInstanceOf(CancelledRequestError);
  await expect(second).resolves.toBe(4);
  expect(progress).toStrictEqual([1, 2, 3]);
});

class FakeScope implements WorkerScopeLike {
  public readonly posted: unknown[] = [];
  public readonly transfers: Array<Transferable[] | undefined> = [];
  public refuse: ((message: unknown) => boolean) | undefined;
  #listener: ((event: { data: unknown }) => void) | undefined;
  #page: ((event: WorkerEventLike) => void) | undefined;

  public addEventListener(
    type: 'message',
    listener: (event: { data: unknown }) => void,
  ): void {
    this.#listener = listener;
  }

  public postMessage(message: unknown, transfer?: Transferable[]): void {
    if (this.refuse?.(message)) {
      throw new Error('the answer could not be cloned');
    }
    this.posted.push(message);
    this.transfers.push(transfer);
    const page = this.#page;
    if (page !== undefined) queueMicrotask(() => page({ data: message }));
  }

  public send(data: unknown): void {
    this.#listener?.({ data });
  }

  /**
   * The page's side of this scope, delivering in both directions a microtask
   * later, as a real worker delivers asynchronously.
   * @returns A worker whose messages reach this scope.
   */
  public connect(): WorkerLike {
    return {
      postMessage: (message) => {
        queueMicrotask(() => this.send(message));
      },
      addEventListener: (type, listener) => {
        if (type === 'message') this.#page = listener;
      },
      terminate: () => undefined,
    };
  }
}
