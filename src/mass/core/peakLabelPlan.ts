/**
 * Where every labelled peak's numbers go, worked out before anything is drawn.
 *
 * Which peaks are labelled is `selectLabelledPeaks`, and the slots it makes that
 * choice with are cut from the *window*: ten of them, whatever the chart is. A
 * label is not — it is a number set at a fixed size, and `527.1607` is fifty
 * pixels wide on a plot of any width. So a chart narrow enough for its slots to
 * be thinner than that hands back two peaks whose stacks are written one across
 * the other, and the two masses that result are neither.
 *
 * What settles it: **the taller peak keeps the room, and the fainter one goes
 * without**. Never a nudge sideways — on a chart, distance from a stick is the
 * only thing saying which stick a number belongs to, and a mass slid clear of
 * its neighbour is a mass now hanging over somebody else's peak. The peak that
 * loses its numbers keeps the mark on its tip, so it is not read as a peak the
 * spectrum lacks, and a zoom widens the room and brings its stack straight back.
 *
 * Kept out of the component so that which peak was labelled, and at what pixel,
 * is worth a test that no browser has to stand by for.
 */

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartPixel, chartValue } from '../../chart/core/chartScale.ts';
import { PEAK_LABEL } from '../../chart/core/chartTheme.ts';
import { labelStackBaselines } from '../../chart/core/labelStack.ts';

import type { StackBox } from './labelStackBox.ts';
import { labelStackBox } from './labelStackBox.ts';
import type { LabelledPeak } from './labelledPeaks.ts';
import { selectLabelledPeaks } from './labelledPeaks.ts';
import type { MassSpectrum } from './massSpectrum.ts';
import type { PeakLabelLine } from './peakLabelLines.ts';
import { peakKey, peakLabelLines } from './peakLabelLines.ts';

/** The clear space kept between two stacks standing side by side. */
export const LABEL_SPACING = 4;

/** One labelled peak: its stick, its numbers, and where both are drawn. */
export interface PeakLabelPlan {
  /** The peak being labelled. */
  peak: LabelledPeak;
  /** `${spectrumId}:${index}`, which is how anything said about it is found. */
  key: string;
  /** Where its stick stands, in pixels across the SVG. */
  tipX: number;
  /** Where the tip of that stick is, in pixels down the SVG. */
  tipY: number;
  /**
   * Where the stack is centred, which is over the tip unless the peak stands so
   * near the edge of the plot that its numbers would be written half outside it.
   * `NaN` for a peak crowded out of its numbers by a taller neighbour, which is
   * still marked — it simply is not written.
   */
  labelX: number;
  /** What the stack says, farthest line from the peak first. */
  lines: PeakLabelLine[];
  /** Where each of those lines is written, in the order the lines are in. */
  baselines: Float64Array;
  /** The room the stack takes, which is what answers the pointer. */
  box: StackBox;
}

/** What a set of stacks is planned against. */
export interface PlanPeakLabelsOptions {
  /** The spectrum whose peaks are labelled, as it is drawn. */
  spectrum: MassSpectrum;
  /** Where the plot sits, which is what a stack may not be written outside of. */
  plot: PlotRect;
  /** The m/z axis as it is currently zoomed. */
  xScale: ChartScale;
  /** The intensity axis as it is currently zoomed. */
  yScale: ChartScale;
  /**
   * How many peaks are labelled at most, the most intense first.
   * @default the selection's own default
   */
  limit?: number;
  /**
   * Whether a peak whose charge was established says so.
   * @default false
   */
  showCharges?: boolean;
  /**
   * How many decimals the masses on screen are written with.
   * @default 4
   */
  mzDecimals?: number;
  /**
   * What explains each peak, keyed as `peakKey` keys it.
   * @default undefined
   */
  annotationLabels?: ReadonlyMap<string, string>;
  /**
   * Whether the stacks hang under the sticks rather than standing over them,
   * which is what the lower half of a mirrored pair wants.
   * @default false
   */
  below?: boolean;
  /**
   * What one unit of the measured intensity is written as.
   * @default 1
   */
  intensityScale?: number;
}

/**
 * Plan the stacks for the window on screen.
 *
 * The crowding is settled before a single line is composed, and settled in
 * descending intensity: the tallest peak of the window asks for its stretch of
 * the axis first and keeps it, and every fainter peak standing closer than a
 * label is wide loses its `labelX`. What comes back is in ascending m/z, so the
 * drawing order is the axis order and a stack keeps its key from one render to
 * the next.
 * @param options - The spectrum, the axes, and what the stacks may say.
 * @returns One plan per peak that earned a label, in ascending m/z, those
 * crowded out among them.
 */
