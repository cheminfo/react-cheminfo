/**
 * Where the work a student did is kept, and how it is read back.
 *
 * The browser is the only binding there is by default; a course hosting its own
 * service implements the same two calls and is plugged in instead, without
 * anything else in the page knowing where the work went.
 */

import { readJsonEntry, writeJsonEntry } from './jsonStorage.ts';
import type { ExerciseStatus } from './types.ts';

/** What is remembered about one exercise. */
export interface ExerciseProgress {
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
 * Read one stored record over its defaults, field by field.
 *
 * A stored field is taken only when it has the same shape as its default, so a
 * payload written by an older version of the page, or a corrupted one, falls
 * back field by field rather than wholesale — and a field added after the last
 * save simply keeps its default. A `null` default accepts anything.
 * @param stored - Whatever came out of the store for this exercise.
 * @param defaults - The record a fresh exercise starts from.
 * @returns A complete record, with nothing unreadable carried over.
 */
export function mergeProgressRecord<TProgress extends object>(
  stored: unknown,
  defaults: TProgress,
): TProgress {
  const merged = { ...defaults } as Record<string, unknown>;
  if (!isPlainRecord(stored)) return merged as TProgress;
  for (const [field, fallback] of Object.entries(defaults)) {
    const value = stored[field];
    if (value !== undefined && isSameShape(fallback, value)) {
      merged[field] = value;
    }
  }
  return merged as TProgress;
}

/**
 * Read one stored {@link ExerciseProgress}, with its two constrained fields
 * checked rather than merely shape-matched: a status outside the three the
 * page knows reads as `idle`, and a hint count that is negative or fractional
 * reads as none revealed.
 * @param stored - Whatever came out of the store for this exercise.
 * @returns A record the page can trust.
 */
export function mergeExerciseProgress(stored: unknown): ExerciseProgress {
  const merged = mergeProgressRecord(stored, emptyProgress());
  return {
    ...merged,
    status: STATUSES.has(merged.status) ? merged.status : 'idle',
    hintsRevealed:
      merged.hintsRevealed > 0 ? Math.floor(merged.hintsRevealed) : 0,
  };
}

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
   * read over it with {@link mergeProgressRecord}; when left out, a stored
   * record is handed back as it was written.
   * @default undefined
   */
  defaults?: TProgress;
  /**
   * How the binding names itself on the page.
   * @default 'this browser'
   */
  name?: string;
}

/**
 * Keep the work in `localStorage`, under one namespaced and versioned entry.
 * @param options - Which entry to use, and what a fresh record looks like.
 * @returns The binding, ready to be handed to the page.
 */
export function localStorageProgressStore<TProgress extends object>(
  options: LocalStorageProgressStoreOptions<TProgress>,
): ProgressStore<TProgress> {
  const { key, version = 1, defaults, name = 'this browser' } = options;
  const storageKey = `${key}:v${version}`;
  return {
    name,
    load(): ProgressRecords<TProgress> {
      const records: ProgressRecords<TProgress> = {};
      const stored = readJsonEntry(storageKey);
      if (!isPlainRecord(stored)) return records;
      for (const [id, value] of Object.entries(stored)) {
        if (!isPlainRecord(value)) continue;
        records[id] =
          defaults === undefined
            ? (value as TProgress)
            : mergeProgressRecord(value, defaults);
      }
      return records;
    },
    save(records: ProgressRecords<TProgress>): void {
      writeJsonEntry(storageKey, records);
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

const STATUSES: ReadonlySet<ExerciseStatus> = new Set([
  'idle',
  'attempted',
  'solved',
]);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSameShape(fallback: unknown, stored: unknown): boolean {
  if (fallback === null) return true;
  if (Array.isArray(fallback) !== Array.isArray(stored)) return false;
  return typeof fallback === typeof stored && stored !== null;
}
