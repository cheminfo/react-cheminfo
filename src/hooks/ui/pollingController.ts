import { toError } from '../../error/core/toError.ts';

/** How a backend is asked again and again until it is done. */
export interface PollingOptions<TValue> {
  /**
   * Milliseconds between the end of one poll and the start of the next, or a
   * function of the latest answer — short while a job runs, long while idle.
   */
  interval: number | ((value: TValue) => number);
  /**
   * Milliseconds before a failed poll is tried again.
   * @default the interval when it is a number, otherwise 10 000
   */
  retryInterval?: number;
  /**
   * Whether an answer is final, which stops the polling.
   * @default undefined — the polling never stops by itself
   */
  isDone?: (value: TValue) => boolean;
  /**
   * Whether nothing is asked while the tab is hidden. The next poll then runs
   * as soon as the tab is shown again.
   * @default true
   */
  pauseWhenHidden?: boolean;
}

/** What the polling has learned so far. */
export interface PollingSnapshot<TValue> {
  /** The latest answer, kept through a failed poll. */
  value: TValue | undefined;
  /** Why the latest poll failed, or `undefined` when it answered. */
  error: Error | undefined;
  /** Whether an answer was final and the polling stopped. */
  done: boolean;
}

/** The snapshot before anything was asked. */
export const POLLING_IDLE: PollingSnapshot<never> = {
  value: undefined,
  error: undefined,
  done: false,
};

/** What one run of the polling is started from. */
export interface PollingRun<TValue> {
  /** Asks the backend once. */
  fetcher: () => Promise<TValue>;
  /** Whether the polling runs at all. */
  enabled: boolean;
}

/**
 * Whether the polling now describes another run than before, so what the
 * previous run learned — the answer of another job, a `done` that no longer
 * holds — must be forgotten rather than shown until the first new answer.
 * @param previous - The run the snapshot on screen came from.
 * @param next - The run asked for now.
 * @returns True when the fetcher changed or the polling was switched.
 */
export function isNewPollingRun<TValue>(
  previous: PollingRun<TValue>,
  next: PollingRun<TValue>,
): boolean {
  return previous.fetcher !== next.fetcher || previous.enabled !== next.enabled;
}

const DEFAULT_RETRY_INTERVAL = 10_000;

/**
 * Poll `fetcher` until an answer is final, one request at a time.
 *
 * The next poll is scheduled once the previous one settled, so requests never
 * stack and a slow backend is not asked faster than it answers.
 * @param fetcher - Asks the backend once.
 * @param options - See {@link PollingOptions}.
 * @param onUpdate - Receives every new snapshot.
 * @returns Stops the polling; an answer still in flight is then ignored.
 */
export function startPolling<TValue>(
  fetcher: () => Promise<TValue>,
  options: PollingOptions<TValue>,
  onUpdate: (snapshot: PollingSnapshot<TValue>) => void,
): () => void {
  const { interval, isDone, pauseWhenHidden = true } = options;
  const retryInterval =
    options.retryInterval ??
    (typeof interval === 'number' ? interval : DEFAULT_RETRY_INTERVAL);
  const document = pauseWhenHidden
    ? (globalThis.document as Document | undefined)
    : undefined;

  let stopped = false;
  let waitingForVisible = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let snapshot: PollingSnapshot<TValue> = POLLING_IDLE;

  function publish(next: PollingSnapshot<TValue>): void {
    snapshot = next;
    onUpdate(next);
  }

  async function poll(): Promise<void> {
    timer = undefined;
    if (stopped) return;
    if (document?.visibilityState === 'hidden') {
      waitingForVisible = true;
      return;
    }
    try {
      const value = await fetcher();
      if (stopped) return;
      const done = isDone?.(value) ?? false;
      publish({ value, error: undefined, done });
      if (done) return;
      const delay = typeof interval === 'number' ? interval : interval(value);
      timer = setTimeout(() => void poll(), delay);
    } catch (error) {
      if (stopped) return;
      publish({ ...snapshot, error: toError(error) });
      timer = setTimeout(() => void poll(), retryInterval);
    }
  }

  function onVisibilityChange(): void {
    if (!waitingForVisible || document?.visibilityState === 'hidden') return;
    waitingForVisible = false;
    void poll();
  }

  document?.addEventListener('visibilitychange', onVisibilityChange);
  void poll();

  return () => {
    stopped = true;
    if (timer !== undefined) clearTimeout(timer);
    document?.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
