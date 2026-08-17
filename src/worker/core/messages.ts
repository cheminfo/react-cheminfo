/** What a channel posts to its worker: one job, tagged with an identifier. */
export interface WorkerRequestMessage<TRequest> {
  /** Serial number of the request, which the answer must echo. */
  id: number;
  /** The job itself, exactly as the caller wrote it. */
  request: TRequest;
}

/**
 * What a worker posts back. An `Error` does not survive the boundary, so a
 * failure travels as its message and becomes an `Error` again on this side.
 */
export type WorkerResponseMessage<TResponse> =
  | { id: number; ok: true; response: TResponse }
  | { id: number; ok: false; message: string };

/**
 * As much of a `Worker` as a channel uses. A real `Worker` satisfies it, and so
 * does anything else that speaks the same three calls — which is what lets the
 * scheduling be unit-tested without a thread.
 */
export interface WorkerLike {
  /** Send one message to the worker. */
  postMessage(message: unknown): void;
  /** Listen to what the worker answers, or to its failing outright. */
  addEventListener(
    type: 'message' | 'error',
    listener: (event: WorkerEventLike) => void,
  ): void;
  /** Stop the worker; whatever it was doing is lost. */
  terminate(): void;
}

/** As much of a worker event as a channel reads. */
export interface WorkerEventLike {
  /**
   * The message the worker posted, before anything checks it against the
   * protocol. Absent on an error event.
   * @default undefined
   */
  readonly data?: unknown;
  /**
   * What went wrong, on an error event. Absent on a message event.
   * @default undefined
   */
  readonly message?: string;
}
