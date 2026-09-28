/**
 * The one string a trace becomes, and why it is only ever one.
 *
 * A profile scan is a few hundred thousand samples and a peak table a few
 * thousand sticks. Drawn as an element each, the browser holds a hundred
 * thousand nodes for a picture that is a single stroke, and every pointer move
 * across the chart then costs a walk of all of them. Both traces are therefore
 * one `<path>` built here, and the only thing that ever changes is its `d`.
 *
 * Coordinates are rounded to a hundredth of a pixel. No display resolves more
 * than that, while the full precision of a double writes `312.40000000000003`
 * where `312.4` was meant — six times the string for a distance nobody can see.
 */

import type { NumberArray } from 'cheminfo-types';

import type { ChartScale } from './chartScale.ts';
import { chartPixel } from './chartScale.ts';

/**
 * The path of a continuous trace: every sample joined to the next.
 *
 * A sample that maps to nothing finite — a `NaN` intensity a reader let
 * through, a mass a degenerate scale sent to infinity — breaks the line in two
 * rather than being passed over, because joining the two sound samples either
 * side of it draws a straight run across a stretch the instrument never
 * reported. Writing the `NaN` into the string instead would void the whole
 * path, and the trace would then silently not be drawn at all.
 * @param x - Where each sample was taken, ascending.
 * @param y - What was measured there, one per sample.
 * @param xScale - The x axis as it is currently zoomed.
 * @param yScale - The y axis as it is currently zoomed.
 * @returns The `d` of one path; empty when there is nothing to draw, and a bare
 * `M` for a trace of a single sample, which is a point and not a line.
 */
export function profilePath(
  x: NumberArray,
  y: NumberArray,
  xScale: ChartScale,
  yScale: ChartScale,
): string {
  // The two scales are read out here and the multiply-add written inline, as
  // `chartScale` asks a loop over points to: a trace is tens of thousands of
  // samples, and a helper call per sample per axis is the one cost this file
  // can avoid without changing what it draws.
  const { offset: xOffset, factor: xFactor } = xScale;
  const { offset: yOffset, factor: yFactor } = yScale;
  const count = Math.min(x.length, y.length);
  let path = '';
  let drawnInRun = 0;
  for (let index = 0; index < count; index++) {
    const pixelX = xOffset + (x[index] as number) * xFactor;
    const pixelY = yOffset + (y[index] as number) * yFactor;
    if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY)) {
      drawnInRun = 0;
      continue;
    }
    const point = `${roundPixel(pixelX)} ${roundPixel(pixelY)}`;
    if (drawnInRun === 0) path += `M${point}`;
    else if (drawnInRun === 1) path += `L${point}`;
    else path += ` ${point}`;
    drawnInRun++;
  }
  return path;
}

/**
 * The path of a centroid: one stick per peak, standing on zero.
 *
 * The foot of every stick is where the intensity axis reads zero rather than
 * the bottom of the plot, which is the same pixel until the chart is mirrored
 * and then is not — a stick of the inverted half hangs from the rule the pair
 * is reflected in. Nothing is clipped here: a peak taller than the window still
 * gets its full stick, and the clip path over the data band is what stops it at
 * the edge, so a zoom into the baseline shows the tall peak leaving the top
 * rather than a gap where it stood.
 * @param x - Where each peak sits, ascending.
 * @param y - How tall each one is, one per peak.
 * @param xScale - The x axis as it is currently zoomed.
 * @param yScale - The y axis as it is currently zoomed, which the foot of the
 * sticks is read off.
 * @returns The `d` of one path, empty when there is nothing to draw.
 */
export function stickPath(
  x: NumberArray,
  y: NumberArray,
  xScale: ChartScale,
  yScale: ChartScale,
): string {
  const count = Math.min(x.length, y.length);
  const foot = chartPixel(yScale, 0);
  if (!Number.isFinite(foot)) return '';
  const baseline = roundPixel(foot);
  // The two scales are read out here and the multiply-add written inline, as
  // `chartScale` asks a loop over points to: a trace is tens of thousands of
  // samples, and a helper call per sample per axis is the one cost this file
  // can avoid without changing what it draws.
  const { offset: xOffset, factor: xFactor } = xScale;
  const { offset: yOffset, factor: yFactor } = yScale;
  let path = '';
  for (let index = 0; index < count; index++) {
    const pixelX = xOffset + (x[index] as number) * xFactor;
    const pixelY = yOffset + (y[index] as number) * yFactor;
    if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY)) continue;
    path += `M${roundPixel(pixelX)} ${baseline}V${roundPixel(pixelY)}`;
  }
  return path;
}

