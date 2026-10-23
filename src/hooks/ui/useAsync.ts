import { useEffect, useMemo, useState } from 'react';

import type { AsyncState } from './asyncState.ts';
import { ASYNC_LOADING, asyncFailed, asyncSucceeded } from './asyncState.ts';

/**
 * Where a task stands, and whether what is on screen still answers the
 * question being asked.
 */
export type AsyncResult<TData> = AsyncState<TData> & {
  /**
   * True from the moment the question changes — a new task, a new
   * `refreshKey` — until its run settles: the data on screen, if any, answers
   * an earlier question. Also true while the very first run is loading.
   */
  pending: boolean;
};

/**
 * Run an async task and follow where it stands, as a discriminated union.
 *
 * The task runs on mount and again whenever it or `refreshKey` changes. A
 * re-run does not flip the state back to `loading`: what is on screen stays
 * until the new answer arrives, and a refresh that fails keeps it rather than
 * replacing it with an error; `pending` says the answer is stale meanwhile. An
 * answer that arrives after the component unmounted, or after a newer run
 * started, is ignored, and the run's signal is aborted at that moment, so a
 * task that hands it to `fetch` stops asking a question nobody waits for.
 *
 * The task is a dependency, so pass a stable function — declared at module
 * scope, or wrapped in `useCallback` over the values it reads.
 * @param task - The async function to run, handed a signal aborted once its
 * answer is no longer wanted.
 * @param refreshKey - Changing it runs the task again; only its identity
 * matters. Defaults to `undefined`.
 * @returns Where the latest run stands, and whether it is still running.
 */
export function useAsync<TData>(
  task: (signal: AbortSignal) => Promise<TData>,
  refreshKey?: unknown,
): AsyncResult<TData> {
  const [answer, setAnswer] = useState<Answer<TData>>(UNANSWERED);

  useEffect(() => {
    const controller = new AbortController();
    task(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;
        setAnswer({ state: asyncSucceeded(data), task, refreshKey });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setAnswer((previous) => ({
          state: asyncFailed(previous.state, error),
          task,
          refreshKey,
        }));
      },
    );
    return () => {
      controller.abort();
    };
  }, [task, refreshKey]);

  const pending =
    answer.task !== task || !Object.is(answer.refreshKey, refreshKey);
  return useMemo(() => ({ ...answer.state, pending }), [answer.state, pending]);
}

interface Answer<TData> {
  state: AsyncState<TData>;
  task: unknown;
  refreshKey: unknown;
}

const UNANSWERED: Answer<never> = {
  state: ASYNC_LOADING,
  task: null,
  refreshKey: undefined,
};
