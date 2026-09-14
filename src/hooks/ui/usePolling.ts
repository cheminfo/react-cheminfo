import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  PollingOptions,
  PollingRun,
  PollingSnapshot,
} from './pollingController.ts';
import {
  POLLING_IDLE,
  isNewPollingRun,
  startPolling,
} from './pollingController.ts';

/** What {@link usePolling} is given. */
export interface UsePollingOptions<TValue> extends PollingOptions<TValue> {
  /**
   * Whether the polling runs. Turning it off stops it and forgets what it
   * learned; turning it on starts a fresh run.
   * @default true
   */
  enabled?: boolean;
}

/** Where the polling stands, and how to start it over. */
export interface PollingState<TValue> extends PollingSnapshot<TValue> {
  /** Forget what was learned and poll again from now, e.g. after a job was launched. */
  restart: () => void;
}

/**
 * Poll a backend job until it is done.
 *
 * One request at a time: the next poll is scheduled once the previous one
 * settled, a failed poll keeps the last answer and is retried, and nothing is
 * asked while the tab is hidden. A new `fetcher` — the status of another job —
 * starts a fresh run and forgets what the previous one learned, as turning
 * `enabled` off and on and `restart` do, so pass a stable function; `interval`
 * and `isDone` are read at each poll and may be inline.
 * @param fetcher - Asks the backend once.
 * @param options - See {@link UsePollingOptions}.
 * @returns The latest answer, the latest failure, whether it is done, and `restart`.
 */
export function usePolling<TValue>(
  fetcher: () => Promise<TValue>,
  options: UsePollingOptions<TValue>,
): PollingState<TValue> {
  const {
    enabled = true,
    interval,
    retryInterval,
    isDone,
    pauseWhenHidden = true,
  } = options;
  const [snapshot, setSnapshot] =
    useState<PollingSnapshot<TValue>>(POLLING_IDLE);
  const [run, setRun] = useState(0);
  const [currentRun, setCurrentRun] = useState<PollingRun<TValue>>({
    fetcher,
    enabled,
  });
  if (isNewPollingRun(currentRun, { fetcher, enabled })) {
    setCurrentRun({ fetcher, enabled });
    setSnapshot(POLLING_IDLE);
  }

  const latestRef = useRef({ interval, isDone });
  useEffect(() => {
    latestRef.current = { interval, isDone };
  });

  const fixedRetryInterval =
    retryInterval ?? (typeof interval === 'number' ? interval : undefined);

  useEffect(() => {
    if (!enabled) return;
    return startPolling(
      fetcher,
      {
        interval: (value) => {
          const current = latestRef.current.interval;
          return typeof current === 'number' ? current : current(value);
        },
        retryInterval: fixedRetryInterval,
        isDone: (value) => latestRef.current.isDone?.(value) ?? false,
        pauseWhenHidden,
      },
      setSnapshot,
    );
  }, [fetcher, enabled, run, fixedRetryInterval, pauseWhenHidden]);

  const restart = useCallback(() => {
    setSnapshot(POLLING_IDLE);
    setRun((count) => count + 1);
  }, []);

  return useMemo(() => ({ ...snapshot, restart }), [snapshot, restart]);
}
