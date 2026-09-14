import { errorMessage } from '../../error/core/toError.ts';

import type {
  WorkerProgressMessage,
  WorkerResponseMessage,
} from './messages.ts';
import { isCancelMessage, isRequestMessage } from './messages.ts';
import type { WorkerJobContext } from './workerChannelTypes.ts';

/** As much of a dedicated worker's global scope as {@link serveWorkerRequests} uses. */
export interface WorkerScopeLike {
  /** Listen to what the page posts. */
  addEventListener(
    type: 'message',
    listener: (event: { data: unknown }) => void,
  ): void;
  /** Answer the page, handing over the listed buffers. */
  postMessage(message: unknown, transfer?: Transferable[]): void;
}

/** Where {@link serveWorkerRequests} listens, and what it hands over. */
export interface ServeWorkerRequestsOptions<TRequest, TResponse> {
  /**
   * The scope to serve.
   * @default the global scope, when the code runs in a dedicated worker
   */
  scope?: WorkerScopeLike;
  /**
   * Checks that a request has the shape the handler expects; one that does not
   * is answered with a failure and never reaches the handler.
   * @default undefined — every request is handed over as it came
   */
  accepts?: (request: unknown) => request is TRequest;
  /**
   * The buffers of an answer to hand over rather than copy, e.g. the grid of
   * a sampled orbital.
   * @default undefined — every answer is copied
   */
  transfer?: (response: TResponse) => Transferable[];
}

/**
 * The worker's half of `createWorkerChannel`: answer every request the page
 * posts with what the handler returns.
 *
 * The handler receives a signal that is aborted when the page sends the cancel
 * message of a `cooperativeCancel` channel, and a `reportProgress` that posts
 * news the caller's `onProgress` receives. A failure travels back as its
 * message. Called in a module that the page also imports for its in-process
 * fallback, it attaches nothing there, because that scope is not a worker's.
 * @param handler - Runs one job; may be async.
 * @param options - See {@link ServeWorkerRequestsOptions}.
 * @returns Whether a scope was found and is now served.
 */
export function serveWorkerRequests<TRequest, TResponse, TProgress = never>(
  handler: (
    request: TRequest,
    context: WorkerJobContext<TProgress>,
  ) => TResponse | Promise<TResponse>,
  options: ServeWorkerRequestsOptions<TRequest, TResponse> = {},
): boolean {
  const { accepts, transfer } = options;
  const scope = options.scope ?? dedicatedWorkerScope();
  if (scope === undefined) return false;
  const running = new Map<number, AbortController>();

  scope.addEventListener('message', (event) => {
    const message = event.data;
    if (isCancelMessage(message)) {
      running.get(message.id)?.abort();
      return;
    }
    if (!isRequestMessage(message)) return;

    const { id, request } = message;
    if (accepts !== undefined && !accepts(request)) {
      answer(scope, {
        id,
        ok: false,
        message: 'not a request this worker handles',
      });
      return;
    }
    const controller = new AbortController();
    running.set(id, controller);
    const context: WorkerJobContext<TProgress> = {
      signal: controller.signal,
      reportProgress: (progress) => {
        if (controller.signal.aborted) return;
        const news: WorkerProgressMessage<TProgress> = { id, progress };
        scope.postMessage(news);
      },
    };

    void Promise.resolve()
      .then(() => handler(request as TRequest, context))
      .then(
        (response) => {
          answer(scope, { id, ok: true, response }, transfer);
        },
        (error: unknown) => {
          answer(scope, { id, ok: false, message: errorMessage(error) });
        },
      )
      .finally(() => {
        running.delete(id);
      });
  });
  return true;
}

function answer<TResponse>(
  scope: WorkerScopeLike,
  message: WorkerResponseMessage<TResponse>,
  transfer?: (response: TResponse) => Transferable[],
): void {
  try {
    if (transfer === undefined || !message.ok) scope.postMessage(message);
    else scope.postMessage(message, transfer(message.response));
  } catch (error) {
    // An answer that cannot be listed or cloned still has to end the job on the page.
    scope.postMessage({
      id: message.id,
      ok: false,
      message: errorMessage(error),
    });
  }
}

function dedicatedWorkerScope(): WorkerScopeLike | undefined {
  const candidate = globalThis as {
    postMessage?: unknown;
    addEventListener?: unknown;
    window?: unknown;
  };
  if (
    typeof candidate.postMessage !== 'function' ||
    typeof candidate.addEventListener !== 'function' ||
    candidate.window !== undefined
  ) {
    return undefined;
  }
  return globalThis as unknown as WorkerScopeLike;
}
