import { toError } from '../../error/core/toError.ts';

import { CancelledRequestError, RequestTimeoutError } from './errors.ts';
import type { WorkerRequestMessage } from './messages.ts';
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
  watchRequest,
} from './workerChannelParts.ts';
import type {
  WorkerChannel,
  WorkerChannelOptions,
  WorkerRequestOptions,
  WorkerSource,
} from './workerChannelTypes.ts';
import { createWorkerSlot } from './workerSlot.ts';

/**
 * Turn a worker into something a page can await.
 *
 * Every request is tagged with an identifier the answer echoes, so replies are
 * matched to callers whatever order they arrive in, and a request that rejects
 * — cancelled, superseded, timed out, or failed — drops out of the pending map
 * at that moment. The worker may post progress about a job while it runs.
 *
 * Handed a worker, the channel posts to it and terminates it when asked. Handed
 * a function, it creates the worker when needed and can run the job in-process
 * instead; see `createWorkerSlot`.
 * @param source - The worker, or the function that creates it.
 * @param options - See {@link WorkerChannelOptions}.
 * @returns The channel.
 * @throws {Error} When the `restart` schedule is asked of a single worker, which cannot be restarted.
 */
export function createWorkerChannel<TRequest, TResponse, TProgress = never>(
  source: WorkerSource,
  options: WorkerChannelOptions<TRequest, TResponse, TProgress> = {},
): WorkerChannel<TRequest, TResponse, TProgress> {
  const { name = 'worker', schedule = 'parallel' } = options;
  const { cooperativeCancel = false, retryAfterWorkerFailure } = options;
  const { defaultTimeoutMs, runInProcess, failure } = options;
  const fallbackTimeoutMs = positiveMilliseconds(
    defaultTimeoutMs,
    DEFAULT_TIMEOUT_MS,
  );
  if (schedule === 'restart' && typeof source !== 'function') {
    throw new Error(`${name}: the restart schedule needs a worker factory`);
  }
  const retries = typeof source === 'function' && retryAfterWorkerFailure;

  const pending = new Map<number, PendingRequest<TResponse, TProgress>>();
  const posted = new Map<number, QueuedRequest<TRequest>>();
  const retried = new Set<number>();
  let closed = false;
  let nextId = 0;
  let activeId: number | null = null;
  let queued: QueuedRequest<TRequest> | null = null;
  const slot = createWorkerSlot<TRequest, TResponse, TProgress>(source, {
    name,
    runInProcess,
    failure,
    isWaited: (id) => pending.has(id),
    report: {
      progress: (id, progress) => {
        pending.get(id)?.onProgress?.(progress as TProgress);
      },
      answer: (id, outcome) => complete(id, outcome),
      failure: (error) => workerFailed(error),
    },
  });

  function take(id: number): PendingRequest<TResponse, TProgress> | undefined {
    const entry = pending.get(id);
    pending.delete(id);
    posted.delete(id);
    retried.delete(id);
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
    if (cooperativeCancel && entry.dispatched) postCancel(slot.current, id);
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
    for (const [id, entry] of pending) {
      take(id);
      entry.controller?.abort();
      entry.reject(error);
    }
    activeId = null;
    queued = null;
  }

  function abandonActive(): void {
    activeId = null;
    slot.abandon();
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
    try {
      const target = slot.acquire();
      if (target !== null) {
        if (retries && transfer === undefined) {
          posted.set(id, { id, payload, transfer });
        }
        const message: WorkerRequestMessage<TRequest> = {
          id,
          request: payload,
        };
        if (transfer === undefined) target.postMessage(message);
        else target.postMessage(message, transfer);
        return;
      }
    } catch (error) {
      complete(id, { ok: false, error: toError(error) });
      return;
    }
    entry.controller = runJobInProcess(
      slot.runLocally,
      payload,
      (progress) => pending.get(id)?.onProgress?.(progress),
      (outcome) => complete(id, outcomeOf(outcome)),
    );
  }

  function outcomeOf(outcome: Outcome<TResponse>): Outcome<TResponse> {
    return outcome.ok
      ? outcome
      : { ok: false, error: slot.jobFailed(outcome.error) };
  }

  function workerFailed(error: Error): void {
    if (!retries) {
      rejectAll(error);
      return;
    }
    activeId = null;
    for (const [id, entry] of pending) {
      if (!entry.dispatched) continue;
      const job = posted.get(id);
      if (job === undefined || retried.has(id)) {
        drop(id, error);
        continue;
      }
      retried.add(id);
      dispatch(id, job.payload);
    }
    if (activeId === null) startQueued();
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
      slot.terminate();
      if (!slot.hasFactory) closed = true;
    },
  };
}
