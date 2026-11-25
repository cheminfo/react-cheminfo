/**
 * A worker channel whose requests carry a `kind`, each kind answered with its
 * own type: the page asks `request({ kind: 'planes', … })` and is handed the
 * planes, not the union of every answer the worker gives. A worker of the
 * family answers each request with the answer of its kind
 * (`serveWorkerRequests`), so the answer's type is read from the request's
 * kind here, in one place, rather than restored by a cast at every caller.
 */

import { createWorkerChannel } from './workerChannel.ts';
import type {
  WorkerChannelOptions,
  WorkerRequestOptions,
  WorkerSource,
} from './workerChannelTypes.ts';

/**
 * The request of one kind: the members of the union whose `kind` it is. It
 * is written as a map indexed by the kind, so a request a caller holds typed
 * by a kind of its own type parameter is accepted as it is, never cast.
 */
export type KindRequest<
  TRequest extends { kind: string },
  TKind extends TRequest['kind'],
> = { [Kind in TKind]: Extract<TRequest, { kind: Kind }> }[TKind];

/** A channel typed by request kind. */
export interface KindChannel<
  TRequest extends { kind: string },
  TResponses extends Record<TRequest['kind'], unknown>,
  TProgress = never,
> {
  /**
   * Post one request and wait for the answer of its kind.
   * @param request - The request.
   * @param options - Per-call signal, budget, progress and transfer.
   * @returns The answer.
   */
  request: <TKind extends TRequest['kind']>(
    request: KindRequest<TRequest, TKind>,
    options?: WorkerRequestOptions<TProgress>,
  ) => Promise<TResponses[TKind]>;
  /** How many requests are still waiting for an answer. */
  readonly pendingCount: number;
  /** Reject every waiting request, leaving the worker alive. */
  cancel: () => void;
  /** Terminate the worker, rejecting everything still waiting. */
  terminate: () => void;
}

/**
 * Turn a worker answering requests by kind into something a page awaits with
 * the answer's type (`createWorkerChannel`, typed by kind).
 * @param source - The worker, or the function that creates it.
 * @param options - See `WorkerChannelOptions`.
 * @default options {}
 * @returns The channel.
 */
export function createKindChannel<
  TRequest extends { kind: string },
  TResponses extends Record<TRequest['kind'], unknown>,
  TProgress = never,
>(
  source: WorkerSource,
  options: WorkerChannelOptions<
    TRequest,
    TResponses[TRequest['kind']],
    TProgress
  > = {},
): KindChannel<TRequest, TResponses, TProgress> {
  const channel = createWorkerChannel<
    TRequest,
    TResponses[TRequest['kind']],
    TProgress
  >(source, options);
  return {
    request: <TKind extends TRequest['kind']>(
      request: KindRequest<TRequest, TKind>,
      callOptions?: WorkerRequestOptions<TProgress>,
    ) =>
      // The structured clone of the answer is read as the answer of the
      // request's kind: the one place the worker's contract is trusted.
      channel.request(request, callOptions) as Promise<TResponses[TKind]>,
    get pendingCount() {
      return channel.pendingCount;
    },
    cancel: () => channel.cancel(),
    terminate: () => channel.terminate(),
  };
}
