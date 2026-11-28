/**
 * A shared promise as one caller waits on it: the caller gives up when its
 * signal aborts, while the promise itself goes on for the others.
 * @param promise - What is waited for.
 * @param signal - What stops this caller's wait.
 * @returns The promise itself without a signal; otherwise what it gives, or a
 * rejection with the signal's reason (an `AbortError` when it gave none) once
 * the signal aborts.
 */
export function untilAborted<T>(
  promise: Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  if (signal === undefined) return promise;
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(abortReason(signal));
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener('abort', abort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', abort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener('abort', abort);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

function abortReason(signal: AbortSignal): Error {
  return signal.reason instanceof Error
    ? signal.reason
    : new DOMException('the wait was given up', 'AbortError');
}
