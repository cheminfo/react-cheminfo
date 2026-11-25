/**
 * An answer, and the buffers its handler hands over with it rather than
 * copies. A handler that answers several kinds of request knows, while its
 * answer is still typed by its kind, which buffers it holds — a sampled grid,
 * the planes of an image, a table's columns — so it lists them there, once,
 * instead of a `transfer` option guessing them from an untyped answer.
 */
export class HandOver<TResponse> {
  /** The answer posted to the page. */
  public readonly response: TResponse;
  /** Its buffers and bitmaps, each once, handed over rather than copied. */
  public readonly transfer: readonly Transferable[];

  /**
   * An answer and its buffers.
   * @param response - The answer.
   * @param transfer - Its buffers and bitmaps.
   */
  public constructor(response: TResponse, transfer: readonly Transferable[]) {
    this.response = response;
    this.transfer = transfer;
  }
}

/**
 * An answer handed over with its buffers (see {@link HandOver}).
 * @param response - The answer.
 * @param transfer - Its buffers and bitmaps, each once.
 * @returns What the handler returns to `serveWorkerRequests`.
 */
export function handOver<TResponse>(
  response: TResponse,
  transfer: readonly Transferable[],
): HandOver<TResponse> {
  return new HandOver(response, transfer);
}
