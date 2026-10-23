/**
 * How far a student has got on a graded series, kept in this browser.
 *
 * Best effort and never a precondition: a framed page whose storage is
 * partitioned still works, it just forgets. An attempt is keyed by tool, series
 * and question, so a new series starts clean and a shared link reopens its own.
 * The store is a plain subscribable value, so a page reads it with React's
 * `useSyncExternalStore` or from a signal of its own, and the series components
 * re-render on it without knowing which.
 */

import { persistBucket } from '../../state/core/persistBucket.ts';

import type { ProgressRecords, ProgressStore } from './progress.ts';
import { localStorageProgressStore } from './progress.ts';
import type { ExerciseStatus } from './types.ts';

/** One question as the student left it. */
export interface Attempt {
  /** Where the student stands on it. */
  status: ExerciseStatus;
  /** What was typed, or drawn, field by field. */
  answers: Record<string, string>;
  /** The answers as they were when last checked, so a change hides the verdict. */
  checked: string | null;
  /** How many hints of the ladder are open. */
  hintsRevealed: number;
  /** Whether the worked answer is on screen. */
  showSolution: boolean;
}

/**
 * What a question looks like before anything is typed into it.
 * @returns A fresh attempt.
 */
export function emptyAttempt(): Attempt {
  return {
    status: 'idle',
    answers: {},
    checked: null,
    hintsRevealed: 0,
    showSolution: false,
  };
}

/**
 * The key an attempt is kept under.
 * @param tool - The tool.
 * @param seed - The series.
 * @param question - The question's key in the tool's pool.
 * @returns `tool/seed/question`.
 */
export function attemptKey(
  tool: string,
  seed: number,
  question: string,
): string {
  return `${tool}/${seed}/${question}`;
}

/** What {@link createAttemptStore} is built from. */
export interface AttemptStoreOptions {
  /**
   * The site, which namespaces both entries: `atoms` keeps its attempts under
   * `atoms:attempts:v1` and the series each tool was last on under
   * `atoms:seeds:v1`.
   */
  key: string;
  /**
   * Where the attempts are kept, for a course that keeps them itself.
   * @default the browser's `localStorage`, under `<key>:attempts:v1`
   */
  binding?: ProgressStore<Attempt>;
  /**
   * Called when a save was refused because the store is full.
   * @default undefined
   */
  onQuotaExceeded?: (error: unknown) => void;
}

/** The attempts of a site, and the series each of its tools was last on. */
export interface AttemptStore {
  /** Every attempt this browser remembers; a new object after each change. */
  records: () => ProgressRecords<Attempt>;
  /** Be told after each change; returns the function that stops it. */
  subscribe: (listener: () => void) => () => void;
  /** One question's attempt, or a fresh one. */
  attemptFor: (key: string) => Attempt;
  /** Change one attempt and keep it. */
  updateAttempt: (key: string, change: Partial<Attempt>) => void;
  /** Forget the attempts of some questions. */
  clearAttempts: (keys: readonly string[]) => void;
  /**
   * Forget every series of a tool but one, so storage does not grow with every
   * new series drawn.
   */
  forgetOtherSeries: (tool: string, seed: number) => void;
  /** The series a tool was last on in this browser, or null. */
  storedSeed: (tool: string) => number | null;
  /** Remember the series a tool is on. */
  storeSeed: (tool: string, seed: number) => void;
}

/**
 * The attempts of a site's graded series, kept in this browser.
 * @param options - The site's namespace, and where else to keep them.
 * @returns The store.
 */
export function createAttemptStore(options: AttemptStoreOptions): AttemptStore {
  const { key, onQuotaExceeded } = options;
  const binding =
    options.binding ??
    localStorageProgressStore<Attempt>({
      key: `${key}:attempts`,
      version: 1,
      defaults: emptyAttempt(),
      onQuotaExceeded,
    });
  const seeds = persistBucket<Record<string, number>>({
    key: `${key}:seeds`,
    version: 1,
    defaults: {},
    onQuotaExceeded,
  });
  const listeners = new Set<() => void>();
  let current: ProgressRecords<Attempt> = {};
  // Kept in memory as well, so a framed page whose storage is blocked still
  // reopens the series it is on for as long as it stays open.
  let seedsByTool = seeds.read().value;

  function publish(next: ProgressRecords<Attempt>, save: boolean): void {
    current = next;
    if (save) void binding.save(next);
    for (const listener of listeners) listener();
  }

  const loaded = binding.load();
  if (loaded instanceof Promise) {
    void loaded.then(
      (records) => {
        publish(records, false);
      },
      () => {
        // A binding that cannot answer leaves the page working from nothing.
      },
    );
  } else {
    current = loaded;
  }

  function attemptFor(attempt: string): Attempt {
    return current[attempt] ?? emptyAttempt();
  }

  return {
    records: () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    attemptFor,
    updateAttempt(attempt, change) {
      publish(
        { ...current, [attempt]: { ...attemptFor(attempt), ...change } },
        true,
      );
    },
    clearAttempts(keys) {
      const cleared = new Set(keys);
      publish(
        keep(current, (attempt) => !cleared.has(attempt)),
        true,
      );
    },
    forgetOtherSeries(tool, seed) {
      const kept = `${tool}/${seed}/`;
      publish(
        keep(
          current,
          (attempt) =>
            !attempt.startsWith(`${tool}/`) || attempt.startsWith(kept),
        ),
        true,
      );
    },
    storedSeed: (tool) => seedsByTool[tool] ?? null,
    storeSeed(tool, seed) {
      seedsByTool = { ...seedsByTool, [tool]: seed };
      seeds.write(seedsByTool);
    },
  };
}

function keep(
  records: ProgressRecords<Attempt>,
  wanted: (key: string) => boolean,
): ProgressRecords<Attempt> {
  const next: ProgressRecords<Attempt> = {};
  for (const [key, attempt] of Object.entries(records)) {
    if (wanted(key)) next[key] = attempt;
  }
  return next;
}
