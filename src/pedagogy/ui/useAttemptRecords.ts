import { useSyncExternalStore } from 'react';

import type { Attempt, AttemptStore } from '../core/attempts.ts';
import type { ProgressRecords } from '../core/progress.ts';

/**
 * Every attempt a store holds, re-rendering the component whenever one
 * changes.
 * @param store - The site's attempt store.
 * @returns The records, keyed by attempt key.
 */
export function useAttemptRecords(
  store: AttemptStore,
): ProgressRecords<Attempt> {
  return useSyncExternalStore(store.subscribe, store.records, store.records);
}
