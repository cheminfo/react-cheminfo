/**
 * Work given up on, and work nobody waits for. An abort is the normal end of
 * a request whose caller moved on — a slider dragged further, a file picker
 * closed, a share sheet dismissed — so it is recognised in one place, by its
 * name, whatever made it: `signal.throwIfAborted()`, an aborted `fetch`, the
 * browser. Work started without anyone awaiting it ignores exactly the
 * refusals it is expected to meet, and reports anything else, never
 * swallowing a defect.
 */

import { CancelledRequestError } from '../../worker/core/errors.ts';

/**
 * Whether a thrown value is an abort.
 * @param error - What was thrown.
 * @returns `true` for an error named `AbortError`: a `DOMException`, or any
 *   other error a library names so.
 */
export function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

/**
 * Whether a thrown value says the work was given up on: an abort, or a
 * worker request nobody waits for any more (`CancelledRequestError`).
 * @param error - What was thrown.
 * @returns `true` for a cancellation.
 */
export function isCancellation(error: unknown): boolean {
  return error instanceof CancelledRequestError || isAbortError(error);
}

/**
 * Let work run that nobody awaits — telling a worker its new budget, closing
 * what is no longer shown. A refusal it is expected to meet is ignored;
 * anything else is reported as an unhandled rejection (the console's, the test
 * runner's), never swallowed.
 * @param work - The work, started.
 * @param isExpected - Which refusals are expected.
 * @default isExpected a cancellation (`isCancellation`)
 */
export function fireAndForget(
  work: Promise<unknown>,
  isExpected: (error: unknown) => boolean = isCancellation,
): void {
  void work.catch((error: unknown) => {
    if (!isExpected(error)) throw error;
  });
}