export function planPeakLabels(
  options: PlanPeakLabelsOptions,
): PeakLabelPlan[] {
  const {
    spectrum,
    plot,
    xScale,
    yScale,
    limit,
    showCharges = false,
    mzDecimals,
    annotationLabels,
    below = false,
    intensityScale = 1,
  } = options;

  const peaks = selectLabelledPeaks(spectrum, {
    from: chartValue(xScale, plot.left),
    to: chartValue(xScale, plot.right),
    // The far edge of the half this spectrum is drawn in: the top of the plot
    // for an ordinary chart, its bottom for a half drawn through a reflected
    // scale.
    maxValue: chartValue(yScale, below ? plot.bottom : plot.top),
    ...(limit === undefined ? {} : { limit }),
  });
  if (peaks.length === 0) return [];

  const centres = placeStacks(peaks, plot, xScale);
  const bounds: [number, number] = [plot.top, plot.bottom];
  const plans: PeakLabelPlan[] = [];
  for (let index = 0; index < peaks.length; index++) {
    const peak = peaks[index] as LabelledPeak;
    const key = peakKey(spectrum.id, peak.index);
    const lines = peakLabelLines(peak, {
      ...(mzDecimals === undefined ? {} : { mzDecimals }),
      showCharges,
      intensityScale,
      ...(annotationLabels === undefined
        ? {}
        : { annotationLabel: annotationLabels.get(key) }),
    });
    const tipY = chartPixel(yScale, peak.y);
    const labelX = centres[index] as number;
    const baselines = labelStackBaselines(tipY, lines.length, bounds, below);
    plans.push({
      peak,
      key,
      tipX: chartPixel(xScale, peak.x),
      tipY,
      labelX,
      lines,
      baselines,
      box: labelStackBox(labelX, baselines),
    });
  }
  return plans;
}

/**
 * Where each stack may stand, `NaN` for one crowded out by a taller peak.
 *
 * A stack whose peak stands at the very edge of the plot is slid back inside it
 * and never further, which is a different thing from clearing a neighbour: the
 * mark stays on the stick, the number moves by a few pixels rather than by its
 * own width, and what it avoids is being written half over the axis.
 * @param peaks - The peaks that earned a label, in ascending m/z.
 * @param plot - Where the plot sits inside the SVG.
 * @param xScale - The m/z axis as it is currently zoomed.
 * @returns The centre each stack was given, indexed as the peaks are.
 */
function placeStacks(
  peaks: readonly LabelledPeak[],
  plot: PlotRect,
  xScale: ChartScale,
): Float64Array {
  const half = PEAK_LABEL.hoverHalfWidth;
  const step = half * 2 + LABEL_SPACING;
  // A plot too narrow to hold one whole label has no inside to slide anything
  // back into, and the clamp would put every stack in the same place.
  const roomy = plot.width >= half * 2;
  const centres = new Float64Array(peaks.length).fill(Number.NaN);
  const placed: number[] = [];

  for (const index of tallestFirst(peaks)) {
    const wanted = chartPixel(xScale, (peaks[index] as LabelledPeak).x);
    const centre = roomy
      ? Math.min(Math.max(wanted, plot.left + half), plot.right - half)
      : wanted;
    if (!clearOfPlaced(placed, centre, step)) continue;
    placed.push(centre);
    centres[index] = centre;
  }
  return centres;
}

/**
 * The indices of the peaks, the tallest first — the order the room is handed
 * out in, so that a base peak is labelled on every chart it appears on.
 * @param peaks - The peaks that earned a label.
 * @returns Their indices, descending by intensity.
 */
function tallestFirst(peaks: readonly LabelledPeak[]): Uint32Array {
  const order = new Uint32Array(peaks.length);
  for (let index = 0; index < peaks.length; index++) order[index] = index;
  return order.toSorted(
    (first, second) =>
      (peaks[second] as LabelledPeak).y - (peaks[first] as LabelledPeak).y,
  );
}

/**
 * Whether a stack may stand where it wants to, given the ones already placed.
 * @param placed - The centres already given out, in pixels.
 * @param centre - The centre being asked for.
 * @param step - How far apart two centres have to be for both to be readable.
 * @returns Whether it clears every one of them.
 */
function clearOfPlaced(
  placed: readonly number[],
  centre: number,
  step: number,
): boolean {
  for (const taken of placed) {
    if (Math.abs(taken - centre) < step) return false;
  }
  return true;
}
