/**
 * A series drawn kind by kind.
 *
 * A series that mixes kinds of question — counting lines, naming a spin,
 * reading a voltmeter — asks them in a fixed order of kinds, so it opens on the
 * first kind whatever the seed and a student meets every kind before the first
 * comes back. Each kind is shuffled by a seed of its own, so asking for more
 * questions keeps the ones already on screen, and leaving a kind out never
 * reshuffles the others.
 */

import { pickSeeded } from './seed.ts';

/** How many 32-bit seeds there are, which a derived seed is taken modulo. */
const SEED_COUNT = 4_294_967_296;

/**
 * Knuth's multiplicative hash constant, ⌊2³²/φ⌋. Adding it once per kind
 * spreads the kinds' seeds over the 32-bit range rather than leaving them
 * neighbours.
 */
const GOLDEN_STEP = 2_654_435_761;

/**
 * Draw a series from one pool per kind: each pool shuffled by the seed of its
 * kind, then round after round, the next question of each kind in turn.
 *
 * The same pools and the same seed draw the same questions in the same order,
 * and a longer series starts with the shorter one. A kind is known by its
 * place in `pools`, so a kind a filter empties is passed as an empty pool: it
 * is skipped, and every other kind keeps the questions it had.
 * @param pools - The questions of each kind, in the order the series cycles
 * through the kinds.
 * @param count - How many questions; more than the pools hold takes them all.
 * @param seed - The series, an unsigned 32-bit integer.
 * @returns The questions, in the order they are asked.
 */
export function drawRoundRobin<T>(
  pools: ReadonlyArray<readonly T[]>,
  count: number,
  seed: number,
): T[] {
  const wanted = Math.max(0, Math.trunc(count));
  const shuffled: T[][] = [];
  let rounds = 0;
  for (let index = 0; index < pools.length; index++) {
    const pool = pools[index] ?? [];
    shuffled.push(pickSeeded(pool, pool.length, kindSeed(seed, index)));
    rounds = Math.max(rounds, pool.length);
  }

  const series: T[] = [];
  for (let round = 0; series.length < wanted && round < rounds; round++) {
    for (const questions of shuffled) {
      if (round < questions.length && series.length < wanted) {
        series.push(questions[round] as T);
      }
    }
  }
  return series;
}

/**
 * The seed one kind of a series is shuffled by.
 *
 * It is a derivation, not a generator: it only gives every kind a starting
 * point of its own, `(seed + (index + 1) × 2 654 435 761) mod 2³²`, and the
 * questions themselves are drawn by `ml-xsadd` from it. The formula is fixed
 * for good, since every link handed out with a seed depends on it.
 * @param seed - The series, an unsigned 32-bit integer.
 * @param index - The kind's place in the series' list of kinds, counted from 0.
 * @returns The kind's seed, an unsigned 32-bit integer.
 */
export function kindSeed(seed: number, index: number): number {
  return (seed + (index + 1) * GOLDEN_STEP) % SEED_COUNT;
}
