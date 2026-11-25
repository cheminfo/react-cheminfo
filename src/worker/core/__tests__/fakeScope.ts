import type { WorkerEventLike, WorkerLike } from '../messages.ts';
import type { WorkerScopeLike } from '../serveWorkerRequests.ts';

/**
 * The scope of a dedicated worker, for the tests of `serveWorkerRequests`:
 * what it is sent, what it posts and the buffers it transfers, and a page's
 * side that delivers in both directions a microtask later.
 */
export class FakeScope implements WorkerScopeLike {
  public readonly posted: unknown[] = [];
  public readonly transfers: Array<Transferable[] | undefined> = [];
  public refuse: ((message: unknown) => boolean) | undefined;
  #listener: ((event: { data: unknown }) => void) | undefined;
  #page: ((event: WorkerEventLike) => void) | undefined;

  public addEventListener(
    type: 'message',
    listener: (event: { data: unknown }) => void,
  ): void {
    this.#listener = listener;
  }

  public postMessage(message: unknown, transfer?: Transferable[]): void {
    if (this.refuse?.(message)) {
      throw new Error('the answer could not be cloned');
    }
    this.posted.push(message);
    this.transfers.push(transfer);
    const page = this.#page;
    if (page !== undefined) queueMicrotask(() => page({ data: message }));
  }

  public send(data: unknown): void {
    this.#listener?.({ data });
  }

  /**
   * The page's side of this scope, delivering in both directions a microtask
   * later, as a real worker delivers asynchronously.
   * @returns A worker whose messages reach this scope.
   */
  public connect(): WorkerLike {
    return {
      postMessage: (message) => {
        queueMicrotask(() => this.send(message));
      },
      addEventListener: (type, listener) => {
        if (type === 'message') this.#page = listener;
      },
      terminate: () => undefined,
    };
  }
}
