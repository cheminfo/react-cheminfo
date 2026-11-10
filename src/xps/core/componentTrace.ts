/**
 * What a fitted component draws, and what all of them draw together.
 *
 * A component is sampled rather than stated: the file says where it sits, how
 * wide it is and how much area it holds, and the curve that follows from those
 * three is worked out here at the resolution of the plot. Sampling at the plot's
 * own width is what keeps the cost flat — a chart eight hundred pixels across
 * costs eight hundred points per component whether it is showing a two-eV window
 * or the whole survey — and it is also the only resolution worth having, since
 * anything finer is drawn into the same pixel column.
 *
 * The envelope is the sum of the components and never the measured trace. Those
 * two being different is the whole point of looking at a fit: where the envelope
 * departs from the data is where the fit is wrong, and drawing the data twice
 * would hide exactly that.
 */

import type { ComponentPeak, ComponentShape } from './componentShape.ts';
import { parseComponentShape, shapeValue } from './componentShape.ts';
import type { XpsTrace } from './xpsSpectrum.ts';

/**
 * How many points a component is drawn with across the plot.
 *
 * One per pixel column, so the curve is smooth at the width it is drawn at and
 * nothing is computed that cannot be seen. It is a floor rather than a target:
 * a chart in a narrow side panel still gets enough points that a doublet does
 * not read as two triangles.
 */
export const COMPONENT_SAMPLES = 400;

/**
 * How tall a component stands at its own centre.
 *
 * The area is divided by the width the shape spreads it over, which is the FWHM
 * times the integral of the unit-height shape. A width of nothing, or an area of
 * nothing, is a component with no height rather than an infinity: CASA writes a
 * zero-area component for a peak somebody added and never fitted, and it must
 * draw flat rather than take the whole chart with it.
 * @param peak - The fitted peak.
 * @param shape - Its shape, already parsed.
 * @returns The counts at the maximum, `0` when it has no height to speak of.
 */
export function componentAmplitude(
  peak: ComponentPeak,
  shape: ComponentShape,
): number {
  const spread = peak.fwhm * shape.integral;
  if (!(spread > 0) || !Number.isFinite(peak.area)) return 0;
  return peak.area / spread;
}

/**
 * The counts one component contributes at one energy.
 *
 * Parses the shape on every call, so it is for a readout or a test rather than
 * for a loop: `componentTrace` reads the shape once and walks the window.
 * @param peak - The fitted peak.
 * @param energy - Where to read it, in the units the peak's centre is in.
 * @returns The counts, `0` where the shape describes nothing.
 */
export function componentIntensity(
  peak: ComponentPeak,
  energy: number,
): number {
  const shape = parseComponentShape(peak.shape);
  const t = (energy - peak.centre) / peak.fwhm;
  return componentAmplitude(peak, shape) * shapeValue(shape, t);
}

/**
 * One component, drawn across a window.
 *
 * The energies ascend whichever way round the window was given, so the trace
 * obeys the same rule every other one in this package does and can be handed
 * straight to a path builder or to an integration.
 * @param peak - The fitted peak, its centre in the units of the window.
 * @param from - One end of the window in eV.
 * @param to - The other end.
 * @param samples - How many points to draw it with. Defaults to
 *   `COMPONENT_SAMPLES`.
 * @returns The curve, empty when the window has no width to draw across.
 */
export function componentTrace(
  peak: ComponentPeak,
  from: number,
  to: number,
  samples = COMPONENT_SAMPLES,
): XpsTrace {
  const grid = energyGrid(from, to, samples);
  const shape = parseComponentShape(peak.shape);
  const amplitude = componentAmplitude(peak, shape);
  const y = new Float64Array(grid.length);
  for (let index = 0; index < grid.length; index++) {
    const t = ((grid[index] as number) - peak.centre) / peak.fwhm;
    y[index] = amplitude * shapeValue(shape, t);
  }
  return { x: grid, y };
}

/**
 * Every component of a fit summed, which is the envelope the fit claims.
 *
 * The shapes are parsed once for the whole sum rather than once per point, and
 * the sum is accumulated into one array rather than built per component and
 * added afterwards — a narrow scan carrying eight components would otherwise
 * allocate eight curves per render for a picture that is one stroke.
 * @param peaks - The fitted peaks, their centres in the units of the window.
 * @param from - One end of the window in eV.
 * @param to - The other end.
 * @param samples - How many points to draw it with. Defaults to
 *   `COMPONENT_SAMPLES`.
 * @returns The sum, all zeros when there is no component to sum.
 */
export function envelopeTrace(
  peaks: readonly ComponentPeak[],
  from: number,
  to: number,
  samples = COMPONENT_SAMPLES,
): XpsTrace {
  const grid = energyGrid(from, to, samples);
  const y = new Float64Array(grid.length);
  for (const peak of peaks) {
    const shape = parseComponentShape(peak.shape);
    const amplitude = componentAmplitude(peak, shape);
    if (amplitude === 0) continue;
    for (let index = 0; index < grid.length; index++) {
      const t = ((grid[index] as number) - peak.centre) / peak.fwhm;
      y[index] = (y[index] as number) + amplitude * shapeValue(shape, t);
    }
  }
  return { x: grid, y };
}

/**
 * The energies a window is sampled at, ascending.
 * @param from - One end of the window in eV.
 * @param to - The other end.
 * @param samples - How many points to cut it into, at least two.
 * @returns The grid, empty when the window has no width or is not one.
 */
function energyGrid(from: number, to: number, samples: number): Float64Array {
  const low = Math.min(from, to);
  const high = Math.max(from, to);
  const count = Number.isFinite(samples) ? Math.max(2, Math.floor(samples)) : 2;
  if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) {
    return new Float64Array(0);
  }
  const grid = new Float64Array(count);
  const step = (high - low) / (count - 1);
  for (let index = 0; index < count; index++) {
    grid[index] = low + index * step;
  }
  return grid;
}
