/**
 * The Shirley background: the one a fitted narrow scan was quantified with.
 *
 * A photoelectron that scatters on its way out of the solid arrives at the
 * analyser with less kinetic energy than it left with, and is therefore
 * recorded at *higher* binding energy than the line that emitted it. So the
 * background under a peak is not a line but a step, low on the low-binding-
 * energy side and high on the other, and the height it has climbed at any point
 * is proportional to how much peak lies below that point in binding energy —
 * which is the same as saying, in the kinetic energy the formula is usually
 * written in, how much lies above it.
 *
 * `B(E) = I_low + k·∫[I(E') − B(E')] dE'` over that range, and it is implicit:
 * the area subtracts the background that the area is being used to compute. So
 * it is iterated from a flat first guess until it stops moving, which takes a
 * handful of passes on any real window.
 */

import type {
  BackgroundOptions,
  BackgroundResult,
} from './backgroundResult.ts';
import { endpointLevels } from './backgroundResult.ts';
import { linearBackground } from './linearBackground.ts';
import type { XpsTrace } from './xpsSpectrum.ts';

/** How hard the iteration works before it settles. */
export interface ShirleyBackgroundOptions extends BackgroundOptions {
  /**
   * How many passes at most. A window converges in well under ten; the ceiling
   * is there for the pathological one that oscillates instead.
   * @default 50
   */
  maxIterations?: number;
  /**
   * How small a pass has to move the background before it is called settled, as
   * a fraction of the step between the two ends.
   * @default 1e-6
   */
  tolerance?: number;
}

/**
 * The iterative Shirley background under a window.
 *
 * The direction is the whole of it. The array is ascending in binding energy,
 * the anchor is the level at index 0, and the area entering the background at a
 * point is the area accumulated from index 0 up to that point — so the curve
 * leaves the low-binding-energy end at the level measured there and arrives at
 * the far end at the level measured there, having climbed across the peak.
 * Accumulated the other way it still leaves one end at one level and reaches
 * the other at the other, so it still looks like a Shirley background on the
 * chart; it is simply the mirror image of the right one, and every area taken
 * under it is wrong by however asymmetric the peak was.
 *
 * A window of under two points, or one whose ends sit at the same level, or one
 * enclosing no positive area at all, has no step to distribute and is answered
 * with the straight line instead of a division by zero.
 * @param trace - The window, x ascending in binding energy.
 * @param options - The endpoint averaging, and how hard to iterate.
 * @returns The background, and the window with it taken off.
 */
export function shirleyBackground(
  trace: XpsTrace,
  options: ShirleyBackgroundOptions = {},
): BackgroundResult {
  const { maxIterations = 50, tolerance = 1e-6, averageWidth = 1 } = options;
  const { x, y } = trace;
  const length = x.length;
  if (length < 2) return linearBackground(trace, options);

  const { low, high } = endpointLevels(trace, averageWidth);
  const step = high - low;
  if (step === 0) return linearBackground(trace, options);

  const background = new Float64Array(length).fill(low);
  const accumulated = new Float64Array(length);
  const settled = tolerance * Math.abs(step);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let running = 0;
    for (let index = 1; index < length; index++) {
      const width = (x[index] as number) - (x[index - 1] as number);
      const left = (y[index - 1] as number) - (background[index - 1] as number);
      const right = (y[index] as number) - (background[index] as number);
      running += (width * (left + right)) / 2;
      accumulated[index] = running;
    }
    if (!(running > 0)) return linearBackground(trace, options);

    let largestChange = 0;
    for (let index = 0; index < length; index++) {
      const next = low + (step * (accumulated[index] as number)) / running;
      const change = Math.abs(next - (background[index] as number));
      if (change > largestChange) largestChange = change;
      background[index] = next;
    }
    if (largestChange <= settled) break;
  }

  const corrected = new Float64Array(length);
  for (let index = 0; index < length; index++) {
    corrected[index] = (y[index] as number) - (background[index] as number);
  }
  return { background, corrected };
}
