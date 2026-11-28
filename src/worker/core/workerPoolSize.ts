import { clamp } from '../../format/core/clamp.ts';

/** What {@link workerPoolSize} is given. */
export interface WorkerPoolSizeOptions {
  /** The most workers the pool will ever run: each loads its own libraries. */
  max: number;
  /**
   * What the caller asked for.
   * @default undefined — read off the machine
   */
  requested?: number;
  /**
   * The processors the machine reports.
   * @default navigator.hardwareConcurrency
   */
  cores?: number;
}

/**
 * How many workers a pool runs here: one processor left to the page, which
 * redraws while the pool works, and never more than `max`.
 * @param options - The cap, what was asked for, and the processors.
 * @returns A whole number between 1 and `max`.
 */
export function workerPoolSize(options: WorkerPoolSizeOptions): number {
  const { max, requested } = options;
  const cores = options.cores ?? globalThis.navigator?.hardwareConcurrency;
  const wanted =
    requested ??
    (typeof cores === 'number' && Number.isFinite(cores)
      ? Math.floor(cores) - 1
      : 1);
  return Math.trunc(clamp(wanted, 1, max, 1));
}
