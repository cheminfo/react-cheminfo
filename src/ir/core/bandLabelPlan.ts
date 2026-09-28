/**
 * Where every band's mark and label go, worked out before anything is drawn.
 *
 * Kept apart from the component because it is the part worth testing: which
 * bands get a label, which way their lines stack, how far a crowded label may
 * slide from the band it names, and which are dropped rather than drawn
 * somewhere misleading. All of that is arithmetic over numbers, and none of it
 * needs a DOM.
 */

import { layoutAnnotationBoxes } from '../../chart/core/boxLayout.ts';
import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartPixel } from '../../chart/core/chartScale.ts';
import { PEAK_LABEL } from '../../chart/core/chartTheme.ts';
import { labelStackBaselines } from '../../chart/core/labelStack.ts';

import type { AssignedBand } from './assignBands.ts';
import { bandLabel } from './assignBands.ts';
import type { IrBand } from './irBand.ts';
import { formatWavenumber } from './irFormat.ts';
import { bandsPointDown } from './irMode.ts';
import type { IrMode } from './irSpectrum.ts';

/** One band, and where everything about it is drawn. */
export interface BandLabelPlan {
  /** The band itself. */
  band: IrBand;
  /** Where its tip sits horizontally, in user units of the SVG. */
  tipX: number;
  /** Where its tip sits vertically. */
  tipY: number;
  /**
   * Where its label is centred, `NaN` when the label was dropped for having
   * been slid too far from the band to belong to it.
   */
  labelX: number;
  /** The baseline of each line of the label, in the order the lines are given. */
  baselines: Float64Array;
  /** What the label says, farthest line from the band first. */
  lines: string[];
}

/** What the plan is worked out from. */
export interface BandLabelPlanOptions {
  /** The bands to name, with whatever the table said about them. */
  assigned: readonly AssignedBand[];
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
  /** The wavenumber axis as it is currently zoomed. */
  xScale: ChartScale;
  /** The value axis as it is currently zoomed. */
  yScale: ChartScale;
  /** Which value axis is being drawn, which decides which way labels stack. */
  mode: IrMode;
  /**
   * Whether each label names the assignment as well as the wavenumber.
   *
   * The assignment is the longer line by far — `carboxylic acid C=O stretch`
   * against `1710` — so a chart showing a dozen bands is legible with the
   * wavenumbers alone and unreadable with both.
   * @default false
   */
  showAssignments?: boolean;
  /**
   * At most how many bands to name.
   *
   * Marks are drawn on every band regardless; this only bounds the labels, since
   * a mark costs three pixels and a two-line label costs sixty.
   * @default 12
   */
  limit?: number;
}

/**
 * Work out where every band's label goes.
 *
 * Only the bands inside the window are considered, so a zoom into one region
 * gives its bands the whole width to be named in rather than sharing it with the
 * hundred outside the plot.
 *
 * The strongest bands win the labels when there are more than `limit`, because a
 * strong band is the one a reader is looking for; but they come back in ascending
 * wavenumber — the order `pickBands` returns and the order a band table lists —
 * rather than in the order they were chosen. Which is right to left on screen,
 * since the axis is drawn backwards; nothing depends on it, because the declutter
 * sweep sorts by pixel itself.
 * @param options - The bands, the axes and how much to say.
 * @returns One plan per band that is inside the window, in axis order.
 */
export function planBandLabels(options: BandLabelPlanOptions): BandLabelPlan[] {
  const {
    assigned,
    plot,
    xScale,
    yScale,
    mode,
    showAssignments = false,
    limit = 12,
  } = options;

  const inside: AssignedBand[] = [];
  for (const entry of assigned) {
    const pixelX = chartPixel(xScale, entry.band.wavenumber);
    if (!Number.isFinite(pixelX)) continue;
    if (pixelX < plot.left || pixelX > plot.right) continue;
    inside.push(entry);
  }

  const named =
    inside.length <= limit
      ? inside
      : inside
          .toSorted(
            (first, second) => second.band.absorbance - first.band.absorbance,
          )
          .slice(0, limit)
          .toSorted(
            (first, second) => first.band.wavenumber - second.band.wavenumber,
          );

  const centres = new Float64Array(named.length);
  for (let index = 0; index < named.length; index++) {
    centres[index] = chartPixel(
      xScale,
      (named[index] as AssignedBand).band.wavenumber,
    );
  }
  const placed = layoutAnnotationBoxes(
    centres,
    [plot.left, plot.right],
    LABEL_WIDTH,
    LABEL_GAP,
  );

  const down = bandsPointDown(mode);
  const plans: BandLabelPlan[] = new Array<BandLabelPlan>(named.length);
  for (let index = 0; index < named.length; index++) {
    const entry = named[index] as AssignedBand;
    const lines = labelLines(entry, showAssignments);
    const tipY = chartPixel(
      yScale,
      mode === 'absorbance' ? entry.band.absorbance : entry.band.transmittance,
    );
    plans[index] = {
      band: entry.band,
      tipX: centres[index] as number,
      tipY,
      labelX: placed[index] as number,
      // The stack hangs away from the baseline: below the tip of a transmittance
      // band, which dips downwards, and above the tip of an absorbance one.
      baselines: labelStackBaselines(
        tipY,
        lines.length,
        [plot.top, plot.bottom],
        down,
      ),
      lines,
    };
  }
  return plans;
}

/**
 * How wide a label is taken to be while it is being spaced out.
 *
 * A wavenumber is four digits and an assignment is far wider, but the width used
 * for spacing is the wavenumber's: spacing on the longer line would push every
 * label so far apart that only three fit, and an assignment is only ever shown
 * when a handful of bands are named.
 */
export const LABEL_WIDTH = 34;

/** The clear space kept between two neighbouring labels. */
export const LABEL_GAP = 6;

/** How far the mark reaches from the tip of a band, in pixels. */
export const BAND_MARK = PEAK_LABEL.topMark;

/**
 * What one band's label says.
 * @param entry - The band and whatever the table said about it.
 * @param showAssignments - Whether to name the assignment as well.
 * @returns The lines, farthest from the band first, never empty.
 */
function labelLines(entry: AssignedBand, showAssignments: boolean): string[] {
  const lines = [formatWavenumber(entry.band.wavenumber)];
  if (!showAssignments) return lines;
  const label = bandLabel(entry);
  // The assignment goes nearest the band, under the wavenumber, so the eye
  // travels from the mark to what it is claimed to be.
  if (label !== null) lines.push(label);
  return lines;
}
