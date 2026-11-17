/**
 * What spins in a piece's own plane while it runs — a rotor seen face on —
 * cut out of what the piece is drawn with, so that each part that spins is
 * drawn as one group, turning about its own middle in its place among the
 * rest.
 */

import type { Primitive, Spin } from './primitives.ts';

/** Primitives drawn next to each other, spinning one way or still. */
export interface SpinRun {
  /** The way they spin, or undefined for primitives that stay still. */
  spins: Spin | undefined;
  /** The primitives, in the order they are drawn. */
  primitives: Primitive[];
}

/**
 * Primitives cut wherever what spins starts, stops or changes way, in the
 * order they are drawn.
 * @param primitives - The primitives of a piece.
 * @returns The runs, still and spinning, in order.
 */
export function spinRuns(primitives: readonly Primitive[]): SpinRun[] {
  const runs: SpinRun[] = [];
  for (const primitive of primitives) {
    const spins = primitive.kind === 'path' ? primitive.spins : undefined;
    const last = runs.at(-1);
    if (last !== undefined && last.spins === spins) {
      last.primitives.push(primitive);
    } else {
      runs.push({ spins, primitives: [primitive] });
    }
  }
  return runs;
}

/**
 * The class that sets a run spinning, the way it spins, as the motion
 * stylesheet reads it.
 * @param spins - The way it spins.
 * @returns The class.
 */
export function spinClass(spins: Spin): string {
  return spins === 'clockwise'
    ? 'glass-spinning'
    : 'glass-spinning glass-spinning-back';
}
