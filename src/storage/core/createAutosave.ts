import { toError } from '../../error/core/toError.ts';

import { watchPageLeave } from './watchPageLeave.ts';

/** How {@link createAutosave} writes. */
export interface AutosaveOptions<T> {
  /** Writes one value: the latest one scheduled. */
  write: (value: T) => Promise<void> | void;
  /**
   * Milliseconds of quiet after the last change before it is written.
   * @default 500
   */
  delay?: number;
  /**
   * The longest a change waits while changes keep coming, so a visitor who
   * never pauses still has their work written.
   * @default 2000
   */
  maxWait?: number;
  /**
   * Told when a write fails. The value is not tried again: the next change
   * carries the whole state and is written in its place.
   * @default the failure is dropped
   */
  onError?: (error: Error) => void;
  /**
   * Write at once when the page is hidden or left.
   * @default true
   */
  flushOnLeave?: boolean;
}

/** An autosave: changes go in, at most one write at a time comes out. */
export interface Autosave<T> {
  /** Ask for a value to be written; a later value replaces it. */
  schedule: (value: T) => void;
  /**
   * Write the pending value now. The value is taken when this is called, so
   * a value scheduled right after is not mixed into it.
   * @returns Once every write asked for so far has finished.
   */
  flush: () => Promise<void>;
  /** Drop the pending value without writing it. */
  cancel: () => void;
  /** Whether a value waits to be written. */
  isPending: () => boolean;
  /**
   * Write what is pending and stop listening to the page.
   * @returns Once the last write has finished.
   */
  dispose: () => Promise<void>;
}

/**
 * Write a changing value without writing it on every change.
 *
 * Writes never overlap and land in the order they were asked for: a slow write
 * holds the next one back rather than racing it. On a crash, what is lost is at
 * most `maxWait` milliseconds of work.
 * @param options - See {@link AutosaveOptions}.
 * @returns The autosave.
 */
export function createAutosave<T>(options: AutosaveOptions<T>): Autosave<T> {
  const { write, delay = 500, maxWait = 2000, onError } = options;
  const { flushOnLeave = true } = options;
  let next: { value: T } | null = null;
  let firstChange: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let writing: Promise<void> = Promise.resolve();

  function stopTimer(): void {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }

  function writePending(): Promise<void> {
    stopTimer();
    firstChange = undefined;
    const taken = next;
    next = null;
    if (taken) {
      writing = writing.then(async () => {
        try {
          await write(taken.value);
        } catch (error) {
          onError?.(toError(error));
        }
      });
    }
    return writing;
  }

  const stopListening = flushOnLeave
    ? watchPageLeave(() => {
        void writePending();
      })
    : () => undefined;

  return {
    schedule: (value) => {
      next = { value };
      const now = Date.now();
      firstChange ??= now;
      stopTimer();
      const wait = Math.max(0, Math.min(delay, firstChange + maxWait - now));
      timer = setTimeout(() => {
        void writePending();
      }, wait);
    },
    flush: writePending,
    cancel: () => {
      stopTimer();
      firstChange = undefined;
      next = null;
    },
    isPending: () => next !== null,
    dispose: () => {
      stopListening();
      return writePending();
    },
  };
}
