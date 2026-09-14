import { useEffect, useState } from 'react';

import type { AsyncState } from './asyncState.ts';
import { ASYNC_LOADING, asyncFailed, asyncSucceeded } from './asyncState.ts';

/**
 * Run an async task and follow where it stands, as a discriminated union.
 *
 * The task runs on mount and again whenever it or `refreshKey` changes. A
 * re-run does not flip the state back to `loading`: what is on screen stays
 * until the new answer arrives, and a refresh that fails keeps it rather than
 * replacing it with an error. An answer that arrives after the component
 * unmounted, or after a newer run started, is ignored.
 *
 * The task is a dependency, so pass a stable function — declared at module
 * scope, or wrapped in `useCallback` over the values it reads.
 * @param task - The async function to run.
 * @param refreshKey - Changing it runs the task again; only its identity
 * matters. Defaults to `undefined`.
 * @returns Where the latest run stands.
 */
export function useAsync<TData>(
  task: () => Promise<TData>,
  refreshKey?: unknown,
): AsyncState<TData> {
  const [state, setState] = useState<AsyncState<TData>>(ASYNC_LOADING);

  useEffect(() => {
    let cancelled = false;
    task().then(
      (data) => {
        if (!cancelled) setState(asyncSucceeded(data));
      },
      (error: unknown) => {
        if (!cancelled) setState((previous) => asyncFailed(previous, error));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [task, refreshKey]);

  return state;
}
