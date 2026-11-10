/**
 * The straight line between the two ends of a window.
 *
 * It claims nothing about the physics — a photoemission peak does not sit on a
 * straight line, and the step in the background across it is real — but it is
 * what a fit uses on a window where the two claims that follow have nothing to
 * work with: a weak line on a flat baseline, an Auger region, a window so
 * narrow that the scattering tail inside it is smaller than the noise. It is
 * also the answer the other two fall back to when their arithmetic degenerates,
 * which is why it is written first and imported by both.
 */

import type {
  BackgroundOptions,
  BackgroundResult,
} from './backgroundResult.ts';
import { endpointLevels } from './backgroundResult.ts';
import type { XpsTrace } from './xpsSpectrum.ts';

/**
 * Draw a straight line between the levels at the two ends of a window.
 *
 * The line is drawn against energy rather than against the point index, so a
 * trace acquired with an uneven step — a survey stitched out of several ranges
 * is the usual one — gets the line a reader would have drawn on the chart
 * rather than one bent at every change of step.
 * @param trace - The window, x ascending in binding energy.
 * @param options - How many points at each end fix the level.
 * @returns The line, and the window with it taken off.
 */
export function linearBackground(
  trace: XpsTrace,
  options: BackgroundOptions = {},
): BackgroundResult {
  const { averageWidth = 1 } = options;
  const { x, y } = trace;
  const length = x.length;
  const background = new Float64Array(length);
  const corrected = new Float64Array(length);
  if (length === 0) return { background, corrected };

  const { low, high } = endpointLevels(trace, averageWidth);
  const first = x[0] as number;
  const span = (x[length - 1] as number) - first;
  const slope = span === 0 ? 0 : (high - low) / span;

  for (let index = 0; index < length; index++) {
    const level = low + slope * ((x[index] as number) - first);
    background[index] = level;
    corrected[index] = (y[index] as number) - level;
  }
  return { background, corrected };
}
