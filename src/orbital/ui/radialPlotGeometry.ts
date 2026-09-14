/**
 * The paths a radial plot is drawn with, computed from the distribution and
 * the frame's scales and nothing else, so they can be checked without a DOM.
 *
 * Both curves are scaled to their own extreme: `r²R²` and `R` have different
 * units, so the plot compares their shapes and the position of their zeros,
 * never their magnitudes.
 */

import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartPixel } from '../../chart/core/chartScale.ts';
import type { RadialDistribution } from '../core/radialDistribution.ts';

/** One run of the amplitude curve over which `R` keeps its sign. */
interface AmplitudeRun {
  /** Whether `R` is positive along the run. */
  positive: boolean;
  /** The run, as an SVG path. */
  path: string;
}

/** Everything the plot draws as a path. */
interface RadialPlotGeometry {
  /** The `r²R²` curve. */
  densityLine: string;
  /** The same curve closed along the zero line, for the fill under it. */
  densityArea: string;
  /**
   * The `R` curve cut where it changes sign, each cut ending exactly on zero;
   * empty unless the amplitude was asked for.
   */
  amplitudeRuns: AmplitudeRun[];
}

/**
 * Turn a sampled distribution into the paths of its plot.
 * @param distribution - The samples, as `radialDistribution` returned them.
 * @param x - Distance, in the displayed unit, to pixels.
 * @param y - Relative value, from −1 to 1, to pixels.
 * @param unitFactor - Displayed units per ångström: 100 for picometres.
 * @param showAmplitude - Whether the `R` runs are wanted.
 * @returns The paths.
 */
export function radialPlotGeometry(
  distribution: RadialDistribution,
  x: ChartScale,
  y: ChartScale,
  unitFactor: number,
  showAmplitude: boolean,
): RadialPlotGeometry {
  const { distances, density, peakDensity } = distribution;
  const count = distances.length;
  const scale = peakDensity === 0 ? 0 : 1 / peakDensity;

  const points = new Array<string>(count);
  for (let index = 0; index < count; index++) {
    points[index] = pointOf(
      x,
      y,
      (distances[index] as number) * unitFactor,
      (density[index] as number) * scale,
    );
  }
  const densityLine = `M${points.join(' L')}`;
  const end = pointOf(x, y, (distances[count - 1] ?? 0) * unitFactor, 0);
  const start = pointOf(x, y, (distances[0] ?? 0) * unitFactor, 0);

  return {
    densityLine,
    densityArea: `${densityLine} L${end} L${start} Z`,
    amplitudeRuns: showAmplitude
      ? amplitudeRunsOf(distribution, x, y, unitFactor)
      : [],
  };
}

/**
 * Cut the amplitude curve wherever it changes sign.
 * @param distribution - The samples.
 * @param x - Distance to pixels.
 * @param y - Relative value to pixels.
 * @param unitFactor - Displayed units per ångström.
 * @returns One run per stretch of constant sign, nucleus first.
 */
function amplitudeRunsOf(
  distribution: RadialDistribution,
  x: ChartScale,
  y: ChartScale,
  unitFactor: number,
): AmplitudeRun[] {
  const { distances, amplitude, peakAmplitude } = distribution;
  const scale = peakAmplitude === 0 ? 0 : 1 / peakAmplitude;
  const runs: AmplitudeRun[] = [];

  let previousDistance = (distances[0] ?? 0) * unitFactor;
  let previousValue = (amplitude[0] ?? 0) * scale;
  let positive = previousValue >= 0;
  let points = [pointOf(x, y, previousDistance, previousValue)];

  for (let index = 1; index < distances.length; index++) {
    const distance = (distances[index] as number) * unitFactor;
    const value = (amplitude[index] as number) * scale;
    if (value >= 0 !== positive) {
      // The zero lies between the two samples; ending both runs on it keeps
      // the curve continuous where its colour changes.
      const crossing =
        previousDistance +
        ((distance - previousDistance) * previousValue) /
          (previousValue - value);
      const zero = pointOf(x, y, crossing, 0);
      points.push(zero);
      runs.push({ positive, path: `M${points.join(' L')}` });
      points = [zero];
      positive = !positive;
    }
    points.push(pointOf(x, y, distance, value));
    previousDistance = distance;
    previousValue = value;
  }
  if (points.length > 1) runs.push({ positive, path: `M${points.join(' L')}` });
  return runs;
}

function pointOf(
  x: ChartScale,
  y: ChartScale,
  distance: number,
  value: number,
): string {
  return `${chartPixel(x, distance).toFixed(2)} ${chartPixel(y, value).toFixed(2)}`;
}