/** What an area is closed at, when the ground it stands on is not zero. */
export interface AreaPathOptions {
  /**
   * The value the area is closed down onto, in the units of the y axis.
   *
   * A chromatographic baseline is neither at zero nor horizontal — a gradient
   * run drifts a few thousand counts between the first peak and the last — so
   * shading a peak down to the axis shades the column of baseline under it as
   * well, which at a weak peak is most of what the eye then reads as the peak.
   * Given the value the integration was corrected against, the shading and the
   * number in the table are about the same region.
   * @default 0
   */
  baseline?: number;
}

/**
 * The path of the region under a trace: its top edge, closed onto a baseline.
 *
 * `profilePath` draws where a trace went and stops there, so nothing built on
 * it can shade a region — and an integrated chromatographic peak, a UV band
 * and an NMR integral are all that same picture, a stretch of one trace filled
 * in to say how much of it was counted. The top edge is written exactly as
 * `profilePath` writes it, so an area drawn under a trace lies along it to the
 * hundredth of a pixel rather than a rounding apart from it.
 *
 * Each unbroken run of samples is closed on its own: down to the baseline
 * where it ended, back along the baseline to where it began, and shut. A run
 * of one sample encloses nothing and is left out altogether, which is what
 * stops a break in the data from shading a spike of zero width.
 *
 * Nothing is clipped here, exactly as in `profilePath` and `stickPath` — a
 * peak taller than the window keeps its whole area and the clip path over the
 * data band is what stops it at the edge.
 * @param x - Where each sample was taken, ascending.
 * @param y - What was measured there, one per sample.
 * @param xScale - The x axis as it is currently zoomed.
 * @param yScale - The y axis as it is currently zoomed, which the baseline is
 * read off.
 * @param options - Where the ground under the area is.
 * @returns The `d` of one path, holding one closed shape per unbroken run;
 * empty when there is nothing wide enough to enclose anything.
 */
export function areaPath(
  x: NumberArray,
  y: NumberArray,
  xScale: ChartScale,
  yScale: ChartScale,
  options: AreaPathOptions = {},
): string {
  const { baseline = 0 } = options;
  const ground = chartPixel(yScale, baseline);
  if (!Number.isFinite(ground)) return '';
  const foot = roundPixel(ground);
  const count = Math.min(x.length, y.length);
  // The two scales are read out here and the multiply-add written inline, as
  // `chartScale` asks a loop over points to: a trace is tens of thousands of
  // samples, and a helper call per sample per axis is the one cost this file
  // can avoid without changing what it draws.
  const { offset: xOffset, factor: xFactor } = xScale;
  const { offset: yOffset, factor: yFactor } = yScale;
  let path = '';
  let edge = '';
  let drawnInRun = 0;
  let runStart = 0;
  for (let index = 0; index < count; index++) {
    const pixelX = xOffset + (x[index] as number) * xFactor;
    const pixelY = yOffset + (y[index] as number) * yFactor;
    if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY)) {
      path += closedRun(edge, drawnInRun, runStart, foot);
      edge = '';
      drawnInRun = 0;
      continue;
    }
    const left = roundPixel(pixelX);
    const point = `${left} ${roundPixel(pixelY)}`;
    if (drawnInRun === 0) {
      edge = `M${point}`;
      runStart = left;
    } else if (drawnInRun === 1) {
      edge += `L${point}`;
    } else {
      edge += ` ${point}`;
    }
    drawnInRun++;
  }
  return path + closedRun(edge, drawnInRun, runStart, foot);
}

/**
 * Shut one run of samples down onto the baseline.
 * @param edge - The top edge of the run, as `profilePath` would have written it.
 * @param drawnInRun - How many samples that edge was drawn from.
 * @param runStart - Where the run began, in pixels.
 * @param foot - Where the baseline falls, in pixels.
 * @returns The closed shape, empty for a run of fewer than two samples, which
 * has no width and so encloses nothing.
 */
function closedRun(
  edge: string,
  drawnInRun: number,
  runStart: number,
  foot: number,
): string {
  if (drawnInRun < 2) return '';
  return `${edge}V${foot}H${runStart}Z`;
}

/** How many parts of a pixel a coordinate is written to. */
const PIXEL_PRECISION = 100;

/**
 * A coordinate as the path writes it.
 * @param value - Where the point falls, in pixels.
 * @returns The same place, to a hundredth of a pixel.
 */
function roundPixel(value: number): number {
  return Math.round(value * PIXEL_PRECISION) / PIXEL_PRECISION;
}
