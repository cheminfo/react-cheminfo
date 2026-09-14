import { toError } from '../../error/core/toError.ts';

import { CancelledRequestError, RequestTimeoutError } from './errors.ts';
import type { WorkerLike, WorkerRequestMessage } from './messages.ts';
import type {
  Outcome,
  PendingRequest,
  QueuedRequest,
} from './workerChannelParts.ts';
import {
  DEFAULT_TIMEOUT_MS,
  positiveMilliseconds,
  postCancel,
  runJobInProcess,
  subscribeToWorker,
  watchRequest,
} from './workerChannelParts.ts';
import type {
  WorkerChannel,
  WorkerChannelOptions,
  WorkerRequestOptions,
  WorkerSource,
} from './workerChannelTypes.ts';

/**
 * Turn a worker into something a page can await.
 *
 * Every request is tagged with an identifier the answer echoes, so replies are
 * matched to callers whatever order they arrive in, and a request that rejects
 * — cancelled, superseded, timed out, or failed — drops out of the pending map
 * at that moment. The worker may post progress about a job while it runs.
 *
 * Handed a worker, the channel posts to it and terminates it when asked, but
 * never creates one. Handed a function, it creates the worker on the first
 * request, replaces one that failed or was terminated, and can fall back to an
 * in-process run where there is no `Worker`.
 * @param source - The worker, or the function that creates it.
 * @param options - See {@link WorkerChannelOptions}.
 * @returns The channel.
 * @throws {Error} When the `restart` schedule is asked of a single worker, which cannot be restarted.
 */
export function createWorkerChannel<TRequest, TResponse, TProgress = never>(
  source: WorkerSource,
  options: WorkerChannelOptions<TRequest, TResponse, TProgress> = {},
): WorkerChannel<TRequest, TResponse, TProgress> {
  const {
    name = 'worker',
    schedule = 'parallel',
    cooperativeCancel = false,
    defaultTimeoutMs,
    runInProcess,
  } = options;
  const fallbackTimeoutMs = positiveMilliseconds(
    defaultTimeoutMs,
    DEFAULT_TIMEOUT_MS,
  );
  const factory = typeof source === 'function' ? source : undefined;
  if (schedule === 'restart' && factory === undefined) {
    throw new Error(`${name}: the restart schedule needs a worker factory`);
  }
  const hasNoWorker = !('Worker' in globalThis);
  const runLocally = factory && hasNoWorker ? runInProcess : undefined;

  const pending = new Map<number, PendingRequest<TResponse, TProgress>>();
  let worker: WorkerLike | null = null;
  let closed = false;
  let nextId = 0;
  let activeId: number | null = null;
  let queued: QueuedRequest<TRequest> | null = null;
  if (typeof source !== 'function') {
    worker = source;
    listen(source);
  }

  function take(id: number): PendingRequest<TResponse, TProgress> | undefined {
    const entry = pending.get(id);
    pending.delete(id);
    entry?.dispose();
    return entry;
  }

  function complete(id: number, outcome: Outcome<TResponse>): void {
    const entry = take(id);
    if (outcome.ok) entry?.resolve(outcome.response);
    else entry?.reject(outcome.error);
    if (activeId === id) {
      activeId = null;
      startQueued();
    }
  }

  function drop(id: number, error: Error): boolean {
    const entry = take(id);
    if (entry === undefined) return false;
    entry.controller?.abort();
    if (cooperativeCancel && entry.dispatched) postCancel(worker, id);
    entry.reject(error);
    return true;
  }

  function dropAll(reason: string): void {
    for (const id of pending.keys()) {
      drop(id, new CancelledRequestError(`${name} request ${id} ${reason}`));
    }
    queued = null;
  }

  function rejectAll(error: Error): void {
    for (const entry of pending.values()) {
      entry.dispose();
      entry.controller?.abort();
      entry.reject(error);
    }
    pending.clear();
    activeId = null;
    queued = null;
  }

  function abandonActive(): void {
    activeId = null;
    if (factory !== undefined && worker !== null) {
      worker.terminate();
      worker = null;
    }
  }

  function startQueued(): void {
    const next = queued;
    queued = null;
    if (next !== null) dispatch(next.id, next.payload, next.transfer);
  }

  function dispatch(id: number, payload: TRequest, transfer?: Transferable[]) {
    const entry = pending.get(id);
    if (entry === undefined) return;
    entry.dispatched = true;
    if (schedule !== 'parallel') activeId = id;
    if (runLocally !== undefined) {
      entry.controller = runJobInProcess(
        runLocally,
        payload,
        (progress) => pending.get(id)?.onProgress?.(progress),
        (outcome) => complete(id, outcome),
      );
      return;
    }
    const message: WorkerRequestMessage<TRequest> = { id, request: payload };
    try {
      const target = currentWorker();
      if (transfer === undefined) target.postMessage(message);
      else target.postMessage(message, transfer);
    } catch (error) {
      complete(id, { ok: false, error: toError(error) });
    }
  }

  function currentWorker(): WorkerLike {
    if (worker === null) {
      if (factory === undefined) {
        throw new CancelledRequestError(`${name} was terminated`);
      }
      worker = factory();
      listen(worker);
    }
    return worker;
  }

  function listen(target: WorkerLike): void {
    subscribeToWorker(target, {
      progress: (id, progress) => {
        if (target !== worker) return;
        pending.get(id)?.onProgress?.(progress as TProgress);
      },
      answer: (id, outcome) => {
        if (target === worker) complete(id, outcome as Outcome<TResponse>);
      },
      failure: (detail) => {
        if (target !== worker) return;
        if (factory !== undefined) {
          target.terminate();
          worker = null;
        }
        const suffix = detail === '' ? '' : `: ${detail}`;
        rejectAll(new Error(`${name} failed${suffix}`));
      },
    });
  }

  function expire(id: number, budget: number): void {
    const message = `${name} request ${id} timed out after ${budget} ms`;
    if (drop(id, new RequestTimeoutError(message)) && activeId === id) {
      abandonActive();
      startQueued();
    }
  }

  function request(
    payload: TRequest,
    requestOptions: WorkerRequestOptions<TProgress> = {},
  ): Promise<TResponse> {
    const { signal, timeoutMs, onProgress, transfer } = requestOptions;
    if (closed || signal?.aborted === true) {
      const reason = closed ? 'was terminated' : 'request was cancelled';
      return Promise.reject(new CancelledRequestError(`${name} ${reason}`));
    }
    if (schedule !== 'parallel') {
      dropAll('was superseded by a newer request');
      if (schedule === 'restart' && activeId !== null) abandonActive();
    }

    nextId += 1;
    const id = nextId;
    const budget = positiveMilliseconds(timeoutMs, fallbackTimeoutMs);
    const cancelled = `${name} request ${id} was cancelled`;

    return new Promise<TResponse>((resolve, reject) => {
      pending.set(
        id,
        watchRequest({
          resolve,
          reject,
          onProgress,
          signal,
          budget,
          onTimeout: () => expire(id, budget),
          onAbort: () => drop(id, new CancelledRequestError(cancelled)),
        }),
      );
      if (schedule === 'latest' && activeId !== null) {
        queued = { id, payload, transfer };
      } else {
        dispatch(id, payload, transfer);
      }
    });
  }

  return {
    request,
    get pendingCount() {
      return pending.size;
    },
    cancel: () => dropAll('was cancelled'),
    terminate: () => {
      rejectAll(new CancelledRequestError(`${name} was terminated`));
      worker?.terminate();
      if (factory === undefined) closed = true;
      else worker = null;
    },
  };
}
