/**
 * A kind channel whose requests travel in an envelope: the message posted
 * holds the request under `request`, beside what the call adds to it — the
 * budget the worker is to keep, a flag the answer depends on — so every job
 * carries it, and a worker started afresh after a failure reads it from its
 * first job. An envelope without a request carries only what it adds (a new
 * budget, at once), and its answer is not read.
 *
 * The answer of a request is typed by the request's kind, as
 * `createKindChannel` types it, in this one place.
 */

import type { KindRequest } from './kindChannel.ts';
import { createWorkerChannel } from './workerChannel.ts';
import type {
  WorkerChannelOptions,
  WorkerRequestOptions,
  WorkerSource,
} from './workerChannelTypes.ts';

/** What an envelope channel posts: what the call adds, and its request. */
export type Enveloped<TRequest, TEnvelope> = TEnvelope & {
  /**
   * The request, absent from an envelope that only carries what it adds.
   * @default undefined
   */
  request?: TRequest;
};

/** A channel typed by request kind, each request posted in an envelope. */
export interface EnvelopeChannel<
  TRequest extends { kind: string },
  TResponses extends Record<TRequest['kind'], unknown>,
  TEnvelope extends object,
  TProgress = never,
> {
  /**
   * Post one request in its envelope and wait for the answer of its kind.
   * @param request - The request.
   * @param envelope - What this call adds beside it.
   * @param options - Per-call signal, budget, progress and transfer.
   * @returns The answer.
   */
  request: <TKind extends TRequest['kind']>(
    request: KindRequest<TRequest, TKind>,
    envelope: TEnvelope,
    options?: WorkerRequestOptions<TProgress>,
  ) => Promise<TResponses[TKind]>;
  /**
   * Post an envelope with no request in it: what it carries, alone.
   * @param envelope - What it carries.
   * @param options - Per-call signal and budget.
   * @returns Settled once the worker has read it.
   */
  post: (
    envelope: TEnvelope,
    options?: WorkerRequestOptions<TProgress>,
  ) => Promise<void>;
  /** How many requests and envelopes are still waiting for an answer. */
  readonly pendingCount: number;
  /** Reject everything waiting, leaving the worker alive. */
  cancel: () => void;
  /** Terminate the worker, rejecting everything still waiting. */
  terminate: () => void;
}

/**
 * Turn a worker answering enveloped requests by kind into something a page
 * awaits with the answer's type (`createWorkerChannel`, typed by kind).
 * @param source - The worker, or the function that creates it.
 * @param options - See `WorkerChannelOptions`; `runInProcess` is handed the
 *   envelope, as the worker is.
 * @default options {}
 * @returns The channel.
 */
export function createEnvelopeChannel<
  TRequest extends { kind: string },
  TResponses extends Record<TRequest['kind'], unknown>,
  TEnvelope extends object,
  TProgress = never,
>(
  source: WorkerSource,
  options: WorkerChannelOptions<
    Enveloped<TRequest, TEnvelope>,
    TResponses[TRequest['kind']] | null,
    TProgress
  > = {},
): EnvelopeChannel<TRequest, TResponses, TEnvelope, TProgress> {
  const channel = createWorkerChannel<
    Enveloped<TRequest, TEnvelope>,
    TResponses[TRequest['kind']] | null,
    TProgress
  >(source, options);
  return {
    request: <TKind extends TRequest['kind']>(
      request: KindRequest<TRequest, TKind>,
      envelope: TEnvelope,
      callOptions?: WorkerRequestOptions<TProgress>,
    ) =>
      // The structured clone of the answer is read as the answer of the
      // request's kind: the one place the worker's contract is trusted.
      channel.request({ ...envelope, request }, callOptions) as Promise<
        TResponses[TKind]
      >,
    post: async (envelope, callOptions) => {
      const alone: Enveloped<TRequest, TEnvelope> = envelope;
      await channel.request(alone, callOptions);
    },
    get pendingCount() {
      return channel.pendingCount;
    },
    cancel: () => channel.cancel(),
    terminate: () => channel.terminate(),
  };
}
