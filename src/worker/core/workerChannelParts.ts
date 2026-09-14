import { toError } from '../../error/core/toError.ts';

import type { WorkerLike } from './messages.ts';
import { isProgressMessage, isResponseMessage } from './messages.ts';
import type { WorkerJobContext } from './workerChannelTypes.ts';

/** How long a request waits when neither the call nor the channel says. */
export const DEFAULT_TIMEOUT_MS = 120_000;

/** One request waiting for its answer. */
export interface PendingRequest<TResponse, TProgress> {
  /** Settle the caller's promise with the answer. */
  resolve: (response: TResponse) => void;
  /** Settle the caller's promise with a failure. */
  reject: (error: Error) => void;
  /** Clear the timer and the abort listener. */
  dispose: () => void;
  /** Where the progress of this request goes. */
  onProgress: ((progress: TProgress) => void) | undefined;
  /** Whether the job has been handed to the worker, or started in-process. */
  dispatched: boolean;
  /**
   * Aborts the in-process run of the job.
   * @default undefined — the job runs in a worker
   */
  controller?: AbortController;
}

/** What {@link watchRequest} needs to keep an eye on one request. */
interface WatchedRequest<TResponse, TProgress> {
  /** Settle the caller's promise with the answer. */
  resolve: (response: TResponse) => void;
  /** Settle the caller's promise with a failure. */
  reject: (error: Error) => void;
  /** Where the progress of this request goes. */
  onProgress: ((progress: TProgress) => void) | undefined;
  /** The caller's signal, if any. */
  signal: AbortSignal | undefined;
  /** Milliseconds before `onTimeout` is called. */
  budget: number;
  /** Called once the budget has run out. */
  onTimeout: () => void;
  /** Called when the caller's signal aborts. */
  onAbort: () => void;
}

/** The one request a `latest` channel keeps until the running job answers. */
export interface QueuedRequest<TRequest> {
  /** Its identifier. */
  id: number;
  /** The job. */
  payload: TRequest;
  /** The buffers to hand over with it. */
  transfer: Transferable[] | undefined;
}

/** How a job ended. */
export type Outcome<TResponse> =
  { ok: true; response: TResponse } | { ok: false; error: Error };

/** What a channel does with each kind of message a worker sends. */
interface WorkerMessageHandlers {
  /** News about a running job. */
  progress: (id: number, progress: unknown) => void;
  /** The end of a job. */
  answer: (id: number, outcome: Outcome<unknown>) => void;
  /** The worker failed outright, with what it said, possibly nothing. */
  failure: (detail: string) => void;
}

/**
 * Start the timer and the abort listener of one request.
 * @param watched - See {@link WatchedRequest}.
 * @returns The pending entry, whose `dispose` stops both.
 */
export function watchRequest<TResponse, TProgress>(
  watched: WatchedRequest<TResponse, TProgress>,
): PendingRequest<TResponse, TProgress> {
  const { resolve, reject, onProgress, signal, budget, onTimeout, onAbort } =
    watched;
  const timeout = setTimeout(onTimeout, budget);
  signal?.addEventListener('abort', onAbort);
  return {
    resolve,
    reject,
    onProgress,
    dispatched: false,
    dispose: () => {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
    },
  };
}

/**
 * Ask a worker to stop a job, without ever throwing: a worker that cannot take
 * the message is ended some other way.
 * @param worker - The worker running the job, if there still is one.
 * @param id - The job's identifier.
 */
export function postCancel(worker: WorkerLike | null, id: number): void {
  try {
    worker?.postMessage({ id, cancel: true });
  } catch {
    // Nothing else to do: the caller has already been told.
  }
}

/**
 * Listen to a worker, sorting what it posts into progress and answers and
 * dropping anything that is not the protocol.
 * @param target - The worker.
 * @param handlers - See {@link WorkerMessageHandlers}.
 */
export function subscribeToWorker(
  target: WorkerLike,
  handlers: WorkerMessageHandlers,
): void {
  target.addEventListener('message', (event) => {
    const message = event.data;
    if (isProgressMessage(message)) {
      handlers.progress(message.id, message.progress);
    } else if (isResponseMessage(message)) {
      handlers.answer(
        message.id,
        message.ok
          ? { ok: true, response: message.response }
          : { ok: false, error: new Error(message.message) },
      );
    }
  });
  target.addEventListener('error', (event) => {
    handlers.failure(event.message ?? '');
  });
}

/**
 * Run one job on this thread as a worker would: with a signal the channel
 * aborts, progress routed back, and every outcome — a throw included —
 * reported exactly once, never synchronously.
 * @param runner - The in-process implementation of the job.
 * @param payload - The job.
 * @param reportProgress - Where the job's progress goes.
 * @param complete - Called with the outcome.
 * @returns The controller that aborts the job's signal.
 */
export function runJobInProcess<TRequest, TResponse, TProgress>(
  runner: (
    request: TRequest,
    context: WorkerJobContext<TProgress>,
  ) => Promise<TResponse>,
  payload: TRequest,
  reportProgress: (progress: TProgress) => void,
  complete: (outcome: Outcome<TResponse>) => void,
): AbortController {
  const controller = new AbortController();
  void Promise.resolve()
    .then(() => runner(payload, { signal: controller.signal, reportProgress }))
    .then(
      (response) => {
        complete({ ok: true, response });
      },
      (error: unknown) => {
        complete({ ok: false, error: toError(error) });
      },
    );
  return controller;
}

/**
 * A budget in milliseconds, or the fallback when it is not a positive number.
 * @param value - The budget asked for.
 * @param fallback - The budget to use otherwise.
 * @returns A positive finite number of milliseconds.
 */
export function positiveMilliseconds(
  value: number | undefined,
  fallback: number,
): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}
