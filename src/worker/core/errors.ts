/**
 * Rejection of a request nobody is waiting for any more: its signal was
 * aborted, or the channel it was posted on was terminated.
 *
 * It is the normal outcome of dragging a slider or clicking through a list, so
 * a caller catches it and draws nothing rather than reporting a failure.
 */
export class CancelledRequestError extends Error {
  override name = 'CancelledRequestError';
}

/** Rejection of a request that outlived its budget and was given up on. */
export class RequestTimeoutError extends Error {
  override name = 'RequestTimeoutError';
}
