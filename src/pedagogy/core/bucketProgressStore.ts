import { isPlainRecord } from '../../state/core/mergeStored.ts';

import type { ProgressRecords, ProgressStore } from './progress.ts';

/**
 * The two calls {@link bucketProgressStore} makes on a bucket: the part of what
 * `persistBucket` returns that it uses, so a course's own binding or a test can
 * hand in anything that reads and writes.
 */
export interface ProgressBucket<TBucket extends object> {
  /** What the bucket holds now. */
  read(): { value: TBucket };
  /** Store the bucket as it now stands. */
  write(value: TBucket): void;
}

/** What {@link bucketProgressStore} is built from. */
export interface BucketProgressStoreOptions<TBucket extends object, TProgress> {
  /** The bucket the records live in, as `persistBucket` builds it. */
  bucket: ProgressBucket<TBucket>;
  /**
   * The field of the bucket that holds the records, for a page that keeps
   * several sets of them — one per seed, one per series — or other state
   * besides them in the same bucket.
   * @default undefined — the whole bucket is the records
   */
  field?: string;
  /**
   * Turns one stored record into one the page can trust, such as
   * `mergeExerciseProgress` or a merge over the tool's own blank record.
   * @default undefined — a stored record is handed back as it was written
   */
  readRecord?: (stored: unknown) => TProgress;
  /**
   * How the binding names itself on the page.
   * @default 'this browser'
   */
  name?: string;
}

/**
 * Keep the work of the exercises inside a bucket the page already owns.
 *
 * A site that keeps its progress next to its preferences, or keeps one set of
 * records per seed a teacher hands out, gets the same `ProgressStore` the
 * exercise components expect without opening a second storage entry. Saving
 * with a `field` rewrites only that field and leaves the rest of the bucket as
 * it is.
 * @param options - The bucket, where in it the records sit, and how a stored
 * record is read.
 * @returns The binding, ready to be handed to the page.
 */
export function bucketProgressStore<
  TBucket extends object,
  TProgress extends object,
>(
  options: BucketProgressStoreOptions<TBucket, TProgress>,
): ProgressStore<TProgress> {
  const { bucket, field, readRecord, name = 'this browser' } = options;
  return {
    name,
    load(): ProgressRecords<TProgress> {
      const value = bucket.read().value as Record<string, unknown>;
      const stored = field === undefined ? value : value[field];
      const records: ProgressRecords<TProgress> = {};
      if (!isPlainRecord(stored)) return records;
      for (const [id, record] of Object.entries(stored)) {
        if (!isPlainRecord(record)) continue;
        records[id] =
          readRecord === undefined ? (record as TProgress) : readRecord(record);
      }
      return records;
    },
    save(records: ProgressRecords<TProgress>): void {
      if (field === undefined) {
        bucket.write(records as unknown as TBucket);
        return;
      }
      const { value } = bucket.read();
      bucket.write({ ...value, [field]: records });
    },
  };
}
