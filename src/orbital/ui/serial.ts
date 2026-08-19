/**
 * Running asynchronous work one piece at a time.
 *
 * Everything the viewer does mutates one canvas, and it does it across an
 * `await`: replacing an orbital removes the surfaces on screen before it has
 * finished building the new ones. Two of those interleaved both add their own
 * pair and only one of them is remembered, so the atom ends up wearing several
 * orbitals at once and the ones nobody recorded can never be removed again.
 */

/** Runs what it is given after everything handed to it before. */
export interface SerialRunner {
  /**
   * Queue `task`, and resolve to what it returns.
   * @param task - The work to run once the queue reaches it.
   * @returns What `task` resolved to; its rejection reaches this caller alone.
   */
  run: <Result>(task: () => Promise<Result>) => Promise<Result>;
}

/**
 * A queue of one.
 * @returns The runner. A task that throws is reported to whoever queued it and
 * never stalls the tasks behind it.
 */
export function createSerialRunner(): SerialRunner {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    run: <Result>(task: () => Promise<Result>): Promise<Result> => {
      const result = tail.then(task);
      tail = result.catch(() => undefined);
      return result;
    },
  };
}
