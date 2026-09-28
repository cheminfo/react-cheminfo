/**
 * Where each line of a stack of labels above a feature is written.
 *
 * The arithmetic only, and none of the wording: what a stack *says* is the one
 * thing every viewer answers differently — a mass peak carries its intensity,
 * its m/z and its charge, an infrared band carries its wavenumber and the group
 * it is assigned to — while where the lines go is the same sum in both, and the
 * same sum again for the reflected half of a mirrored chart.
 */

import { PEAK_LABEL } from './chartTheme.ts';

/**
 * Where each line of a stack is written, in pixels down the SVG.
 *
 * A stack that would run off the top of the plot is **pushed back down** rather
 * than clipped: the tallest peak of a spectrum is the one most worth naming, its
 * tip is by construction near the top of the window, and a label cut in half by
 * the plot edge names nothing. Sliding it down puts it over the feature instead,
 * which is the one place a reader already knows to look.
 * @param tip - Where the top of the feature is, in pixels down the SVG.
 * @param lineCount - How many lines the stack has.
 * @param bounds - `[top, bottom]` of the plot in pixels, which no line may pass.
 * @param below - Whether the stack hangs under the feature, which is what the
 *   mirrored half of a chart wants — above its sticks is the other spectrum.
 *   Defaults to `false`.
 * @returns The baseline of each line, in the order the lines were given.
 */
export function labelStackBaselines(
  tip: number,
  lineCount: number,
  bounds: readonly [number, number],
  below = false,
): Float64Array {
  const count = Number.isFinite(lineCount)
    ? Math.max(0, Math.floor(lineCount))
    : 0;
  const baselines = new Float64Array(count);
  if (count === 0) return baselines;

  const { lineHeight, topPad } = PEAK_LABEL;
  if (below) {
    for (let line = 0; line < count; line++) {
      baselines[line] = tip + topPad + (count - line) * lineHeight;
    }
    shift(baselines, Math.min(0, bounds[1] - (baselines[0] as number)));
    return baselines;
  }

  for (let line = 0; line < count; line++) {
    baselines[line] = tip - topPad - (count - 1 - line) * lineHeight;
  }
  // A baseline one line height below the top edge is what keeps the glyphs of
  // the topmost line inside the plot rather than half over it.
  shift(
    baselines,
    Math.max(0, bounds[0] + lineHeight - (baselines[0] as number)),
  );
  return baselines;
}

/**
 * Move every baseline of a stack by the same amount.
 * @param baselines - The baselines, written into.
 * @param delta - How far down to move them; zero leaves them alone.
 */
function shift(baselines: Float64Array, delta: number): void {
  if (delta === 0) return;
  for (let line = 0; line < baselines.length; line++) {
    baselines[line] = (baselines[line] as number) + delta;
  }
}
