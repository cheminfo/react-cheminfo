/**
 * The seed a series is drawn from, and the drawing itself.
 *
 * A series is a link: `?seed=4271` hands the same questions, in the same order,
 * to everybody who opens it, on every machine and in every browser. So the
 * drawing goes through `ml-xsadd` and nothing else — a hand-rolled generator
 * silently changes its sequence the day somebody improves it, and every link
 * that pinned a seed then opens a different problem set.
 */

import { XSadd } from 'ml-xsadd';

import type { ShareParamCodec } from '../../share/core/params.ts';

/** The largest seed a link may carry: an unsigned 32-bit integer. */
export const LARGEST_SEED = 2 ** 32 - 1;

/** The seeds a link may pin, both ends included. */
export interface SeedRange {
  /** The smallest seed. */
  min: number;
  /** The largest seed. */
  max: number;
}

/**
 * Which call of the generator a shuffle draws from. Both are reproducible; they
 * are two different sequences, so a site keeps the one its links were written
 * with.
 */
export type SeedDraw = 'getFloat' | 'getUint32';

/** How {@link pickSeeded} draws. */
export interface PickSeededOptions {
  /**
   * The generator call the shuffle is driven by: `getFloat`, scaled to the
   * remaining positions, or `getUint32`, taken modulo them.
   * @default 'getFloat'
   */
  draw?: SeedDraw;
  /**
   * Whether a series longer than the pool goes round it again, so it is always
   * exactly as long as asked. Otherwise it stops at the pool.
   * @default false
   */
  wrap?: boolean;
}

/**
 * Pick `count` items out of a pool, the same ones in the same order for the
 * same seed.
 *
 * The pool is shuffled by Fisher–Yates driven by XSadd and the series is the
 * head of that shuffle, so asking for more questions from the same seed keeps
 * the ones already on screen. The pool itself is never reordered.
 * @param pool - Everything a series can draw from.
 * @param count - How many to take; more than the pool holds takes them all,
 * or goes round again with `wrap`.
 * @param seed - An unsigned 32-bit integer.
 * @param options - Which generator call drives the shuffle, and whether the
 * series wraps.
 * @returns The picked items, in drawn order.
 */
export function pickSeeded<T>(
  pool: readonly T[],
  count: number,
  seed: number,
  options: PickSeededOptions = {},
): T[] {
  const { draw = 'getFloat', wrap = false } = options;
  const order = shuffledOrder(pool.length, seed, draw);
  const wanted = Math.max(0, Math.trunc(count));
  const size =
    pool.length === 0 ? 0 : wrap ? wanted : Math.min(wanted, pool.length);
  const picked = new Array<T>(size);
  for (let index = 0; index < size; index++) {
    picked[index] = pool[order[index % order.length] as number] as T;
  }
  return picked;
}

/**
 * A seed for a series nobody has asked for yet.
 *
 * `ml-xsadd` unseeded rather than `Math.random`, so the one generator the page
 * draws from is the one every link pins.
 * @param range - The seeds a link may carry, so a drawn one is one of them.
 * @default range { min: 0, max: LARGEST_SEED }
 * @returns A whole number inside the range.
 */
export function freshSeed(range?: SeedRange): number {
  const drawn = new XSadd().getUint32();
  if (range === undefined) return drawn;
  const span = range.max - range.min + 1;
  return range.min + (drawn % span);
}

/**
 * Read a seed out of an address, strictly: anything that is not a whole number
 * inside the range reads as no seed at all.
 * @param raw - The `seed` parameter, as typed or as a link carries it.
 * @param range - The seeds a link may carry.
 * @default range { min: 0, max: LARGEST_SEED }
 * @returns The seed, or null when the parameter is absent or not one.
 */
export function parseSeed(
  raw: string | null | undefined,
  range?: SeedRange,
): number | null {
  if (raw === null || raw === undefined || !/^\d{1,10}$/u.test(raw)) {
    return null;
  }
  const seed = Number(raw);
  const { min = 0, max = LARGEST_SEED } = range ?? {};
  return seed >= min && seed <= max ? seed : null;
}

/** What a link writes to ask for a series per student rather than one per class. */
export const EACH_SEED = 'each';

/**
 * What `?seed=` can say: a pinned series, a series per student, or no series —
 * `null` rather than a number for the last, because `0` is a seed somebody may
 * pin.
 */
export type SeedValue = number | typeof EACH_SEED | null;

/**
 * The codec of a `?seed=` that also understands `each`.
 *
 * A number is a problem set handed to a whole class; `each` is one link under
 * which no two students work on the same set, the site drawing one seed per
 * browser the first time it opens. A number outside the range is brought back
 * inside it, and anything else reads as no series, so a hand-edited
 * `?seed=today` still opens something.
 * @param range - The seeds a link may pin.
 * @returns The codec.
 */
export function seedParam(range: SeedRange): ShareParamCodec<SeedValue> {
  return {
    parse(raw) {
      if (raw === null) return null;
      const text = raw.trim();
      if (text === '') return null;
      if (text.toLowerCase() === EACH_SEED) return EACH_SEED;
      const parsed = Number(text);
      if (Number.isNaN(parsed)) return null;
      return clampSeed(parsed, range);
    },
    serialize(value) {
      if (value === EACH_SEED) return EACH_SEED;
      if (typeof value !== 'number') return null;
      return String(clampSeed(value, range));
    },
  };
}

function clampSeed(value: number, range: SeedRange): number {
  if (!Number.isFinite(value)) return range.min;
  return Math.min(range.max, Math.max(range.min, Math.round(value)));
}

function shuffledOrder(length: number, seed: number, draw: SeedDraw): number[] {
  const generator = new XSadd(seed);
  const order = new Array<number>(length);
  for (let index = 0; index < length; index++) order[index] = index;
  for (let index = length - 1; index > 0; index--) {
    const other =
      draw === 'getUint32'
        ? generator.getUint32() % (index + 1)
        : Math.floor(generator.getFloat() * (index + 1));
    const kept = order[index] as number;
    order[index] = order[other] as number;
    order[other] = kept;
  }
  return order;
}
