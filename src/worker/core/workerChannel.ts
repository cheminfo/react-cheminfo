import { CancelledRequestError, RequestTimeoutError } from './errors.ts';
import type {
  WorkerLike,
  WorkerRequestMessage,
  WorkerResponseMessage,
} from './messages.ts';

/**
 * Turn a worker into something a page can await.
 *
 * Several requests may be in flight at once; each one is tagged with an
 * identifier the answer echoes, so replies are matched to callers whatever
 * order they arrive in. A request that rejects — cancelled, timed out, or
 * failed — drops out of the pending map at that moment, so a page that fires
 * one job per keystroke never accumulates them.
 *
 * The worker is the caller's: the channel posts to it and terminates it when
 * asked, but never creates one, which is what lets a site keep its own lazy
 * construction and its own in-process fallback.
 * @param worker - The worker to talk to, or anything that speaks its three calls.
 * @param options - See {@link WorkerChannelOptions}.
 * @returns The channel.
 */
export function createWorkerChannel<TRequest, TResponse>(
  worker: WorkerLike,
  options: WorkerChannelOptions = {},
): WorkerChannel<TRequest, TResponse> {
  const name = options.name ?? 'worker';
  const defaultTimeoutMs = positiveMilliseconds(
    options.defaultTimeoutMs,
    DEFAULT_TIMEOUT_MS,
  );

  const pending = new Map<number, PendingRequest<TResponse>>();
  let nextId = 0;
  let terminated = false;

  function settle(id: number): PendingRequest<TResponse> | undefined {
    const entry = pending.get(id);
    if (entry === undefined) return undefined;
    pending.delete(id);
    entry.dispose();
    return entry;
  }

  function rejectAll(error: Error): void {
    for (const entry of pending.values()) {
      entry.dispose();
      entry.reject(error);
    }
    pending.clear();
  }

  worker.addEventListener('message', (event) => {
    const message = event.data;
    if (!isResponseMessage(message)) return;
    const entry = settle(message.id);
    if (entry === undefined) return;
    if (message.ok) entry.resolve(message.response as TResponse);
    else entry.reject(new Error(message.message));
  });

  worker.addEventListener('error', (event) => {
    const detail = event.message ?? '';
    rejectAll(
      new Error(detail === '' ? `${name} failed` : `${name} failed: ${detail}`),
    );
  });

  return {
    get pendingCount() {
      return pending.size;
    },
    request: (payload: TRequest, requestOptions: WorkerRequestOptions = {}) => {
      const { signal, timeoutMs } = requestOptions;
      if (terminated) {
        return Promise.reject(
          new CancelledRequestError(`${name} was terminated`),
        );
      }
      if (signal?.aborted === true) {
        return Promise.reject(
          new CancelledRequestError(`${name} request was cancelled`),
        );
      }

      nextId += 1;
      const id = nextId;
      const budget = positiveMilliseconds(timeoutMs, defaultTimeoutMs);

      return new Promise<TResponse>((resolve, reject) => {
        const timeout = setTimeout(() => {
          settle(id)?.reject(
            new RequestTimeoutError(
              `${name} request ${id} timed out after ${budget} ms`,
            ),
          );
        }, budget);
        const onAbort = () => {
          settle(id)?.reject(
            new CancelledRequestError(`${name} request ${id} was cancelled`),
          );
        };
        signal?.addEventListener('abort', onAbort);

        pending.set(id, {
          resolve,
          reject,
          dispose: () => {
            clearTimeout(timeout);
            signal?.removeEventListener('abort', onAbort);
          },
        });

        const message: WorkerRequestMessage<TRequest> = {
          id,
          request: payload,
        };
        try {
          worker.postMessage(message);
        } catch (error) {
          settle(id);
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
    terminate: () => {
      terminated = true;
      rejectAll(new CancelledRequestError(`${name} was terminated`));
      worker.terminate();
    },
  };
}

/** How a channel names itself and how long it waits. */
export interface WorkerChannelOptions {
  /**
   * What the channel is called in the message of an error it raises, e.g.
   * `conformers`.
   * @default 'worker'
   */
  name?: string;
  /**
   * Milliseconds a request waits before it is given up on, when the call passes
   * no budget of its own. A value that is not a positive finite number falls
   * back to two minutes.
   * @default 120000
   */
  defaultTimeoutMs?: number;
}

/** What one call may ask of the channel. */
export interface WorkerRequestOptions {
  /**
   * Abort the call. Its promise then rejects with a
   * {@link CancelledRequestError}; the worker itself is left alone, since a job
   * already running cannot be interrupted from outside.
   * @default undefined
   */
  signal?: AbortSignal;
  /**
   * Milliseconds this call alone waits, overriding the channel default —
   * a calculation budget is often a user preference. A value that is not a
   * positive finite number falls back to the channel default.
   * @default the channel's defaultTimeoutMs
   */
  timeoutMs?: number;
}

/** A channel to one worker, over which several jobs may be in flight. */
export interface WorkerChannel<TRequest, TResponse> {
  /**
   * Post one job and wait for the answer that carries its identifier.
   * @param payload - The job.
   * @param options - Per-call signal and budget.
   * @returns What the worker answered.
   */
  request: (
    payload: TRequest,
    options?: WorkerRequestOptions,
  ) => Promise<TResponse>;
  /** How many requests are still waiting for an answer. */
  readonly pendingCount: number;
  /**
   * Terminate the worker, rejecting everything still waiting with a
   * {@link CancelledRequestError}. The channel accepts no further request.
   */
  terminate: () => void;
}

interface PendingRequest<TResponse> {
  resolve: (response: TResponse) => void;
  reject: (error: Error) => void;
  dispose: () => void;
}

const DEFAULT_TIMEOUT_MS = 120_000;

function isResponseMessage(
  message: unknown,
): message is WorkerResponseMessage<unknown> {
  if (typeof message !== 'object' || message === null) return false;
  const candidate = message as {
    id?: unknown;
    ok?: unknown;
    message?: unknown;
  };
  if (typeof candidate.id !== 'number' || typeof candidate.ok !== 'boolean') {
    return false;
  }
  return candidate.ok || typeof candidate.message === 'string';
}

function positiveMilliseconds(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}
