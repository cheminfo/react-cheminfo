/**
 * The progress of a page of exercises, kept in a site's own signal and saved
 * through a {@link ProgressStore} whenever it changes.
 *
 * Best effort: a store that answers later (over the network) fills the signal
 * once it does, and a store that refuses to save never breaks an exercise.
 */

import type { SignalEffect } from '../../state/core/persistSignalBucket.ts';

import type { ProgressRecords, ProgressStore } from './progress.ts';

/** What {@link keepProgress} is given beside the signal. */
export interface KeepProgressOptions<TProgress> {
  /** Where the records are loaded from and saved to. */
  store: ProgressStore<TProgress>;
  /** `effect` from the site's signals, which saves after every change. */
  effect: SignalEffect;
  /**
   * Read one stored record into a complete one, defaults filled and every
   * field of the wrong shape dropped: `mergeExerciseProgress` for the family's
   * record, a site's own reader for a record that carries more.
   */
  read: (stored: unknown) => TProgress;
}

/** The actions on progress kept by {@link keepProgress}. */
export interface KeptProgress<TProgress> {
  /** One exercise's record, complete even when it was never opened. */
  progressOf: (id: string) => TProgress;
  /** Change some fields of one exercise's record, the others kept. */
  updateProgress: (id: string, patch: Partial<TProgress>) => void;
  /** Forget the work done on these exercises. */
  clearProgress: (ids: readonly string[]) => void;
}

/**
 * Fill a signal with the progress a store holds, save it back on every change,
 * and return the three actions a page of exercises performs on it.
 * @param records - The site's signal of records by exercise id.
 * @param records.value - The records, replaced on every change.
 * @param options - The store, the site's `effect` and the record reader.
 * @returns The actions.
 */
export function keepProgress<TProgress>(
  records: { value: ProgressRecords<TProgress> },
  options: KeepProgressOptions<TProgress>,
): KeptProgress<TProgress> {
  const { store, effect, read } = options;
  const loaded = store.load();
  if (loaded instanceof Promise) {
    void loaded.then((stored) => {
      records.value = stored;
    });
  } else {
    records.value = loaded;
  }
  effect(() => {
    void store.save(records.value);
  });

  function progressOf(id: string): TProgress {
    return read(records.value[id]);
  }

  return {
    progressOf,
    updateProgress(id, patch) {
      records.value = {
        ...records.value,
        [id]: { ...progressOf(id), ...patch },
      };
    },
    clearProgress(ids) {
      const forgotten = new Set(ids);
      const next: ProgressRecords<TProgress> = {};
      for (const [id, record] of Object.entries(records.value)) {
        if (!forgotten.has(id)) next[id] = record;
      }
      records.value = next;
    },
  };
}
