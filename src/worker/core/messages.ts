/** What a channel posts to its worker: one job, tagged with an identifier. */
export interface WorkerRequestMessage<TRequest> {
  /** Serial number of the request, which the answer must echo. */
  id: number;
  /** The job itself, exactly as the caller wrote it. */
  request: TRequest;
}

/**
 * What a channel created with `cooperativeCancel` posts when nobody waits for
 * a job any more, so a worker that checks can stop early.
 */
export interface WorkerCancelMessage {
  /** Serial number of the request to stop. */
  id: number;
  /** Always `true`: this message asks for a stop. */
  cancel: true;
}

/** What a worker posts while a job runs, as often as it has news. */
export interface WorkerProgressMessage<TProgress> {
  /** Serial number of the request the news is about. */
  id: number;
  /** How far the job is, in whatever shape the two sides agreed on. */
  progress: TProgress;
}

/**
 * What a worker posts once a job is over. An `Error` does not survive the
 * boundary, so a failure travels as its message and becomes an `Error` again
 * on this side.
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
  /** Send one message to the worker, handing over the listed buffers. */
  postMessage(message: unknown, transfer?: Transferable[]): void;
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

/**
 * Whether a message is the answer that ends a job.
 * @param message - Whatever was posted.
 * @returns Whether it carries an identifier and a well-formed outcome.
 */
export function isResponseMessage(
  message: unknown,
): message is WorkerResponseMessage<unknown> {
  if (!hasId(message)) return false;
  const candidate = message as { ok?: unknown; message?: unknown };
  if (typeof candidate.ok !== 'boolean') return false;
  return candidate.ok || typeof candidate.message === 'string';
}

/**
 * Whether a message is news about a running job.
 * @param message - Whatever was posted.
 * @returns Whether it carries an identifier and a progress, and no outcome.
 */
export function isProgressMessage(
  message: unknown,
): message is WorkerProgressMessage<unknown> {
  return hasId(message) && 'progress' in message && !('ok' in message);
}

/**
 * Whether a message asks a worker for a job.
 * @param message - Whatever was posted.
 * @returns Whether it carries an identifier and a request.
 */
export function isRequestMessage(
  message: unknown,
): message is WorkerRequestMessage<unknown> {
  return hasId(message) && 'request' in message;
}

/**
 * Whether a message asks a worker to stop a job.
 * @param message - Whatever was posted.
 * @returns Whether it carries an identifier and `cancel: true`.
 */
export function isCancelMessage(
  message: unknown,
): message is WorkerCancelMessage {
  return hasId(message) && (message as { cancel?: unknown }).cancel === true;
}

function hasId(message: unknown): message is { id: number } {
  return (
    typeof message === 'object' &&
    message !== null &&
    typeof (message as { id?: unknown }).id === 'number'
  );
}
