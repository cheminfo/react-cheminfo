import { clamp } from '../../format/core/clamp.ts';

const DEFAULT_SLICE_MS = 12;
const DEFAULT_CHUNK_SIZE = 1;

/** How {@link runInChunks} shares the thread. */
export interface RunInChunksOptions {
  /**
   * Milliseconds of work between two turns handed back to the browser. The
   * default leaves most of a 60 Hz frame for drawing and input.
   * @default 12
   */
  sliceMs?: number;
  /**
   * Items worked through between two looks at the clock. Raise it when one
   * item takes microseconds; with `sliceMs: 0` it is a fixed count of items
   * between two turns.
   * @default 1
   */
  chunkSize?: number;
  /**
   * How many items there are, for the progress of an iterable that cannot say.
   * An estimate is fine: a count past it raises it.
   * @default the length of an array, otherwise the count done so far
   */
  total?: number;
  /**
   * Called at every turn handed back, and once at the end with the exact count.
   * @default undefined
   */
  onProgress?: (done: number, total: number) => void;
  /**
   * Stops the run before the next item; the promise then rejects with the
   * signal's reason.
   * @default undefined
   */
  signal?: AbortSignal;
}

/**
 * Work through a long list on this thread without freezing the page: the work
 * runs in slices, and the browser gets a turn — to paint the progress, to
 * handle a click on Cancel — between two of them.
 *
 * Meant for items that each cost real work: a molecule parsed, a row enriched,
 * a record converted. Numeric inner loops belong in a plain `for` loop.
 * @param items - The items, an array or any iterable, including an async one such as a streamed file.
 * @param work - Called with each item and its index; may return a promise, which is awaited.
 * @param options - See {@link RunInChunksOptions}.
 * @returns How many items were worked through.
 */
export async function runInChunks<TItem>(
  items: Iterable<TItem> | AsyncIterable<TItem>,
  work: (item: TItem, index: number) => unknown,
  options: RunInChunksOptions = {},
): Promise<number> {
  const {
    sliceMs = DEFAULT_SLICE_MS,
    chunkSize = DEFAULT_CHUNK_SIZE,
    total,
    onProgress,
    signal,
  } = options;
  const slice = clamp(sliceMs, 0, Number.MAX_SAFE_INTEGER, DEFAULT_SLICE_MS);
  const every = Math.trunc(
    clamp(chunkSize, 1, Number.MAX_SAFE_INTEGER, DEFAULT_CHUNK_SIZE),
  );
  const known = total ?? (Array.isArray(items) ? items.length : 0);

  signal?.throwIfAborted();
  let done = 0;
  let sliceStart = performance.now();

  function isDue(): boolean {
    return done % every === 0 && performance.now() - sliceStart >= slice;
  }

  async function settle(result: unknown): Promise<void> {
    if (result instanceof Promise) await result;
    signal?.throwIfAborted();
    if (!isDue()) return;
    onProgress?.(done, Math.max(known, done));
    await yieldToBrowser();
    signal?.throwIfAborted();
    sliceStart = performance.now();
  }

  if (Symbol.iterator in items) {
    // A plain loop, so a synchronous item costs no promise of its own.
    for (const item of items) {
      const result = work(item, done);
      done += 1;
      if (result instanceof Promise || isDue()) {
        // eslint-disable-next-line no-await-in-loop -- items run in order, and the thread is handed back between slices
        await settle(result);
      } else {
        signal?.throwIfAborted();
      }
    }
  } else {
    for await (const item of items) {
      const result = work(item, done);
      done += 1;
      await settle(result);
    }
  }

  onProgress?.(done, done);
  return done;
}

/**
 * Give the browser a turn in the middle of long work: it can paint, and read
 * the click or the message that cancels the work.
 *
 * A macrotask rather than a resolved promise, because the browser paints and a
 * worker reads its messages between tasks, never between microtasks; and
 * `setTimeout` rather than `requestAnimationFrame`, which a background tab
 * stops calling and a worker or a test does not have.
 * @returns When the browser has had its turn.
 */
export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
