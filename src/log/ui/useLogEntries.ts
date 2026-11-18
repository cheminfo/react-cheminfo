import type { FifoLogger, LogEntry } from 'fifo-logger';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * What a logger holds, kept up to date as it logs: a page shows the messages
 * of a long run while it is still running, and the list redraws only when
 * something was logged.
 *
 * The logger is named, never read from a context: each result keeps a logger
 * of its own, so a new run replaces its own messages and leaves the others'.
 * react-science's `useFifoLogs` is for the one page-wide logger its
 * `FifoLoggerProvider` holds.
 * @param logger - The logger to read, or nothing while there is none.
 * @returns Its entries, the same array until it logs again.
 */
export function useLogEntries(
  logger: FifoLogger | null | undefined,
): readonly LogEntry[] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (logger == null) return noSubscription;
      const listener = () => {
        snapshots.delete(logger);
        onChange();
      };
      logger.addEventListener('change', listener);
      return () => {
        logger.removeEventListener('change', listener);
      };
    },
    [logger],
  );
  const read = useCallback(() => snapshotOf(logger), [logger]);
  return useSyncExternalStore(subscribe, read, read);
}

// One array per logger until it logs again: `getLogs` builds a new one on every
// call, and a store has to answer the same value while nothing changed.
const snapshots = new WeakMap<FifoLogger, readonly LogEntry[]>();

const NO_ENTRIES: readonly LogEntry[] = [];

function snapshotOf(
  logger: FifoLogger | null | undefined,
): readonly LogEntry[] {
  if (logger == null) return NO_ENTRIES;
  let entries = snapshots.get(logger);
  if (entries === undefined) {
    entries = logger.getLogs({ includeChildren: true });
    snapshots.set(logger, entries);
  }
  return entries;
}

function noSubscription(): void {
  // Nothing was subscribed to.
}
