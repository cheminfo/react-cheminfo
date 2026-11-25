/**
 * Work asked for by slot, the latest ask winning: a slot — a pane's picture,
 * a table, a count over every frame, a link being read — runs one task at a
 * time, under the key of what it asks. Asking the same key again changes
 * nothing; asking another aborts the run on its way and starts the next, at
 * once or once it has stayed asked for a while; an answer, a failure or the
 * progress of a run a newer one replaced is never told, so no caller keeps a
 * ticket of its own. What is answered is the caller's to keep: the slot only
 * remembers the key it asked last.
 */

/** What a run is handed. */
export interface LatestRunContext {
  /** Aborted once a newer run of its slot starts, or the slot is dropped. */
  signal: AbortSignal;
  /**
   * Whether the run is still its slot's latest: its progress is told only
   * while it is.
   * @returns `true` until a newer run starts or the slot is dropped.
   */
  current: () => boolean;
}

/** How a run is started and told of. */
export interface LatestRunOptions<TAnswer> {
  /**
   * How long the ask must stay the slot's latest before the run starts: a
   * field being typed into, a slider dragged, asks once it rests.
   * @default 0 — at once
   */
  delayMs?: number;
  /** The run's answer, while it is its slot's latest. */
  onAnswer: (answer: TAnswer) => void;
  /**
   * The run failed, while it is its slot's latest and was not aborted.
   * @default ignored
   */
  onFailure?: (error: unknown) => void;
}

/** Slots of work, the latest ask of each winning. */
export interface LatestRuns {
  /**
   * Ask a slot for a key: nothing new when it is the key asked last;
   * otherwise the run on its way is aborted and this one started.
   * @param slot - The slot.
   * @param key - What identifies what is asked.
   * @param task - The work, started with its context.
   * @param options - See {@link LatestRunOptions}.
   * @returns When the slot's run for that key has settled: answered, failed,
   *   or given up for a newer one.
   */
  ask: <TAnswer>(
    slot: string,
    key: string,
    task: (context: LatestRunContext) => Promise<TAnswer>,
    options: LatestRunOptions<TAnswer>,
  ) => Promise<void>;
  /**
   * Start a slot's run whatever it asked before — an opening asked again opens
   * again —, aborting the run on its way. The slot then has no key: an ask of
   * any key replaces the run too.
   * @param slot - The slot.
   * @param task - The work, started with its context.
   * @param options - See {@link LatestRunOptions}.
   * @returns When the run has settled: answered, failed, or given up for a
   *   newer one.
   */
  replace: <TAnswer>(
    slot: string,
    task: (context: LatestRunContext) => Promise<TAnswer>,
    options: LatestRunOptions<TAnswer>,
  ) => Promise<void>;
  /**
   * Abort a slot's run and forget its key.
   * @param slot - The slot.
   */
  drop: (slot: string) => void;
  /**
   * The key a slot asked last.
   * @param slot - The slot.
   * @returns The key, or `undefined` for a slot never asked or dropped.
   */
  keyOf: (slot: string) => string | undefined;
  /**
   * Whether a slot's run is waiting to start or on its way.
   * @param slot - The slot.
   * @returns `true` until it is answered or fails.
   */
  pending: (slot: string) => boolean;
  /**
   * Whether a slot's run is still waiting for its delay to start: asked, not
   * yet on its way.
   * @param slot - The slot.
   * @returns `true` until it starts, is given up or the slot is dropped.
   */
  waiting: (slot: string) => boolean;
  /**
   * The slots asked and not dropped.
   * @returns Their names.
   */
  slots: () => string[];
}

/** One slot's run. */
interface Run {
  /** The key asked, `undefined` for a run started whatever came before. */
  key: string | undefined;
  /** Aborts it. */
  controller: AbortController;
  /** The delay before it starts, while it waits. */
  timer: ReturnType<typeof setTimeout> | undefined;
  /** Waiting to start, or on its way. */
  pending: boolean;
  /** Settles once it is answered, failed or given up. */
  settled: Promise<void>;
  /**
   * Settles a run given up while it waited to start.
   * @default undefined — it started at once
   */
  giveUp?: () => void;
}

/**
 * Slots of work, the latest ask of each winning.
 * @returns The slots.
 */
export function createLatestRuns(): LatestRuns {
  const runs = new Map<string, Run>();

  function drop(slot: string): void {
    const run = runs.get(slot);
    if (run === undefined) return;
    runs.delete(slot);
    if (run.timer !== undefined) {
      clearTimeout(run.timer);
      run.giveUp?.();
    }
    run.controller.abort();
  }

  function begin<TAnswer>(
    slot: string,
    key: string | undefined,
    task: (context: LatestRunContext) => Promise<TAnswer>,
    options: LatestRunOptions<TAnswer>,
  ): Promise<void> {
    drop(slot);
    const run: Run = {
      key,
      controller: new AbortController(),
      timer: undefined,
      pending: true,
      settled: Promise.resolve(),
    };
    runs.set(slot, run);
    const current = () => runs.get(slot) === run;
    const start = (): Promise<void> => {
      run.timer = undefined;
      const { signal } = run.controller;
      return task({ signal, current }).then(
        (answer) => {
          if (!current()) return;
          run.pending = false;
          options.onAnswer(answer);
        },
        (error: unknown) => {
          if (!current() || signal.aborted) return;
          run.pending = false;
          options.onFailure?.(error);
        },
      );
    };
    const { delayMs = 0 } = options;
    run.settled =
      delayMs > 0
        ? new Promise<void>((resolve) => {
            run.giveUp = resolve;
            run.timer = setTimeout(() => {
              void start().then(resolve);
            }, delayMs);
          })
        : start();
    return run.settled;
  }

  return {
    ask(slot, key, task, options) {
      const held = runs.get(slot);
      if (held?.key === key) return held.settled;
      return begin(slot, key, task, options);
    },
    replace: (slot, task, options) => begin(slot, undefined, task, options),
    drop,
    keyOf: (slot) => runs.get(slot)?.key,
    pending: (slot) => runs.get(slot)?.pending ?? false,
    waiting: (slot) => runs.get(slot)?.timer !== undefined,
    slots: () => [...runs.keys()],
  };
}
