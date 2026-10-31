/**
 * The worker factory a unit test hands the pool.
 *
 * Node has no `Worker`, so the channels run every job in-process and never
 * call it; it throws so that a test which somehow did reach for a worker fails
 * on the spot rather than hanging.
 */

import type { WorkerLike } from '../../../worker/core/messages.ts';

/**
 * Refuse to make a worker.
 * @throws {Error} Always.
 */
export function noWorker(): WorkerLike {
  throw new Error('A unit test runs the prediction jobs in-process.');
}
