/**
 * A request a backend refused, or could not answer, with the reason it gave.
 *
 * `status` tells a refusal worth retrying from one that is final — a job still
 * running from one that is gone — and `message` is written for the reader.
 */
export class ApiError extends Error {
  override name = 'ApiError';
  /**
   * The status of the refusal: the envelope's `statusCode` when it names one,
   * else the response's. 0 when the server could not be reached at all.
   */
  readonly status: number;
  /**
   * The short name Fastify gives the status, e.g. `Not Found`; the response's
   * status text when the body names none.
   */
  readonly error: string;
  /**
   * The body of the refusal as read — the parsed JSON, or the text when it was
   * none — for a field the envelope does not name.
   */
  readonly body: unknown;

  /**
   * Name a refusal.
   * @param message - The reason, written for the reader.
   * @param options - The status, its name, the body and what caused it.
   */
  constructor(message: string, options: ApiErrorOptions) {
    super(message, { cause: options.cause });
    this.status = options.status;
    this.error = options.error ?? '';
    this.body = options.body;
  }

  /**
   * The status, under the name Fastify's envelope gives it.
   * @returns The same number as `status`.
   */
  get statusCode(): number {
    return this.status;
  }
}

/** What an {@link ApiError} is built from. */
export interface ApiErrorOptions {
  /** The status of the refusal, 0 when the server could not be reached. */
  status: number;
  /**
   * The short name of the status.
   * @default ''
   */
  error?: string;
  /**
   * The body of the refusal as read.
   * @default undefined
   */
  body?: unknown;
  /**
   * What the error was raised from.
   * @default undefined
   */
  cause?: unknown;
}
