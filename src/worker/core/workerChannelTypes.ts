import type { WorkerLike } from './messages.ts';

/**
 * How a channel schedules the jobs it is asked for.
 *
 * - `parallel`: every request is posted at once, and several run side by side.
 * - `latest`: one job runs at a time. A new request supersedes every request
 *   still waiting, whose promises reject with a `CancelledRequestError`; the
 *   job already running finishes, its answer is dropped, and only the newest
 *   request is posted after it — so dragging a slider costs one extra job, not
 *   forty queued ones.
 * - `restart`: like `latest`, but the running job is ended at once by
 *   terminating its worker, and the newest request starts on a fresh one. It
 *   needs a channel built from a function that creates the worker.
 */
export type WorkerSchedule = 'parallel' | 'latest' | 'restart';

/** A worker, or the function that creates one when the first request comes. */
export type WorkerSource = WorkerLike | (() => WorkerLike);

/** What a job is handed besides its request, in a worker or in-process. */
export interface WorkerJobContext<TProgress = never> {
  /**
   * Aborted once nobody waits for the job: it was cancelled, superseded or
   * timed out. A long job checks it between steps and stops.
   */
  signal: AbortSignal;
  /**
   * Tell the caller how far the job is; ignored once nobody waits for it.
   * @param progress - The news, in the shape both sides agreed on.
   */
  reportProgress: (progress: TProgress) => void;
}

/** How a channel names itself, waits and schedules. */
export interface WorkerChannelOptions<TRequest, TResponse, TProgress = never> {
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
  /**
   * How requests share the worker. See {@link WorkerSchedule}.
   * @default 'parallel'
   */
  schedule?: WorkerSchedule;
  /**
   * Whether a request nobody waits for any more is followed by a
   * `{ id, cancel: true }` message, so a worker served by
   * `serveWorkerRequests` aborts the job's signal and can stop early. Off by
   * default, because a worker that does not know the message would read it as
   * a job.
   * @default false
   */
  cooperativeCancel?: boolean;
  /**
   * The same job run on this thread, used instead of the worker where the page
   * has no `Worker` at all — Node.js, a unit test — or where creating one
   * throws, as a browser refuses a page framed under an opaque origin a worker
   * from its own server; every later job then runs here too. Only a channel
   * built from a function that creates the worker falls back to it.
   * @default undefined — every job goes to the worker
   */
  runInProcess?: (
    request: TRequest,
    context: WorkerJobContext<TProgress>,
  ) => Promise<TResponse>;
  /**
   * Turn what went wrong into the error the requests reject with, so a page
   * can say it in its own words — a translated message, an error class of its
   * own. Answering `undefined` keeps the default error. Cancellations and
   * timeouts are not failures: they keep their own error classes.
   * @default undefined — the job's message, or `<name> failed: …`
   */
  failure?: (failure: WorkerFailure) => Error | undefined;
  /**
   * Post a job again, once, on a fresh worker when its worker failed before
   * answering, rather than reporting the failure: a worker whose module graph
   * was still loading when the channel replaced it dies without having run
   * anything. A job posted with buffers to transfer is not posted twice. Only
   * a channel built from a function that creates the worker can do it.
   * @default false
   */
  retryAfterWorkerFailure?: boolean;
}

/** What went wrong, before it becomes the error a request rejects with. */
export interface WorkerFailure {
  /**
   * `job`: the job failed — its worker answered with a failure, or its
   * in-process run threw. `worker`: the worker itself failed outright; an
   * empty `message` means it never ran at all, its module graph not loading.
   * `start`: creating the worker threw, and no in-process run stood in.
   */
  kind: 'job' | 'worker' | 'start';
  /** The channel's name, e.g. `conformers`. */
  name: string;
  /** What was said: the job's message, the error event's, or the thrown error's. */
  message: string;
  /**
   * The `detail` a failed answer carried, as `serveWorkerRequests` was told to
   * write it — the key of a translatable message, say.
   * @default undefined
   */
  detail?: unknown;
  /**
   * What the failure came with: the failed answer the worker posted, the error
   * the in-process run threw, the error event, or what the factory threw.
   */
  cause: unknown;
}

/** What one call may ask of the channel. */
export interface WorkerRequestOptions<TProgress = never> {
  /**
   * Abort the call. Its promise then rejects with a `CancelledRequestError`;
   * the job itself is only stopped by a worker that listens for cancellation.
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
  /**
   * Called with every progress message the worker posts about this call.
   * @default undefined
   */
  onProgress?: (progress: TProgress) => void;
  /**
   * Buffers handed over to the worker rather than copied, e.g. the bytes of a
   * file of several megabytes. They are unusable on this side afterwards.
   * @default undefined — everything is copied
   */
  transfer?: Transferable[];
}

/** A channel to one worker, over which jobs are requested and awaited. */
export interface WorkerChannel<TRequest, TResponse, TProgress = never> {
  /**
   * Post one job and wait for the answer that carries its identifier.
   * @param payload - The job.
   * @param options - Per-call signal, budget, progress and transfer.
   * @returns What the worker answered.
   */
  request: (
    payload: TRequest,
    options?: WorkerRequestOptions<TProgress>,
  ) => Promise<TResponse>;
  /** How many requests are still waiting for an answer. */
  readonly pendingCount: number;
  /**
   * Reject every waiting request with a `CancelledRequestError`, leaving the
   * worker alive.
   */
  cancel: () => void;
  /**
   * Terminate the worker, rejecting everything still waiting with a
   * `CancelledRequestError`. A channel built from a function starts a new
   * worker on its next request; one handed a worker accepts no further request.
   */
  terminate: () => void;
}
