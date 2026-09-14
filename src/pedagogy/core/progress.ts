/**
 * Where the work a student did is kept, and how it is read back.
 *
 * The browser is the only binding there is by default; a course hosting its own
 * service implements the same two calls and is plugged in instead, without
 * anything else in the page knowing where the work went.
 */

import { isPlainRecord, mergeStored } from '../../state/core/mergeStored.ts';
import {
  readStorageEntry,
  versionedStorageKey,
  writeStorageEntry,
} from '../../state/core/storageEntry.ts';

import type { ExerciseStatus } from './types.ts';

/** What is remembered about one exercise. */
export interface ExerciseProgress {
  /** Where the student stands on it: untouched, handed in, or right. */
  status: ExerciseStatus;
  /** What the student last wrote or drew, exactly as they left it. */
  answer: string;
  /**
   * How many hints of the ladder were opened. A count, not a flag per hint:
   * the ladder grows, and "solved with two hints" is what a student reads.
   */
  hintsRevealed: number;
  /** Whether the sample answer is on screen. */
  showSolution: boolean;
}

/** Everything a student has done, keyed by exercise id. */
export type ProgressRecords<TProgress = ExerciseProgress> = Record<
  string,
  TProgress
>;

/**
 * Where the results of the exercises are kept.
 *
 * A binding that answers over the network returns a promise from either call;
 * what {@link ProgressStore.load} resolves to replaces whatever the page
 * started from.
 */
export interface ProgressStore<TProgress = ExerciseProgress> {
  /** How the binding names itself, for a sentence about it on the page. */
  readonly name: string;
  /** Give back everything that was stored. */
  load: () => ProgressRecords<TProgress> | Promise<ProgressRecords<TProgress>>;
  /** Keep everything, as it stands after a change. */
  save: (records: ProgressRecords<TProgress>) => void | Promise<void>;
}

/**
 * The record an exercise nobody has touched starts from.
 * @returns A blank record.
 */
export function emptyProgress(): ExerciseProgress {
  return { status: 'idle', answer: '', hintsRevealed: 0, showSolution: false };
}

/**
 * Read one stored {@link ExerciseProgress} into a record the page can trust.
 *
 * The record is merged over {@link emptyProgress} field by field, as a
 * preferences bucket is, and its two constrained fields are checked rather
 * than merely shape-matched: a status outside the three the page knows reads
 * as `idle`, and a hint count that is negative, fractional or not finite reads
 * as the whole hints it names, none when below one.
 * @param stored - Whatever came out of the store for this exercise.
 * @returns A complete record.
 */
export function mergeExerciseProgress(stored: unknown): ExerciseProgress {
  const merged = mergeStored(emptyProgress(), stored);
  const { status, hintsRevealed } = merged;
  return {
    ...merged,
    status: EXERCISE_STATUSES.has(status) ? status : 'idle',
    hintsRevealed:
      Number.isFinite(hintsRevealed) && hintsRevealed >= 1
        ? Math.floor(hintsRevealed)
        : 0,
  };
}

const EXERCISE_STATUSES: ReadonlySet<string> = new Set([
  'idle',
  'attempted',
  'solved',
]);

/** What {@link localStorageProgressStore} is built from. */
export interface LocalStorageProgressStoreOptions<TProgress> {
  /** Namespace of the entry, without the version: `smiles:exercises`. */
  key: string;
  /**
   * Bumped when the shape of a record changes, so a future shape can ignore
   * today's entries instead of misreading them.
   * @default 1
   */
  version?: number;
  /**
   * The record a fresh exercise starts from. When given, every stored record is
   * merged over it field by field, as a preferences bucket is: a missing field
   * keeps its default, a field of the wrong shape is discarded, and a field the
   * defaults do not name is kept. When left out, a stored record is handed back
   * as it was written.
   * @default undefined
   */
  defaults?: TProgress;
  /**
   * How the binding names itself on the page.
   * @default 'this browser'
   */
  name?: string;
  /**
   * Called when a save was refused because the store is full, so the page can
   * tell the student their work is no longer being kept.
   * @default undefined
   */
  onQuotaExceeded?: (error: unknown) => void;
}

/**
 * Keep the work in `localStorage`, under one namespaced and versioned entry.
 * @param options - Which entry to use, and what a fresh record looks like.
 * @returns The binding, ready to be handed to the page.
 */
export function localStorageProgressStore<TProgress extends object>(
  options: LocalStorageProgressStoreOptions<TProgress>,
): ProgressStore<TProgress> {
  const {
    key,
    version = 1,
    defaults,
    name = 'this browser',
    onQuotaExceeded,
  } = options;
  const storageKey = versionedStorageKey(key, version);
  return {
    name,
    load(): ProgressRecords<TProgress> {
      const records: ProgressRecords<TProgress> = {};
      const stored = readStorageEntry(storageKey);
      if (!isPlainRecord(stored)) return records;
      for (const [id, value] of Object.entries(stored)) {
        if (!isPlainRecord(value)) continue;
        records[id] =
          defaults === undefined
            ? (value as TProgress)
            : mergeStored(defaults, value);
      }
      return records;
    },
    save(records: ProgressRecords<TProgress>): void {
      writeStorageEntry(storageKey, records, onQuotaExceeded);
    },
  };
}

/** How far through a set of exercises a student is. */
export interface ProgressSummary {
  /** How many are right. */
  solved: number;
  /** How many were handed in and are not right yet. */
  attempted: number;
  /** How many there are to do. */
  total: number;
  /** `solved / total`, and 0 when there is nothing to do. */
  ratio: number;
}

/**
 * Count where a student stands, for the progress bar over a set.
 * @param records - What the store gave back.
 * @param ids - The exercises of the set being counted. Pass them whenever the
 * bar must read against the whole set: without them only the exercises that
 * were touched are counted, and the bar would sit at 100% on the first answer.
 * @returns The counts and the ratio the bar is drawn from.
 */
export function progressSummary<TProgress extends { status: ExerciseStatus }>(
  records: ProgressRecords<TProgress>,
  ids?: readonly string[],
): ProgressSummary {
  const keys = ids ?? Object.keys(records);
  let solved = 0;
  let attempted = 0;
  for (const id of keys) {
    const status = records[id]?.status;
    if (status === 'solved') solved++;
    else if (status === 'attempted') attempted++;
  }
  const total = keys.length;
  return { solved, attempted, total, ratio: total === 0 ? 0 : solved / total };
}
