import { errorMessage } from '../../error/core/toError.ts';

import { CancelledRequestError } from './errors.ts';
import type { WorkerLike, WorkerResponseMessage } from './messages.ts';
import type { Outcome } from './workerChannelParts.ts';
import {
  defaultFailureError,
  subscribeToWorker,
} from './workerChannelParts.ts';
import type {
  WorkerFailure,
  WorkerJobContext,
  WorkerSource,
} from './workerChannelTypes.ts';

/**
 * The one worker a channel posts to, kept, replaced and listened to.
 *
 * Handed a worker, the slot holds it until it is terminated. Handed a function,
 * it creates the worker on first use and again after one failed or was let go,
 * and runs the jobs on this thread instead — where there is no `Worker`, or
 * where creating one throws — when the channel was given an in-process run.
 * What a worker posts is heard only while it is the slot's current one, so a
 * worker already let go cannot settle a job it no longer runs.
 * @param source - The worker, or the function that creates it.
 * @param options - What the slot reports to, and how failures are worded.
 * @returns The slot.
 */
export function createWorkerSlot<TRequest, TResponse, TProgress>(
  source: WorkerSource,
  options: WorkerSlotOptions<TRequest, TResponse, TProgress>,
): WorkerSlot<TRequest, TResponse, TProgress> {
  const { name, runInProcess, failure, isWaited, report } = options;
  const factory = typeof source === 'function' ? source : undefined;
  let worker: WorkerLike | null = null;
  let local =
    factory !== undefined && !('Worker' in globalThis)
      ? runInProcess
      : undefined;
  if (typeof source !== 'function') {
    worker = source;
    listen(source);
  }

  function fail(described: WorkerFailure): Error {
    return failure?.(described) ?? defaultFailureError(described);
  }

  function acquire(): WorkerLike | null {
    if (local !== undefined) return null;
    if (worker !== null) return worker;
    if (factory === undefined) {
      throw new CancelledRequestError(`${name} was terminated`);
    }
    try {
      worker = factory();
    } catch (error) {
      if (runInProcess === undefined) {
        const message = errorMessage(error);
        throw fail({ kind: 'start', name, message, cause: error });
      }
      local = runInProcess;
      return null;
    }
    listen(worker);
    return worker;
  }

  function outcomeOf(
    id: number,
    message: WorkerResponseMessage<unknown>,
  ): Outcome<TResponse> {
    if (message.ok) {
      return { ok: true, response: message.response as TResponse };
    }
    if (!isWaited(id)) return { ok: false, error: new Error(message.message) };
    const { detail } = message;
    const described = { kind: 'job', name, message: message.message } as const;
    return { ok: false, error: fail({ ...described, detail, cause: message }) };
  }

  function listen(target: WorkerLike): void {
    subscribeToWorker(target, {
      progress: (id, progress) => {
        if (target === worker) report.progress(id, progress);
      },
      answer: (id, message) => {
        if (target === worker) report.answer(id, outcomeOf(id, message));
      },
      failure: (detail, event) => {
        if (target !== worker) return;
        if (factory !== undefined) {
          target.terminate();
          worker = null;
        }
        report.failure(
          fail({ kind: 'worker', name, message: detail, cause: event }),
        );
      },
    });
  }

  return {
    hasFactory: factory !== undefined,
    get current() {
      return worker;
    },
    acquire,
    runLocally: (payload, context) =>
      local === undefined
        ? Promise.reject(new Error(`${name} has no in-process run`))
        : local(payload, context),
    jobFailed: (error) =>
      fail({ kind: 'job', name, message: error.message, cause: error }),
    abandon: () => {
      if (factory === undefined || worker === null) return;
      worker.terminate();
      worker = null;
    },
    terminate: () => {
      worker?.terminate();
      if (factory !== undefined) worker = null;
    },
  };
}

/** What a slot is told about its channel. */
export interface WorkerSlotOptions<TRequest, TResponse, TProgress> {
  /** The channel's name, for its errors. */
  name: string;
  /**
   * The job run on this thread instead of a worker.
   * @default undefined — every job goes to the worker
   */
  runInProcess?: (
    request: TRequest,
    context: WorkerJobContext<TProgress>,
  ) => Promise<TResponse>;
  /**
   * The channel's own wording of a failure.
   * @default undefined — the default errors
   */
  failure?: (failure: WorkerFailure) => Error | undefined;
  /** Whether somebody still waits for a request. */
  isWaited: (id: number) => boolean;
  /** Where what the current worker posts goes. */
  report: {
    /** News about a running job. */
    progress: (id: number, progress: unknown) => void;
    /** The end of a job. */
    answer: (id: number, outcome: Outcome<TResponse>) => void;
    /** The worker failed outright, and a factory's was let go. */
    failure: (error: Error) => void;
  };
}

/** The worker of a channel; see {@link createWorkerSlot}. */
export interface WorkerSlot<TRequest, TResponse, TProgress> {
  /** Whether the slot creates its workers, and can therefore replace one. */
  readonly hasFactory: boolean;
  /** The worker posted to now, if there is one. */
  readonly current: WorkerLike | null;
  /**
   * The worker a job goes to, created if need be.
   * @returns It, or `null` when the job runs on this thread instead.
   * @throws {CancelledRequestError} When a worker handed over was terminated.
   * @throws {Error} What creating the worker threw, worded by the channel.
   */
  acquire: () => WorkerLike | null;
  /** Run a job on this thread, as the channel's in-process run. */
  runLocally: (
    payload: TRequest,
    context: WorkerJobContext<TProgress>,
  ) => Promise<TResponse>;
  /** The error an in-process run that failed rejects with. */
  jobFailed: (error: Error) => Error;
  /** End a factory's worker, so the next job starts on a fresh one. */
  abandon: () => void;
  /** End the worker, whatever made it. */
  terminate: () => void;
}
